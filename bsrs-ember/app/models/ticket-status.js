import { attr, Model } from 'ember-cli-simple-store/model';
import TranslationMixin from 'bsrs-ember/mixins/model/translation';
import RemoveRecord from 'bsrs-ember/mixins/model/remove_record';

export default Model.extend(TranslationMixin, RemoveRecord, {
    name: attr(),
});
