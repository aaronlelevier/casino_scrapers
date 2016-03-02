import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to, change_belongs_to, change_belongs_to_simple, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-components/attr/belongs-to';

export default Model.extend({
    store: inject('main'),
    order: attr(''),
    action_button: attr(''),
    is_header: attr(''),
    request: attr(''),
    priority_fk: undefined,
    priority: Ember.computed.alias('belongs_to_priority.firstObject'),
    belongs_to_priority: belongs_to('links', 'ticket-priority'),
    priorityIsDirty: belongs_to_dirty('priority_fk', 'priority'),
    isDirtyOrRelatedDirty: Ember.computed('priorityIsDirty', function() {
        return this.get('isDirty') || this.get('priorityIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    change_priority: change_belongs_to('links', 'ticket-priority', 'priority'),
    serialize() {
        return {
            order: this.get('order'),
            action_button: this.get('action_button'),
            is_header: this.get('is_header'),
            request: this.get('request'),
            priority: this.get('priority.id')
        };
    }
});

