import Ember from 'ember';
const { run, get } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import equal from 'bsrs-ember/utilities/equal';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import TranslationMixin from 'bsrs-ember/mixins/model/translation';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/category';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  name: validator('presence', {
    presence: true,
    message: 'errors.category.name'
  }),
  cost_amount: validator('category-cost-amount'),
});

var CategoryModel = Model.extend(Validations, TranslationMixin, OptConf, {
  init() {
    many_to_many.bind(this)('children', 'category');
    belongs_to.bind(this)('parent', 'category');
    belongs_to.bind(this)('sccategory', 'category');
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  uuid: injectUUID('uuid'),
  name: attr(''),
  description: attr(''),
  label: attr(''),
  subcategory_label: attr(''),
  cost_amount: attr(''),
  cost_amount_or_inherited: Ember.computed(function() {
    return get(this, 'cost_amount') ? get(this, 'cost_amount') : get(this, 'inherited.cost_amount.inherited_value');
  }),
  cost_code: attr(''),
  parent_id: undefined,
  category_children_fks: [],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'childrenIsDirty', 'sccategoryIsDirty', 'parentIsDirty', function() {
    return this.get('isDirty') || this.get('childrenIsDirty') || this.get('sccategoryIsDirty') || this.get('parentIsDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty').readOnly(),
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
      children: this.get('children_ids'),
      sc_category: this.get('sccategory.id'),
      parent: this.get('parent.id')
    };
  },
  ticketparent: Ember.computed.alias('ticketparent_belongs_to.firstObject').readOnly(),
  ticketparent_belongs_to: Ember.computed('parent_id', function() {
    const { parent_id, simpleStore } = this.getProperties('parent_id', 'simpleStore');
    const filter = function(category) {
      return parent_id === category.get('id');
    };
    return simpleStore.find('category', filter);
  }).readOnly(),
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('category', this.get('id'));
    });
  },
  rollback() {
    this.rollbackChildren();
    this.rollbackParent();
    this.rollbackSccategory();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveChildren();
    this.saveParent();
    this.saveSccategory();
  }
});

export default CategoryModel;
