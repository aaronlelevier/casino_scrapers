import Ember from 'ember';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-ember/utilities/belongs-to';

var run = Ember.run;

var LocaleMixin = Ember.Mixin.create({
    rollbackLocale: belongs_to_rollback('locale_fk', 'locale', 'change_locale'),
    saveLocale: belongs_to_save('person', 'locale', 'locale_fk'),
    localeIsDirty: belongs_to_dirty('locale_fk', 'locale'),
    localeIsNotDirty: Ember.computed.not('localeIsDirty'),
    change_locale_container: change_belongs_to('people', 'locale'),
    change_locale(locale_id) {
        this.change_locale_container(locale_id);
        this.changeLocale();
    },
    locale: Ember.computed.alias('belongs_to_locale.firstObject'),
    belongs_to_locale: belongs_to('people', 'locale'),
});

export default LocaleMixin;

