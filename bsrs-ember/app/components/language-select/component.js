import Ember from 'ember';

var PersonLocale = Ember.Component.extend({
    actions: {
        selected(locale) {
            const person = this.get('person');
            person.change_locale(locale.get('id'));
        },
    }
});

export default PersonLocale;
