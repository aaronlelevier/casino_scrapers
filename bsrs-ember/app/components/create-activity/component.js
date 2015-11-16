import Ember from 'ember';

var createActivity = Ember.Component.extend({
    person: Ember.computed(function() {
        const i18n_string = this.get('i18nString');
        if (i18n_string) {
            const str = i18n_string.string;
            const [beg_string, timestamp] = str.split('$');
            this.set('begString', beg_string.trim());
            this.set('timestamp', timestamp.trim());
            return this.get('activity').get('person').get('fullname');
        }
    }),
});

export default createActivity;

