import Ember from 'ember';

var ccAddRemove = Ember.Component.extend({
    person: Ember.computed(function() {
        const str = this.get('i18nString').string;
        const [beg_string, first_var, middle, timestamp] = str.split('$');
        this.set('begString', beg_string.trim());
        this.set('timestamp', timestamp.trim());
        this.set('middle', middle.trim());
        return this.get('activity').get('person').get('fullname');
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
    firstVar: Ember.computed(function() {}),
    secondVar: Ember.computed(function() {}),
    middle: Ember.computed(function() {}),
    timestamp: Ember.computed(function() {}),
});

export default ccAddRemove;
