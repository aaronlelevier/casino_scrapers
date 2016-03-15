import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

export default Model.extend({
    store: inject('main'),
    label: attr(''),
    type: attr(''),
    required: attr(),
    // Options
    options: many_models('field_options', 'option_pk', 'option'),
    field_options: many_to_many('field-option', 'field_pk'),
    field_option_ids: many_to_many_ids('field_options'),
    field_option_fks: [],
    add_option: add_many_to_many('field-option', 'option', 'option_pk', 'field_pk'),
    remove_option: remove_many_to_many('field-option', 'option_pk', 'field_options'),
    optionsIsDirtyContainer: many_to_many_dirty('field_option_ids', 'field_option_fks'),
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
    saveOptions: many_to_many_save('field', 'field_options', 'field_option_ids', 'field_option_fks'),
    rollbackRelated() {
        this.optionRollbackContainer();
        this.optionRollback();
    },
    optionRollbackContainer() {
        const options = this.get('options');
        options.forEach((option) => {
            option.rollback();
        });
    },
    optionRollback: many_to_many_rollback('field-option', 'field_option_fks', 'field_pk'),
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
            type: this.get('type'),
            required: this.get('required'),
            options: options
        };
    },
});
