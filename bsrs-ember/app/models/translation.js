import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';

var TranslationModel = Model.extend(NewMixin, {
    store: inject('main'),
    key: Ember.computed.alias('id'),
    locale_fks: [],
    locales: Ember.computed(function() {
        const trans_key = this.get('key');
        const filter = function(locale_trans) {
            return Ember.$.inArray(locale_trans.get('translation_key'), [trans_key]) > -1;
        };
        return this.get('store').find('locale-translation', filter, ['isDirty', 'translation_key']);
    }),
    locale_ids: Ember.computed('locales.[]', function() {
        return this.get('locales').mapBy('id');
    }),
    localeIsDirty: Ember.computed('locales.[]', function() {
        let locales = this.get('locales');
        let bool = true;
        locales.forEach((locale) => {
            // FAILING b/c "locale_fks" needs to get populated in the "deserializer" ??
            bool = locale.get('isDirty') && bool;
        });
        return bool;
    }),
    isDirtyOrRelatedDirty: Ember.computed('localeIsDirty', function() {
        // others use this.get('isDirty') || this.get('localeIsDirty')
        return this.get('localeIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    saveLocales() {
        let locales = this.get('locales');
        locales.forEach((locale) => {
            locale.save();
        });
    },
    rollbackLocales() {
        let store = this.get('store');
        let locales_to_remove = [];
        let locales = this.get('locales');
        locales.forEach((x) => {
            //remove
            if (x.get('isNotDirty')) {
                locales_to_remove.push(x.get('id'));
            }
            x.rollback();
        });
        locales_to_remove.forEach((id) => {
            store.remove('locale-translation', id);
        });
    },
    serialize() {
        var locales = [];
        this.get('locales').forEach(function(locale) {
            locales.push(locale.serialize());
        });
        return {
            id: this.get('id'),
            key: this.get('key'),
            locales: locales
        };
    },
});

export default TranslationModel;
