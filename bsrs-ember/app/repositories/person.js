import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;

export default Ember.Object.extend({
    PersonDeserializer: inject('person'),
    insert(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/', 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.savePhoneNumbers();
            model.saveAddresses();
        });
    },
    update(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/' + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.savePhoneNumbers();
            model.saveAddresses();
        });
    },
    find() {
        PromiseMixin.xhr(PREFIX + '/admin/people/', 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response);
        });
        return this.get('store').find('person');
    },
    findById(id) {
        PromiseMixin.xhr(PREFIX + '/admin/people/' + id + '/', 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response, id);
        });
        return this.get('store').find('person', id);
    },
    delete(id) {
        PromiseMixin.xhr(PREFIX + '/admin/people/' + id + '/', 'DELETE');
        this.get('store').remove('person', id);
    }
});
