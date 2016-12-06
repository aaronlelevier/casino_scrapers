import Ember from 'ember';
const { computed, Component } = Ember;

var toFrom = Ember.Component.extend({
  spliti18nString: computed(function() {
    const str = this.get('i18nString').string;
    return str.split('%s');
  }),
  begString: computed({
    get() { return this.get('spliti18nString')[0].trim(); }
  }),
  firstVar: computed({
    get() { return this.get('spliti18nString')[1].trim(); }
  }),
  middle: computed({
    get() { return this.get('spliti18nString')[2].trim(); }
  }),
  secondVar: computed({
    get() { return this.get('spliti18nString')[3].trim(); }
  }),
  timestamp: computed({
    get() { return this.get('spliti18nString')[4].trim(); }
  }),
  classNames: ['activity-wrap']
});

export default toFrom;
