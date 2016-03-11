import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

export default Model.extend({
    store: inject('main'),
    label: attr(''),
    type: attr(''),
    required: attr(),
    // options
    field_option_fks: [],
    options: many_models('field_options', 'option_pk', 'option'),
    field_options: many_to_many('field-option', 'field_pk'),
    add_option: add_many_to_many('field-option', 'option', 'option_pk', 'field_pk'),
    remove_option: remove_many_to_many('field-option', 'option_pk', 'field_options'),
    field_option_ids: many_to_many_ids('field_options'),
    // dirty tracking
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'optionsIsDirty', function() {
        return this.get('isDirty') || this.get('optionsIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    optionsIsDirtyContainer: many_to_many_dirty('field_option_ids', 'field_option_fks'),
    optionsIsDirty: Ember.computed('options.@each.{isDirty}', 'optionsIsDirtyContainer', function() {
        const options = this.get('options');
        return options.isAny('isDirty') || this.get('optionsIsDirtyContainer');
    }),
    optionsIsNotDirty: Ember.computed.not('optionsIsDirty')
});
