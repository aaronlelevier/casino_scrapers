import Ember from 'ember';
const { computed } = Ember;
import { Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

//TODO: does this need to be a model
export default Model.extend({
  simpleStore: Ember.inject.service(),
  ticket: computed(function() {
    const store = this.get('simpleStore');
    return store.find('ticket', this.get('id'));
  }),
  isDirtyOrRelatedDirty: computed('ticket.isDirtyOrRelatedDirty', function() {
    return this.get('ticket').get('isDirtyOrRelatedDirty');
  }),
  isNotDirtyOrRelatedNotDirty: computed.not('isDirtyOrRelatedDirty'),
  status: computed(function() {
    const store = this.get('simpleStore');
    const ticket_status_list = store.find('general-status-list');
    return ticket_status_list.filter((ts) => {
      return Ember.$.inArray(this.get('id'), ts.get('tickets')) > -1;
    }).objectAt(0);
  }),
  priority: computed(function() {
    const store = this.get('simpleStore');
    const ticket_priority_list = store.find('ticket-priority-list');
    return ticket_priority_list.filter((tp) => {
      return Ember.$.inArray(this.get('id'), tp.get('tickets')) > -1;
    }).objectAt(0);
  }),
  status_class: computed('status', function(){
    const name = this.get('status.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  priority_class: computed('priority', function(){
    const name = this.get('priority.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  categories: computed(function() {
    const store = this.get('simpleStore');
    const categories = store.find('category-list');
    const category_ids = this.get('category_ids');
    const filtered_categories = categories.filter((cat) => {
      return Ember.$.inArray(cat.get('id'), category_ids) > -1;
    });
    const names = filtered_categories.sortBy('level').map((category) => {
      return category.get('name');
    }).join(' &#8226 ');
    return Ember.String.htmlSafe(names);
  }),
});
