import Ember from 'ember';

var TicketPriorityTag = Ember.Component.extend({
  tagName: 'span',
  className: Ember.computed('item.priority', function(){
    let tagClass = this.get('item.priority_class');
    return `tag ${tagClass}`;
  }),
  classNameBindings: ['className'],
  testId: 'priority-tag',
  attributeBindings: ['testId:data-test-id'],
});

export default TicketPriorityTag;
