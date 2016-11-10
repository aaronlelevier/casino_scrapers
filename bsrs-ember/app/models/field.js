import Ember from 'ember';
const { run, set, get } = Ember;
import inject from 'bsrs-ember/utilities/store';
import OptConf from 'bsrs-ember/mixins/optconfigure/field';
import { attr, Model } from 'ember-cli-simple-store/model';
import { many_to_many, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';

export default Model.extend(OptConf, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('option', 'field', {plural:true, dirty:false});
    set(this, 'field_option_fks', get(this, 'field_option_fks') || []);
  },
  simpleStore: Ember.inject.service(),
  label: attr(''),
  type: attr(''),
  types: [
    'admin.dtd.label.field.text',
    'admin.dtd.label.field.number',
    'admin.dtd.label.field.textarea',
    'admin.dtd.label.field.select',
    'admin.dtd.label.field.checkbox',
    'admin.dtd.label.field.file',
    'admin.dtd.label.field.asset_select',
    'admin.dtd.label.field.check_in',
    'admin.dtd.label.field.check_out',
  ],
  typesWithOptions: Ember.computed(function(){
    return [this.get('types')[3], this.get('types')[4]];
  }),
  typeDefault: Ember.computed(function(){
    return this.get('types')[0];
  }),
  required: attr(),
  //TODO: test for empty string
  order: attr(),
  optionsIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('field_options'),
  optionsIsDirty: Ember.computed('options.@each.{isDirty}', 'optionsIsDirtyContainer', function() {
    const options = this.get('options');
    return options.isAny('isDirty') || this.get('optionsIsDirtyContainer');
  }),
  optionsIsNotDirty: Ember.computed.not('optionsIsDirty'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'optionsIsDirty', function() {
    return this.get('isDirty') || this.get('optionsIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  saveRelated() {
    this.saveOptions();
    this.saveOptionsContainer();
    this.save();
  },
  rollback(){
    this.optionRollbackContainer();
    this.rollbackOptions();
    this._super(...arguments);
  },
  optionRollbackContainer() {
    const options = this.get('options');
    options.forEach((model) => {
      model.rollback();
    });
  },
  saveOptionsContainer() {
    const options = this.get('options');
    options.forEach((option) => {
      option.save();
    });
  },
  removeRecord(){
    run(() => {
      this.get('simpleStore').remove('field', this.get('id'));
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
