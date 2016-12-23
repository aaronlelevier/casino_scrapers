import Ember from 'ember';

/**
 * Component has two API designs
 * 1. item - parent model (ticket), for ex// grid
 * 2. optionModel - the owning model, for ex// power select priority
 * @class TicketPriorityTag
 */
var TicketPriorityTag = Ember.Component.extend({
  tagName: 'span',
  className: Ember.computed('item.priority', 'optionModel', function() {
    let tagClass;
    if (this.get('optionModel')) {
      tagClass = this.get('optionModel').get('name').replace(/\./g, '-');
    } else {
      const name = this.get('item.priority.name');
      tagClass = name ? name.replace(/\./g, '-') : '';
      // tagClass = this.get('item.priority_class');
    }
    return `tag ${tagClass}`;
  }),
  classNameBindings: ['className'],
  testId: 'priority-tag',
  attributeBindings: ['testId:data-test-id'],
  entry: Ember.computed('item.priority', 'optionModel', function() {
    if (this.get('optionModel')) {
      return this.get('optionModel');
    } else {
      return this.get('item.priority');
    }
  }),
});

export default TicketPriorityTag;
