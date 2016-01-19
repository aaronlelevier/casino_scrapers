import Ember from 'ember';

var run = Ember.run;

var LocaleMixin = Ember.Mixin.create({
    rollbackLocale() {
        let locale = this.get('locale');
        let locale_fk = this.get('locale_fk');
        if(locale && locale.get('id') !== locale_fk) {
            this.change_locale(locale_fk);
        }
    },
    saveLocale() {
        const type = this.get('type');
        const store = this.get('store');
        const pk = this.get('id');
        const locale = this.get('locale');
        if (locale) {
            run(function() {
                store.push(type, {id: pk, locale_fk: locale.get('id')});
            });
        }
    },
    localeIsDirty: Ember.computed('locale', 'locale_fk', function() {
        let locale = this.get('locale');
        let locale_fk = this.get('locale_fk');
        if (locale) {
            return locale.get('id') === locale_fk ? false : true;
        }
    }),
    localeIsNotDirty: Ember.computed.not('localeIsDirty'),
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
    belongs_to_locale: Ember.computed(function() {
        const id = this.get('id');
        const filter = (locale) => {
            return Ember.$.inArray(id, locale.get('people')) > -1;
        };
        return this.get('store').find('locale', filter);
    }),
});

export default LocaleMixin;

