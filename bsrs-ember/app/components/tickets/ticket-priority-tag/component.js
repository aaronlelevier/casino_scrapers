import Ember from 'ember';

var TicketPriorityTag = Ember.Component.extend({
    tagName: 'span',
    className: Ember.computed(function(){
        let tagClass = this.get('item.priority_class');
        return `tag ${tagClass}`;
    }),
    classNameBindings: ['className']
});

export default TicketPriorityTag;
