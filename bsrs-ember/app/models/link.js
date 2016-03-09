import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import CategoriesMixin from 'bsrs-ember/mixins/model/ticket/category';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to, change_belongs_to, change_belongs_to_simple, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

var LinkModel = Model.extend(CategoriesMixin, {
    store: inject('main'),
    model_categories_fks: [],
    order: attr(''),
    action_button: attr(''),
    is_header: attr(''),
    request: attr(''),
    text: attr(''),
    // priority
    priority_fk: undefined,
    priority: Ember.computed.alias('belongs_to_priority.firstObject'),
    belongs_to_priority: belongs_to('links', 'ticket-priority'),
    priorityIsDirty: belongs_to_dirty('priority_fk', 'priority'),
    priorityIsNotDirty: Ember.computed.not('priorityIsDirty'),
    change_priority: change_belongs_to('links', 'ticket-priority', 'priority'),
    categoriesIsDirty: many_to_many_dirty('model_categories_ids', 'model_categories_fks'),
    categoriesIsNotDirty: Ember.computed.not('categoriesIsDirty'),
    // status
    status_fk: undefined,
    status: Ember.computed.alias('belongs_to_status.firstObject'),
    belongs_to_status: belongs_to('links', 'ticket-status'),
    statusIsDirty: belongs_to_dirty('status_fk', 'status'),
    statusIsNotDirty: Ember.computed.not('statusIsDirty'),
    change_status: change_belongs_to('links', 'ticket-status', 'status'),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'priorityIsDirty', 'statusIsDirty', 'categoriesIsDirty', function() {
        return this.get('isDirty') || this.get('priorityIsDirty') || this.get('statusIsDirty') || this.get('categoriesIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    savePriority: belongs_to_save('link', 'priority', 'priority_fk'),
    saveStatus: belongs_to_save('link', 'status', 'status_fk'),
    rollbackPriority: belongs_to_rollback('priority_fk', 'priority', 'change_priority'),
    rollbackRelated(){
        this.rollbackPriority();
        this.rollbackCategories();
    },
    saveRelated(){
        this.savePriority(); 
        this.saveStatus(); 
    },
    serialize() {
        return {
            id: this.get('id'),
            order: this.get('order'),
            action_button: this.get('action_button'),
            is_header: this.get('is_header'),
            request: this.get('request'),
            text: this.get('text'),
            priority: this.get('priority') ? this.get('priority.id') : null,
            status: this.get('status') ? this.get('status.id') : null,
        };
    }
});

export default LinkModel;
