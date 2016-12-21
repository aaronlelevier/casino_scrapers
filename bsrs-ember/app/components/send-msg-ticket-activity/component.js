import Ember from 'ember';
const { computed, Component } = Ember;

var sendMsgTicketActivity = Ember.Component.extend({
  _activityTypeData(key) {
    let data;
    switch(this.get('activity.type')) {
      case 'send_sms':
        data = {
          messageType: 'Text message',
          faIcon: 'fa-mobile'
        };
        break;
      case 'send_email':
        data = {
          messageType:'Email',
          faIcon: 'fa-envelope'
        };
        break;
    }
    return data[key];
  },
  messageType: computed(function() {
    return this._activityTypeData('messageType');
  }),
  faIcon: computed(function() {
    return this._activityTypeData('faIcon');
  }),
  spliti18nString: computed(function() {
    const str = this.get('i18nString').string;
    return str.split('%s');
  }),
  sentTo: computed({
    get() { return this.get('spliti18nString')[0].trim(); }
  }),
  via: computed({
    get() { return this.get('spliti18nString')[1].trim(); }
  }),
  timestamp: computed({
    get() { return this.get('spliti18nString')[2].trim(); }
  }),
  ccs: computed(function() {
    return this.get('activity').get(this.get('activity.type'));
  }),
  classNames: ['activity-wrap']
});

export default sendMsgTicketActivity;
