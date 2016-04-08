import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import CategoriesMixin from 'bsrs-ember/mixins/model/ticket/category';
import OptConf from 'bsrs-ember/mixins/optconfigure/link';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  text: validator('presence', {
    presence: true,
    message: 'Text must be provided'
  }),
});

var LinkModel = Model.extend(CategoriesMixin, Validations, OptConf, {
  init() {
    belongs_to.bind(this)('status', 'link');
    belongs_to.bind(this)('priority', 'link');
    belongs_to.bind(this)('destination', 'link', {'bootstrapped':false});
    this._super(...arguments);
  },
  store: inject('main'),
  model_categories_fks: [],
  order: attr(''),
  action_button: attr(''),
  is_header: attr(false),
  request: attr(''),
  text: attr(''),
  // priority
  priority_fk: undefined,
  // categories
  categoriesIsDirty: many_to_many_dirty('model_categories_ids', 'model_categories_fks'),
  categoriesIsNotDirty: Ember.computed.not('categoriesIsDirty'),
  // status
  status_fk: undefined,
  // destination
  destination_fk: undefined,
  // dirty tracking
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'priorityIsDirty', 'statusIsDirty', 'categoriesIsDirty', 'destinationIsDirty', function() {
    return this.get('isDirty') || this.get('priorityIsDirty') || this.get('statusIsDirty') || this.get('categoriesIsDirty') || this.get('destinationIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback(){
    this.rollbackPriority();
    this.rollbackDestination();
    this.rollbackCategories();
    this._super();
  },
  save(){
    this.savePriority();
    this.saveStatus();
    this.saveDestination();
    this._super();
  },
  serialize() {
    return {
      id: this.get('id'),
      order: this.get('order'),
      action_button: this.get('action_button'),
      is_header: this.get('is_header') || false,
      request: this.get('request'),
      text: this.get('text'),
      priority: this.get('priority.id') || null,
      status: this.get('status.id') || null,
      destination: this.get('destination.id') || null,
      categories: this.get('sorted_categories').mapBy('id'),
    };
  },
  saved: false,
  textErrorMsg: Ember.computed('saved', function(){
    return this.get('validations.isValid') ? undefined : this.get('saved') ?
      this.get('validations.attrs.text.message') : undefined;
  })
});

export default LinkModel;
