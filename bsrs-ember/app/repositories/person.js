import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var PEOPLE_URL = PREFIX + '/admin/people/';

export default Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'person'; }),
    url: Ember.computed(function() { return PEOPLE_URL; }),
    PersonDeserializer: inject('person'),
    deserializer: Ember.computed.alias('PersonDeserializer'),
    insert(model) {
        return PromiseMixin.xhr(PEOPLE_URL, 'POST', {data: JSON.stringify(model.createSerialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    update(model) {
        return PromiseMixin.xhr(PEOPLE_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    find() {
        PromiseMixin.xhr(PEOPLE_URL, 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response);
        });
        return this.get('store').find('person');
    },
    findById(id) {
        PromiseMixin.xhr(PEOPLE_URL + id + '/', 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response, id);
        });
        return this.get('store').find('person', id);
    },
    delete(id) {
        PromiseMixin.xhr(PEOPLE_URL + id + '/', 'DELETE');
        this.get('store').remove('person', id);
    }
});
