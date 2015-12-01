import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';

var TranslationModel = Model.extend(NewMixin, {
    store: inject('main'),
    key: Ember.computed.alias('id'),
    translated_value: attr('')
});

export default TranslationModel;