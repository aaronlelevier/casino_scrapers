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
            model.saveRelated();
            model.save();
        });
    },
    update(model) {
        return PromiseMixin.xhr(PEOPLE_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.saveRelated();
            model.save();
        });
    },
    findTicketPeople(search_criteria) {
        let url = PEOPLE_URL;
        if (search_criteria) {
            url += `?fullname__icontains=${search_criteria}`;
        }
        PromiseMixin.xhr(url, 'GET').then((response) => {
            if (!response) {
                this.get('PersonDeserializer').deserialize(response);
            }
        });
        let filterFunc = function(person) {
            let fullname = person.get('fullname');
            return fullname.toLowerCase().includes(search_criteria.toLowerCase()) === true; 
        };
        //ensure person returned from store has substring in fullname
        return this.get('store').find('person', filterFunc, ['id']);
    },
    find() {
        PromiseMixin.xhr(PEOPLE_URL, 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response);
        });
        return this.get('store').find('person');
    },
    findById(id) {
        let model = this.get('store').find('person', id);
        model.id = id;
        PromiseMixin.xhr(PEOPLE_URL + id + '/', 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response, id);
        });
        return model;
    },
    delete(id) {
        PromiseMixin.xhr(PEOPLE_URL + id + '/', 'DELETE');
        this.get('store').remove('person', id);
    }
});
