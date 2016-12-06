import Ember from 'ember';
const { computed, Component } = Ember;

var commentActivity = Ember.Component.extend({
  spliti18nString: computed(function() {
    const str = this.get('i18nString').string;
    return str.split('%s');
  }),
  begString: computed({
    get() { return this.get('spliti18nString')[0].trim(); }
  }),
  timestamp: computed({
    get() { return this.get('spliti18nString')[1].trim(); }
  }),
  comment: computed({
    get() { return this.get('spliti18nString')[2].trim(); }
  }),
  person: Ember.computed(function() {
    return this.get('activity').get('person').get('fullname');
  }),
  classNames: ['activity-wrap']
});

export default commentActivity;
