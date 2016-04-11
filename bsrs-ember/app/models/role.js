import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/role';

const { run } = Ember;

var RoleModel = Model.extend(NewMixin, OptConf, {
  init() {
    belongs_to.bind(this)('location_level', 'role', {rollback:false});
    many_to_many.bind(this)('category', 'role', {plural:true});
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
  role_categories_fks: [],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'categoriesIsDirty', function() {
    return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('categoriesIsDirty');
  }),
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
