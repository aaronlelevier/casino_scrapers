import Ember from 'ember';

var toFrom = Ember.Component.extend({
    person: Ember.computed(function() {
        const str = this.get('i18nString').string;
        const [beg_string, first_var, middle, second_var, timestamp] = str.split('$');
        this.set('begString', beg_string.trim());
        this.set('firstVar', first_var.trim());
        this.set('secondVar', second_var.trim());
        this.set('timestamp', timestamp.trim());
        this.set('middle', middle.trim());
        return this.get('activity').get('person').get('fullname');
    }),
    firstVar: Ember.computed(function() {}),
    secondVar: Ember.computed(function() {}),
    middle: Ember.computed(function() {}),
    timestamp: Ember.computed(function() {}),
});

export default toFrom;
