import Ember from 'ember';
const { get, computed, Component } = Ember;

export default Component.extend({
  classNames: ['activity-wrap', 't-activity-wrap'],

  smsMessageType: 'automation.actions.sms',
  smsFaIcon: 'fa-mobile',
  emailMessageType: 'automation.actions.email',
  emailFaIcon: 'fa-envelope',

  /**
   * @property messageType
   */
  messageType: computed(function() {
    const type = get(this, 'activity.type');
    return type === 'send_sms' ? this.smsMessageType : this.emailMessageType;
  }),
  /**
   * @property faIcon
   */
  faIcon: computed(function() {
    const type = get(this, 'activity.type');
    return type === 'send_sms' ? this.smsFaIcon : this.emailFaIcon;
  }),
  spliti18nString: computed(function() {
    const str = get(this, 'i18nString').string;
    return str.split('%s');
  }),
  /**
   * - eg. 'sent to'
   * @property sentTo
   */
  sentTo: computed({
    get() { return get(this, 'spliti18nString')[0].trim(); }
  }),
  /**
   * - eg. 'via'
   * @property via
   */
  via: computed({
    get() { return get(this, 'spliti18nString')[1].trim(); }
  }),
  /**
   * @property timestamp
   */
  timestamp: computed({
    get() { return get(this, 'spliti18nString')[2].trim(); }
  }),
  /**
   * comma delimited names with comma after last one
   * m2m on activity model (many send_sms/send_email)
   * @property ccs
   */
  ccs: computed(function() {
    return get(this, 'activity').get(get(this, 'activity.type'));
  })
});
