import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

var TranslationSingle = Ember.Component.extend(TabMixin, EditMixin, {
    repository: inject('translation')
});

export default TranslationSingle;
