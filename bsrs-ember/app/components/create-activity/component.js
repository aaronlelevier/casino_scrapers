import Ember from 'ember';

var createActivity = Ember.Component.extend({
    person: Ember.computed(function() {
        const str = this.get('i18nString').string;
        const [beg_string, timestamp] = str.split('$');
        this.set('begString', beg_string.trim());
        this.set('timestamp', timestamp.trim());
        return this.get('activity').get('person').get('fullname');
    }),
    timestamp: Ember.computed(function() {}),
});

export default createActivity;

