import Ember from 'ember';

var TicketStatusTagPs = Ember.Component.extend({
  tagName: 'span',
  className: Ember.computed('optionModel', function(){
    const tagClass = this.get('optionModel').get('name').replace(/\./g, '-');
    return `tag ${tagClass}`;
  }),
  classNameBindings: ['className'],
  testId: 'status-tag',
  attributeBindings: ['testId:data-test-id'],
});

export default TicketStatusTagPs;
