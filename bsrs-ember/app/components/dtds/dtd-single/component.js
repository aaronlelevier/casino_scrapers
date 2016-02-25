import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend(TabMixin, NewTabMixin, EditMixin, {
    repository: inject('dtd'),
    actions: {
        save() {
            this._super();
        },
    }
});
