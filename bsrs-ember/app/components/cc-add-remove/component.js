import Ember from 'ember';

var ccAddRemove = Ember.Component.extend({
  person: Ember.computed(function() {
    const i18n_string = this.get('i18nString');
    if (i18n_string) {
      const str = i18n_string.string;
      const [beg_string, _, middle, timestamp] = str.split('$');
      this.set('begString', beg_string.trim());
      this.set('timestamp', timestamp.trim());
      this.set('middle', middle.trim());
      return this.get('activity').get('person').get('fullname');
    }
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
