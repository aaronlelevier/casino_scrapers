import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';

var TranslationModel = Model.extend(NewMixin, {
    store: inject('main'),
    key: Ember.computed.alias('id'),
    translated_value: attr(''),
    locale_fks: [],
    locales: Ember.computed('locale_fks.[]', function() {
        const related_fks = this.get('locale_fks');
        const filter = function(locale_trans) {
            return Ember.$.inArray(locale_trans.get('id'), related_fks) > -1;
        };
        return this.get('store').find('locale-translation', filter, []);
    }),
    locale_ids: Ember.computed('locales.[]', function() {
        return this.get('locales').mapBy('id');
    }),
    add_locale(locale_id) {
        let store = this.get('store');
        let locale = store.find('locale-translation', locale_id);
        locale.set('rollback', undefined);
        let translation_id = this.get('id');
        let current_fks = this.get('locale_fks') || [];
        this.set('locale_fks', current_fks.concat(locale_id).uniq());
    },
    remove_locale(locale_id) {
        let store = this.get('store');
        let locale = store.find('locale-translation', locale_id);
        locale.set('rollback', true);
        let translation_id = this.get('id');
        let current_fks = this.get('locale_fks') || [];
        let updated_fks = current_fks.filter(function(id) {
            return id !== locale_id;
        });
        this.set('locale_fks', updated_fks);
    },
    serialize() {
        return {
            id: this.get('id'),
            key: this.get('key'),
            locales: this.get('locales')
        };
    },
});

export default TranslationModel;