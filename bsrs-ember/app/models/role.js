import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/role';

const { run } = Ember;

var RoleModel = Model.extend(NewMixin, OptConf, {
  init() {
    belongs_to.bind(this)('location_level', 'role', {'rollback': true});
    this._super(...arguments);
  },
  store: inject('main'),
  uuid: injectUUID('uuid'),
  name: attr(''),
  people: [],
  role_type: attr(),
  location_level_fk: undefined,
  // Settings
  welcome_text: attr(''),
  //DON'T make these attrs until they are tested
  // create_all: ,
  // login_grace: ,
  // company_name: ,
  settings:  Ember.computed(function() {
    return {
      welcome_text: this.get('welcome_text') || undefined
    };
  }),
  // Categories
  role_category_fks: [],
  categories_ids: Ember.computed('categories.[]', function() {
    return this.get('categories').mapBy('id').uniq();
  }),
  categories: many_models('role_categories', 'category_fk', 'category'),
  role_categories_ids: Ember.computed('role_categories.[]', function() {
    return this.get('role_categories').mapBy('id');
  }),
  role_categories: many_to_many('role-category', 'role_fk'),
  categoryIsDirty: many_to_many_dirty('role_categories_ids', 'role_category_fks'),
  categoryIsNotDirty: Ember.computed.not('categoryIsDirty'),
  add_category: add_many_to_many('role-category', 'category', 'category_fk', 'role_fk'),
  remove_category: remove_many_to_many('role-category', 'category_fk', 'role_categories'),
  // location_level: Ember.computed.alias('location_levels.firstObject'),
  // location_levels: belongs_to('roles', 'location-level'),
  // change_location_level: change_belongs_to_fk('roles', 'location-level', 'location_level'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'categoryIsDirty', function() {
    return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('categoryIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  // locationLevelIsDirty: belongs_to_dirty('location_level_fk', 'location_level'),
  // locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
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
      settings: this.get('settings')
    };
  },
  removeRecord() {
    run(() => {
      this.get('store').remove('role', this.get('id'));
    });
  },
  rollback() {
    this.rollbackLocationLevel();
    this.rollbackCategories();
    this._super();
  },
  saveRelated() {
    this.saveLocationLevel();
    this.saveCategories();
  },
  // saveLocationLevel: belongs_to_save('role', 'location_level', 'location_level_fk'),
  rollbackLocationLevel() {
    const location_level_fk = this.get('location_level_fk');
    this.change_location_level(location_level_fk);
  },
  saveCategories: many_to_many_save('role', 'role_categories', 'role_categories_ids', 'role_category_fks'),
  rollbackCategories: many_to_many_rollback('role-category', 'role_category_fks', 'role_fk'),
  toString: function() {
    const name = this.get('name');
    return name ? name : '';
  }
});

export default RoleModel;
