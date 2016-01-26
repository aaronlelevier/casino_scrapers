import Ember from 'ember';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-ember/utilities/belongs-to';

var run = Ember.run;

var LocaleMixin = Ember.Mixin.create({
    rollbackLocale: belongs_to_rollback('locale_fk', 'locale', 'change_locale'),
    saveLocale: belongs_to_save('person', 'locale', 'locale_fk'),
    localeIsDirty: Ember.computed('locale', 'locale_fk', function() {
        let locale = this.get('locale');
        let locale_fk = this.get('locale_fk');
        if (locale) {
            return locale.get('id') === locale_fk ? false : true;
        }
    }),
    localeIsNotDirty: Ember.computed.not('localeIsDirty'),
    // change_locale: change_belongs_to('people', 'locale'),
    change_locale(locale_id) {
        const store = this.get('store');
        const id = this.get('id');
        const old_locale = this.get('locale');
        if(old_locale) {
            const people_ids = old_locale.get('people');
            let updated_old_locale_people = people_ids.filter((id) => {
                return id !== id; 
            });
            run(function() {
                store.push('locale', {id: old_locale.get('id'), people: updated_old_locale_people});
            });
        }
        const new_locale = store.find('locale', locale_id);
        const new_locale_people = new_locale.get('people') || [];
        run(function() {
            store.push('locale', {id: new_locale.get('id'), people: new_locale_people.concat(id)});
        });
        this.changeLocale();
    },
    locale: Ember.computed.alias('belongs_to_locale.firstObject'),
    belongs_to_locale: belongs_to('people', 'locale'),
});

export default LocaleMixin;

