import Ember from 'ember';
import TabActionMixin from 'bsrs-ember/mixins/controller/tab-actions';

var CategoryNewController = Ember.Controller.extend(TabActionMixin, {
    queryParams: ['search'],
    search: undefined,
});

export default CategoryNewController;


