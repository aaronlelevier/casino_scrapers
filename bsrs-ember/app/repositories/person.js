import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

var create_people_with_relationships = (response, store, id) => {
    response.phone_numbers.forEach((phone_number) => {
        store.push('phone-number-type', phone_number.type);
        phone_number.type = phone_number.type.id;
        phone_number.person_id = id;
        store.push('phonenumber', phone_number);
    });
    response.addresses.forEach((address) => {
        store.push('address-type', address.type);
        // store.push('state', address.state);
        // store.push('country', address.country);
        address.type = address.type.id;
        address.person_id = id;
        store.push('address', address);
    });
    //discuss dirty attr for prop not included in the list
    //meaning ... if the user is dirty NOW what should do?
    delete response.phone_numbers;
    delete response.addresses;
    var originalPerson = store.push('person', response);
    originalPerson.save();
};

export default Ember.Object.extend({
    insert(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/', 'POST', {data: model.serialize()}).then(() => {
            model.save();
            model.savePhoneNumbers();
        });
    },
    update(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/' + model.get('id') + '/', 'PUT', {data: model.serialize()}).then(() => {
            model.save();
            model.savePhoneNumbers();
        });
    },
    find() {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/people/', 'GET').then((response) => {
            response.results.forEach((model) => {
                store.push('person', model);
            });
        });
        return store.find('person');
    },
    findById(id) {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/people/' + id + '/', 'GET').then((response) => {
            create_people_with_relationships(response, store, id);
        });
        return store.find('person', id);
    }
});
