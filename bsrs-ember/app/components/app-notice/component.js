import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { computed, run } = Ember;

export default Ember.Component.extend({
  tagName: 'app-notice',
  classNames: ['animated-fast'],
  classNameBindings: [
    'isError:app-notice--error',
    'isWarning:app-notice--warning',
    'isInfo:app-notice--info',
    /* TODO add use cases for various error types…
    'isCritical:app-notice--critical',
    'isSuccess:app-notice--success',
    */
    'slideOutUp:slideOutUp',
    'slideInDown:slideInDown'
  ],
  /* TODO add use cases for various error types…
  isCritical: computed.equal('noticeLevel', 'critical'),
  isSuccess: computed.equal('noticeLevel', 'success'),
  */
  isError: computed.equal('noticeLevel', 'error'),
  isWarning: computed.equal('noticeLevel', 'warning'),
  isInfo: computed.equal('noticeLevel', 'info'),
  slideOutUp: false,
  slideInDown: true,

  /*
    Type of notice, e.g. critical, error, warning, success, info

    @property noticeLevel
    @type String
  */
  noticeLevel: computed({
    get(key) {
      return this[`__${key}`];
    },
    set(key, value) {
      if (this._levels.includes(value)) {
        this[`__${key}`] = value;
      }
      return this.get(`__${key}`);
    }
  }),
  __noticeLevel: 'error',
  _levels: Ember.String.w('error warning info'/* critical success'*/),

  click() {
    this.toggleProperty('slideOutUp');
    this.toggleProperty('slideInDown');
    run.later(this, 'send', 'dismiss', config.APP.ANIMATION_TIME);
  },

  actions: {
    dismiss() {
      this.get('on-dismiss')();
    }
  }
});
