import Ember from 'ember';
const { run, set, get } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/role';
import { RESOURCES_WITH_PERMISSION, PERMISSION_PREFIXES } from 'bsrs-ember/utilities/constants';
import { eachPermission } from 'bsrs-ember/utilities/permissions';
import { validator, buildValidations } from 'ember-cp-validations';
const Validations = buildValidations({
  name: validator('presence', {
    presence: true,
    message: 'errors.role.name'
  }),
  location_level: validator('presence', {
    presence: true,
    message: 'errors.role.location_level'
  }),
  auth_amount: validator('presence', {
    presence: true,
    message: 'errors.role.auth_amount'
  }),
});

function permissionAttributes() {
  let perms = {};
  RESOURCES_WITH_PERMISSION.forEach((resource) => {
    perms[`permissions_view_${resource}`] = attr();
    perms[`permissions_add_${resource}`] = attr();
    perms[`permissions_change_${resource}`] = attr();
    perms[`permissions_delete_${resource}`] = attr();
  });
  return perms;
}
let Permissions = Ember.Mixin.create(permissionAttributes());

let RoleModel = Model.extend(OptConf, Validations, Permissions, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('location_level', 'role', {bootstrapped:true, rollback:false});
    many_to_many.bind(this)('category', 'role', {plural:true});
    set(this, 'role_categories_fks', get(this, 'role_categories_fks') || []);
    set(this, 'people', get(this, 'people') || []);
  },
  simpleStore: Ember.inject.service(),
  uuid: injectUUID('uuid'),
  name: attr(''),
  role_type: attr(),
  location_level_fk: undefined,
  dashboard_text: attr(''),
  auth_amount: attr(),
  auth_currency: attr(),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'categoriesIsDirty', function() {
    return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('categoriesIsDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty').readOnly(),
  permissions: Ember.computed({
    get() {
      let props = {};
      let perms = eachPermission((resource, prefix) => {
        let key = `permissions_${prefix}_${resource}`;
        props[`${prefix}_${resource}`] = this.get(key);
      });
      return props;
    }
  }),
  serialize() {
    const location_level = this.get('location_level');
    let location_level_id;
    if (location_level) {
      location_level_id = location_level.get('id');
    }
    return {
      id: this.get('id'),
      name: this.get('name'),
      role_type: this.get('role_type'),
      location_level: location_level_id || null,
      categories: this.get('categories_ids'),
      auth_amount: this.get('auth_amount') ? this.get('auth_amount') : 0.0000,
      auth_currency: this.get('auth_currency'),
      dashboard_text: this.get('dashboard_text'),
      permissions: this.get('permissions')
    };
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('role', this.get('id'));
    });
  },
  rollback() {
    this.rollbackLocationLevel();
    this.rollbackCategories();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveLocationLevel();
    this.saveCategories();
  },
  rollbackLocationLevel() {
    const location_level_fk = this.get('location_level_fk');
    this.change_location_level(location_level_fk);
  },
  toString: function() {
    const name = this.get('name');
    return name ? name : '';
  }
});

RoleModel.reopenClass({
  getDefaults(pk, role_type, new_pk) {
    let props = {
      id: pk,
      auth_amount: 0,
      role_type: role_type,
      new: true,
      new_pk: new_pk
    };
    RoleModel.setDefaultPermissions(props);
    return props;
  },
  setDefaultPermissions(props) {
    eachPermission((resource, prefix) => {
      let prop = `permissions_${prefix}_${resource}`;
      props[prop] = (prefix === 'delete') ? false : true;
    });
  }
});

export default RoleModel;
