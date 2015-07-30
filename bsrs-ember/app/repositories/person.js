import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import Deserialize from 'bsrs-ember/deserializers/person';

var PREFIX = config.APP.NAMESPACE;

export default Ember.Object.extend({
    insert(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/', 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.savePhoneNumbers();
        });
    },
    update(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/' + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
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
            Deserialize(response, store, id);
        });
        return store.find('person', id);
    }
});
