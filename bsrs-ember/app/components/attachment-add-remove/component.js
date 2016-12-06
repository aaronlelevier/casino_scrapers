import Ember from 'ember';
const { computed, Component } = Ember;

var attachmentAddRemove = Ember.Component.extend({
  spliti18nString: computed(function() {
    const str = this.get('i18nString').string;
    return str.split('%s');
  }),
  begString: computed({
    get() { return this.get('spliti18nString')[0].trim(); }
  }),
  count: computed({
    get() { return this.get('spliti18nString')[1].trim(); }
  }),
  timestamp: computed({
    get() { return this.get('spliti18nString')[2].trim(); }
  }),
  person: Ember.computed(function() {
    return this.get('activity').get('person').get('fullname');
  }),
  attachments: Ember.computed(function() {
    const activity = this.get('activity');
    let attachments;
    if (activity.type === 'attachment_add') {
      attachments = activity.get('added_attachment');
    }else{
      attachments = activity.get('removed_attachment');
    }
    return attachments;
  }),
  classNames: ['activity-wrap']
});

export default attachmentAddRemove;
