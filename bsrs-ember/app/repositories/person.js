import Ember from 'ember';
const { run } = Ember;
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectRepo from 'bsrs-ember/utilities/inject';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import injectUUID from 'bsrs-ember/utilities/uuid';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import { PEOPLE_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'person',
  typeGrid: 'person-list',
  garbage_collection: ['person-list', 'person-status-list'],
  url: PEOPLE_URL,
  uuid: injectUUID('uuid'),
  PersonDeserializer: inject('person'),
  deserializer: Ember.computed.alias('PersonDeserializer'),
  create(new_pk) {
    const pk = this.get('uuid').v4();
    const store = this.get('simpleStore');
    const role = this.get('simpleStore').find('role').filter((role) => {
      return role.get('default') ? true : false;
    }).objectAt(0);
    const people = role.get('people') || [];
    let person;
    run(() => {
      person = store.push('person', {id: pk, new: true, new_pk: new_pk, role_fk: role.get('id')});
      store.push('role', {id: role.get('id'), people: people.concat(person.get('id'))});
    });
    return person;
  },
  insert(model) {
    return PromiseMixin.xhr(PEOPLE_URL, 'POST', {data: JSON.stringify(model.createSerialize())}).then(() => {
      model.set('new', undefined);
      model.set('new_pk', undefined);
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
  findUsername(username) {
    const url = `${PEOPLE_URL}?username=${username}`;
    return PromiseMixin.xhr(url, 'GET');
  },
  // CC && Assignee
  findPeople(search) {
    let url = PEOPLE_URL;
    search = search ? search.trim() : search;
    if (search) {
      url += `person__icontains=${search}/`;
      return PromiseMixin.xhr(url, 'GET').then((response) => {
        return response.results;
      });
    }
  }
});
