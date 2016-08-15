import { attr, Model } from 'ember-cli-simple-store/model';
import TranslationMixin from 'bsrs-ember/mixins/model/translation';

export default Model.extend(TranslationMixin, {
  name: attr(),
});
