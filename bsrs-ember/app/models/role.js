import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/role';
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
});

var RoleModel = Model.extend(OptConf, NewMixin, Validations, {
  init() {
    belongs_to.bind(this)('location_level', 'role', {bootstrapped:true, rollback:false});
    many_to_many.bind(this)('category', 'role', {plural:true});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  uuid: injectUUID('uuid'),
  name: attr(''),
  people: [],
  role_type: attr(),
  location_level_fk: undefined,
  dashboard_text: attr(''),
  auth_amount: attr(),
  auth_currency: attr(),
  role_categories_fks: [],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'categoriesIsDirty', function() {
    return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('categoriesIsDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
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
      dashboard_text: this.get('dashboard_text')
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

export default RoleModel;
