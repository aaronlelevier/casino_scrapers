import Ember from 'ember';

/**
 * Component has two API designs
 * 1. item - parent model (ticket), for ex// grid
 * 2. optionModel - the owning model, for ex// power select status
 */
var TicketStatusTag = Ember.Component.extend({
  tagName: 'span',
  className: Ember.computed('item.status', 'optionModel', function(){
    let tagClass;
    if(this.get('optionModel')) {
      tagClass = this.get('optionModel').get('name').replace(/\./g, '-');
    } else {
      const name = this.get('item.status.name');
      tagClass = name ? name.replace(/\./g, '-') : '';
      // tagClass = this.get('item.status_class');
    }
    return `tag ${tagClass}`;
  }),
  classNameBindings: ['className'],
  testId: 'status-tag',
  attributeBindings: ['testId:data-test-id'],
  entry: Ember.computed('item.status', 'optionModel', function() {
    if (this.get('optionModel')) {
      return this.get('optionModel');
    } else {
      return this.get('item.status');
    }
  }),
});

export default TicketStatusTag;
