import Ember from 'ember';

var TicketActivityCreatorLink = Ember.Component.extend({
  tagName: 'span',
  linkText: Ember.computed(function() {
    const activity = this.get('activity');
    if (activity.get('person')) {
      return activity.get('person').get('fullname');
    } else if (activity.get('automation')) {
      return activity.get('automation').get('description');
    }
  })
});

export default TicketActivityCreatorLink;
