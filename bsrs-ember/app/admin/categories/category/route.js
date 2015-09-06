import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import RollbackModalMixin from 'bsrs-ember/mixins/route/rollback/existing';

var CategorySingleRoute = Ember.Route.extend(RollbackModalMixin, {
    repository: inject('category'),
    model(params) {
        return this.get('repository').findById(params.category_id);
    },
    actions: {
        redirectUser() {
            this.transitionTo('admin.categories');
        }
    }
});

export default CategorySingleRoute;
