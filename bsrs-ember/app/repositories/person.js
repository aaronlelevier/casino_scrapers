import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';
import injectUUID from 'bsrs-ember/utilities/uuid';

var run = Ember.run;
var PREFIX = config.APP.NAMESPACE;
var PEOPLE_URL = PREFIX + '/admin/people/';

export default Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'person'; }),
    url: Ember.computed(function() { return PEOPLE_URL; }),
    uuid: injectUUID('uuid'),
    PersonDeserializer: inject('person'),
    deserializer: Ember.computed.alias('PersonDeserializer'),
    create(new_pk) {
        let pk = this.get('uuid').v4();
        const store = this.get('store');
        const role = this.get('store').find('role').filter((role) => {
            return role.get('default') ? true : false;
        }).objectAt(0);
        const people = role.get('people') || [];
        let person;
        run(() => {
            person = store.push('person', {id: pk, new: true, new_pk: new_pk, role_fk: role.get('id')});
            store.push('role', {id: role.get('id'), people: people.concat(person.get('id'))});
            // role.set('people', people.concat(person.get('id')));
        });
        return person;
    },
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
    findTicketAssignee(search) {
        let url = PEOPLE_URL;
        search = search ? search.trim() : search;
        if (search) {
            url += `?fullname__icontains=${search}`;
            return PromiseMixin.xhr(url, 'GET').then((response) => {
                this.get('PersonDeserializer').deserialize(response);
                let filterFunc = function(person) {
                    let fullname = person.get('fullname');
                    return fullname.toLowerCase().indexOf(search.toLowerCase()) > -1 && !person.get('new');
                };
                return this.get('store').find('person', filterFunc, ['id']);
            });
        }
    },
    //TODO: refactor to one method that has text search across multiple fields
    findTicketPeople(search) {
        let url = PEOPLE_URL;
        search = search ? search.trim() : search;
        if (search) {
            url += `?fullname__icontains=${search}`;
            return PromiseMixin.xhr(url, 'GET').then((response) => {
                this.get('PersonDeserializer').deserialize(response);
                let filterFunc = function(person) {
                    let fullname = person.get('fullname');
                    return fullname.toLowerCase().indexOf(search.toLowerCase()) > -1 && !person.get('new');
                };
                return this.get('store').find('person', filterFunc, ['id']);
            });
        }
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
