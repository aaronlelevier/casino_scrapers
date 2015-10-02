import Ember from 'ember';
import TabActionMixin from 'bsrs-ember/mixins/controller/tab-actions';

var RoleController = Ember.Controller.extend(TabActionMixin, {
    queryParams: ['search'],
    search: undefined,
});

export default RoleController;
