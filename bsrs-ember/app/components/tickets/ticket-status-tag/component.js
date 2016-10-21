import Ember from 'ember';

var TicketStatusTag = Ember.Component.extend({
  tagName: 'span',
  className: Ember.computed('item.status', function(){
    let tagClass = this.get('item.status_class');
    return `tag ${tagClass}`;
  }),
  classNameBindings: ['className'],
  testId: 'status-tag',
  attributeBindings: ['testId:data-test-id'],
});

export default TicketStatusTag;
