import Ember from 'ember';

var toFrom = Ember.Component.extend({
    person: Ember.computed(function() {
        var i18n_string = this.get('i18nString');
        if (i18n_string) {
            const str = i18n_string.string;
            const [beg_string, first_var, middle, second_var, timestamp] = str.split('%s');
            this.set('begString', beg_string.trim());
            this.set('firstVar', first_var.trim());
            this.set('secondVar', second_var.trim());
            this.set('timestamp', timestamp.trim());
            this.set('middle', middle.trim());
            return this.get('activity').get('person').get('fullname');
        }
    }),
    classNames: ['activity-wrap']
});

export default toFrom;
