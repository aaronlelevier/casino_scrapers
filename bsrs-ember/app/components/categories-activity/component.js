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
  person: Ember.computed(function() {
      const activity = this.get('activity');
      if (activity.get('person')) {
        return activity.get('person').get('fullname');
      } else if (activity.get('automation')) {
        return activity.automation.description;
      }
    // }
  }),
  classNames: ['activity-wrap']
});

export default toFrom;
