import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import CategoriesMixin from 'bsrs-ember/mixins/model/category';
import OptConf from 'bsrs-ember/mixins/optconfigure/link';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  text: validator('presence', {
    presence: true,
    message: 'errors.link.text'
  }),
});

var LinkModel = Model.extend(CategoriesMixin, Validations, OptConf, {
  init() {
    belongs_to.bind(this)('status', 'link', {bootstrapped:true});
    belongs_to.bind(this)('priority', 'link');
    belongs_to.bind(this)('destination', 'link');
    many_to_many.bind(this)('category', 'model', {plural:true, add_func:false});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  model_categories_fks: [],
  order: attr(''),
  action_button: attr(''),
  is_header: attr(false),
  request: attr(''),
  text: attr(''),
  priority_fk: undefined,
  status_fk: undefined,
  destination_fk: undefined,
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'priorityIsDirty', 'statusIsDirty', 'categoriesIsDirty', 'destinationIsDirty', function() {
    return this.get('isDirty') || this.get('priorityIsDirty') || this.get('statusIsDirty') || this.get('categoriesIsDirty') || this.get('destinationIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback(){
    this.rollbackPriority();
    this.rollbackStatus();
    this.rollbackDestination();
    this.rollbackCategories();
    this._super(...arguments);
  },
  save(){
    this.savePriority();
    this.saveStatus();
    this.saveDestination();
    this.saveCategories();
    this._super(...arguments);
  },
  serialize() {
    return {
      id: this.get('id'),
      order: this.get('order'),
      action_button: this.get('action_button'),
      is_header: this.get('is_header') || false,
      request: this.get('request'),
      text: this.get('text'),
      priority: this.get('priority.id'),
      status: this.get('status.id'),
      destination: this.get('destination.id'),
      categories: this.get('sorted_categories').mapBy('id'),
    };
  },
});

export default LinkModel;
