import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectRepo from 'bsrs-ember/utilities/inject';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import injectUUID from 'bsrs-ember/utilities/uuid';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;
var PEOPLE_URL = `${PREFIX}/admin/people/`;

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: Ember.computed(function() { return 'person'; }),
  typeGrid: Ember.computed(function() { return 'person-list'; }),
  garbage_collection: Ember.computed(function() { return ['person-list', 'person-status-list']; }),
  url: Ember.computed(function() { return PEOPLE_URL; }),
  uuid: injectUUID('uuid'),
  PersonDeserializer: inject('person'),
  deserializer: Ember.computed.alias('PersonDeserializer'),
  status_repo: injectRepo('status'),
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
        return response.results.filter((assignee) => {
          const fullname = `${assignee.first_name} ${assignee.last_name}`;
          return fullname.toLowerCase().indexOf(search.toLowerCase()) > -1;
        });
      });
    }
  },
  findUsername(username) {
    const url = `${PEOPLE_URL}?username=${username}`;
    return PromiseMixin.xhr(url, 'GET');
  },
  //TODO: refactor to one method that has text search across multiple fields
  findTicketPeople(search) {
    let url = PEOPLE_URL;
    search = search ? search.trim() : search;
    if (search) {
      url += `?fullname__icontains=${search}`;
      return PromiseMixin.xhr(url, 'GET').then((response) => {
        return response.results.filter((person) => {
          const fullname = `${person.first_name} ${person.last_name}`;
          return fullname.toLowerCase().indexOf(search.toLowerCase()) > -1;
        });
      });
    }
  }
});
