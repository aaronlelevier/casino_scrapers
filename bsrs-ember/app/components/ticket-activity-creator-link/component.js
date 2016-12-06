import Ember from 'ember';

var TicketActivityCreatorLink = Ember.Component.extend({
  linkText: Ember.computed(function() {
    const activity = this.get('activity');
    if (activity.get('person')) {
      return activity.get('person').get('fullname');
    } else if (activity.get('automation')) {
      return activity.automation.description;
    }
  }),
  classNames: ['activity-wrap']
});

export default TicketActivityCreatorLink;
