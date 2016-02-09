import Ember from 'ember';
import TranslationMixin from 'bsrs-ember/mixins/model/translation';
import RemoveRecord from 'bsrs-ember/mixins/model/remove_record';

export default Ember.Object.extend(TranslationMixin, RemoveRecord, {
});
