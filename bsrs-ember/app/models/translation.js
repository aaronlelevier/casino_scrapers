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
    serialize() {
        return {
            id: this.get('id'),
            key: this.get('key'),
            locales: this.get('locales')
        };
    },
});

export default TranslationModel;