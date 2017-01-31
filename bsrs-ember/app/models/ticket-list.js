import Ember from 'ember';
const { computed } = Ember;
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
  simpleStore: Ember.inject.service(),
  ticket: computed(function() {
    const store = this.get('simpleStore');
    return store.find('ticket', this.get('id'));
  }),
  isDirtyOrRelatedDirty: computed('ticket.isDirtyOrRelatedDirty', function() {
    return this.get('ticket').get('isDirtyOrRelatedDirty');
  }),
  isNotDirtyOrRelatedNotDirty: computed.not('isDirtyOrRelatedDirty'),
  status_class: computed('status', function(){
    const name = this.get('status.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  priority_class: computed('priority', function(){
    const name = this.get('priority.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
});
