import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import equal from 'bsrs-ember/utilities/equal';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import NewMixin from 'bsrs-ember/mixins/model/new';
import TranslationMixin from 'bsrs-ember/mixins/model/translation';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/category';

const { run } = Ember;

var CategoryModel = Model.extend(NewMixin, TranslationMixin, OptConf, {
  init() {
    many_to_many.bind(this)('children', 'category');
    this._super(...arguments);
  },
  store: inject('main'),
  uuid: injectUUID('uuid'),
  name: attr(''),
  description: attr(''),
  label: attr(''),
  subcategory_label: attr(''),
  cost_amount: attr(''),
  cost_code: attr(''),
  parent_id: undefined,
  category_children_fks: [],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'childrenIsDirty', function() {
    return this.get('isDirty') || this.get('childrenIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  serialize() {
    const cost_amount = this.get('cost_amount') || null;
    return {
      id: this.get('id'),
      name: this.get('name'),
      description: this.get('description'),
      cost_amount: cost_amount,
      cost_currency: this.get('cost_currency'),
      cost_code: this.get('cost_code'),
      label: this.get('label'),
      subcategory_label: this.get('subcategory_label'),
      parent: null,
      children: this.get('children_ids')
    };
  },
  //childrenIsDirty: many_to_many_dirty('category_children_ids', 'category_children_fks'),
  //childrenIsNotDirty: Ember.computed.not('childrenIsDirty'),
  ////m2m attr
  //children_ids: many_models_ids('children'),
  //children: many_models('category_children', 'children_pk', 'category'),
  //category_children_ids: many_to_many_ids('category_children'),
  //category_children: many_to_many('category-children', 'category_pk'),
  ////add m2m
  //add_children: add_many_to_many('category-children', 'category', 'children_pk', 'category_pk'),
  ////remove m2m
  //remove_children remove_many_to_many('category-children', 'children_pk', 'category_children'),
  //belongs to attr
  parent: Ember.computed.alias('parent_belongs_to.firstObject'),
  parent_belongs_to: Ember.computed('parent_id', function() {
    const parent_id = this.get('parent_id');
    const store = this.get('store');
    const filter = function(category) {
      return parent_id === category.get('id');
    };
    return store.find('category', filter);
  }),
  removeRecord() {
    run(() => {
      this.get('store').remove('category', this.get('id'));
    });
  },
  // rollbackChildren: many_to_many_rollback('category-children', 'category_children_fks', 'category_pk'),
  // saveChildren: many_to_many_save('category', 'category_children', 'category_children_ids', 'category_children_fks'),
  rollback() {
    this.rollbackChildren();
    this._super();
  },
  saveRelated() {
    this.saveChildren();
  }
});

export default CategoryModel;
