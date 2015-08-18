import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var CategorySingleRoute = Ember.Route.extend({
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
