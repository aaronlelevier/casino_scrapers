import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
// import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';


var LocaleTranslationModel = Model.extend({
    store: inject('main'),
    id: attr(''),
    locale: attr(''),
    translation: attr(''),
    // related "translation key" for this model
    translation_key: Ember.computed(function() {
        return this.get('id').split(':')[1] || '';
    }),
    serialize: function() {
        return {
            locale: this.get('locale'),
            translation: this.get('translation')
        };
    }
});
export default LocaleTranslationModel;

