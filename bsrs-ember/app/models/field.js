import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import OptConf from 'bsrs-ember/mixins/optconfigure/field';
import { attr, Model } from 'ember-cli-simple-store/model';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_dirty_unlessAddedM2M, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';
import { rollbackAll } from 'bsrs-ember/utilities/rollback-all';

export default Model.extend(OptConf, {
  init() {
    many_to_many.bind(this)('option', 'field', {plural:true, dirty:true});
    this._super(...arguments);
  },
  store: inject('main'),
  label: attr(''),
  type: attr(''),
  types: [
    'admin.dtd.label.field.text',
    'admin.dtd.label.field.number',
    'admin.dtd.label.field.textarea',
    'admin.dtd.label.field.select',
    'admin.dtd.label.field.with_options',
    'admin.dtd.label.field.checkbox',
    'admin.dtd.label.field.file',
    'admin.dtd.label.field.asset_select',
    'admin.dtd.label.field.check_in',
    'admin.dtd.label.field.check_out',
  ],
  typesWithOptions: Ember.computed(function(){
    return [this.get('types')[3], this.get('types')[5]];
  }),
  typeDefault: Ember.computed(function(){
    return this.get('types')[0];
  }),
  required: attr(),
  order: attr(),
  field_option_fks: [],
  optionsIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('field_options'),
  optionsIsDirty: Ember.computed('options.@each.{isDirty}', 'optionsIsDirtyContainer', function() {
    const options = this.get('options');
    return options.isAny('isDirty') || this.get('optionsIsDirtyContainer');
  }),
  optionsIsNotDirty: Ember.computed.not('optionsIsDirty'),
  // dirty tracking
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'optionsIsDirty', function() {
    return this.get('isDirty') || this.get('optionsIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  saveRelated() {
    this.saveOptions();
    this.save();
  },
  rollback(){
    this.optionRollbackContainer();
    this.rollbackOptions();
    this._super();
  },
  optionRollbackContainer() {
    const options = this.get('options');
    rollbackAll(options);
  },
  removeRecord(){
    Ember.run(() => {
      this.get('store').remove('field', this.get('id'));
    });
  },
  serialize() {
    const options = this.get('options').map((option) => {
      return option.serialize();
    });
    return {
      id: this.get('id'),
      label: this.get('label'),
      type: this.get('type') ? this.get('type') : this.get('typeDefault'),
      required: this.get('required') ? true : false,
      order: this.get('order'),
      options: options
    };
  },
});
