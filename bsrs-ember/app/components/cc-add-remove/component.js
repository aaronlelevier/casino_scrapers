import Ember from 'ember';
const { computed, Component } = Ember;

var ccAddRemove = Ember.Component.extend({
  spliti18nString: computed(function() {
    const str = this.get('i18nString').string;
    return str.split('%s');
  }),
  begString: computed({
    get() { return this.get('spliti18nString')[0].trim(); }
  }),
  middle: computed({
    get() { return this.get('spliti18nString')[2].trim(); }
  }),
  timestamp: computed({
    get() { return this.get('spliti18nString')[3].trim(); }
  }),
  ccs: Ember.computed(function() {
    const activity = this.get('activity');
    let ccs;
    if (activity.type === 'cc_add') {
      ccs = activity.get('added');
    }else{
      ccs = activity.get('removed');
    }
    return ccs;
  }),
  classNames: ['activity-wrap']
});

export default ccAddRemove;
