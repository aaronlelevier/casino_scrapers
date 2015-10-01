import Ember from 'ember';
import TabActionMixin from 'bsrs-ember/mixins/controller/tab-actions';

var PersonController = Ember.Controller.extend(TabActionMixin, {
    queryParams: ['search', 'role_change'],
    search: undefined,
    role_change: undefined,
});

export default PersonController;

