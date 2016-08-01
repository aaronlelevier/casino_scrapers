import Ember from 'ember';
const { run } = Ember;
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import { ROLES_URL } from 'bsrs-ember/utilities/urls';

var RoleRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'role',
  typeGrid: 'role-list',
  garbage_collection: ['role-list'],
  url: ROLES_URL,
  uuid: injectUUID('uuid'),
  simpleStore: Ember.inject.service(),
  RoleDeserializer: inject('role'),
  deserializer: Ember.computed.alias('RoleDeserializer'),
  // TODO: may be able to user ``CRUDMixin.create`` method if ``role_type`` is passed as the 2nd arg as an object
  create(role_type, new_pk) {
    const store = this.get('simpleStore');
    const pk = this.get('uuid').v4();
    let role;
    run(() => {
      role = store.push('role', {id: pk, role_type: role_type, new: true, new_pk: new_pk});
    });
    return role;
  },
  get_default() {
    return this.get('simpleStore').find('role');
  },
  /* @method getRouteData
  * gets settings data such as dashboard_text
  */
  getRouteData() {
    return PromiseMixin.xhr(ROLES_URL + 'route-data/new/', 'GET').then((response) => {
      return response;
    });
  }
});

export default RoleRepo;
