import Ember from 'ember';

var TicketStatusTag = Ember.Component.extend({
    tagName: 'span',
    className: Ember.computed(function(){
        let tagClass = this.get('item.status_class');
        return `tag ${tagClass}`;
    }),
    classNameBindings: ['className']
});

export default TicketStatusTag;
