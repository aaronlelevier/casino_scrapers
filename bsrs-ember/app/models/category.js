import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import equal from 'bsrs-ember/utilities/equal';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import NewMixin from 'bsrs-ember/mixins/model/new';
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
});

var CategoryModel = Model.extend(NewMixin, Validations, TranslationMixin, OptConf, {
  init() {
    many_to_many.bind(this)('children', 'category');
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
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
      children: this.get('children_ids')
    };
  },
  parent: Ember.computed.alias('parent_belongs_to.firstObject').readOnly(),
  parent_belongs_to: Ember.computed('parent_id', function() {
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
    this._super(...arguments);
  },
  saveRelated() {
    this.saveChildren();
  }
});

export default CategoryModel;
