import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';

var TranslationModel = Model.extend(NewMixin, {
    store: inject('main'),
    key: Ember.computed.alias('id'),
    translated_value: attr(''),
    locales: attr(''),
    serialize() {
        return {
            id: this.get('id'),
            key: this.get('key'),
            locales: this.get('locales')
        };
    },
});

export default TranslationModel;