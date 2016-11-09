import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { computed, get, run } = Ember;

export default Ember.Component.extend({
  tagName: 'app-notice',
  classNames: ['animated-fast'],
  classNameBindings: [
    'isCritical:app-notice--critical',
    'isError:app-notice--error',
    'isWarning:app-notice--warning',
    'isInfo:app-notice--info',
    'isSuccess:app-notice--success',
    'slideOutUp:slideOutUp',
    'slideInDown:slideInDown'
  ],
  isCritical: computed.equal('noticeLevel', 'critical'),
  isError: computed.equal('noticeLevel', 'error'),
  isWarning: computed.equal('noticeLevel', 'warning'),
  isInfo: computed.equal('noticeLevel', 'info'),
  isSuccess: computed.equal('noticeLevel', 'success'),
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
      return get(this, `__${key}`);
    }
  }),
  __noticeLevel: 'error',
  _levels: Ember.String.w('critical error warning info success'),

  faIcon: computed('noticeLevel', {
    get() {
      const notice = get(this, 'noticeLevel');
      return iconMap[notice];
    }
  }),

  click() {
    this.toggleProperty('slideOutUp');
    this.toggleProperty('slideInDown');
    run.later(this, 'send', 'dismiss', config.APP.ANIMATION_TIME);
  },

  actions: {
    dismiss() {
      get(this, 'on-dismiss')();
    }
  }
});

// Font Awesome icon names…
let iconMap = Object.create(null);

iconMap['critical'] = 'exclamation-triangle';
iconMap['error'] = 'exclamation-circle';
iconMap['warning'] = 'exclamation-circle';
iconMap['info'] = 'info-circle';
iconMap['success'] = 'fa-thumbs-up';

Object.freeze(iconMap);
