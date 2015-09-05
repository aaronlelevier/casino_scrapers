import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var CategorySingleRoute = Ember.Route.extend({
    repository: inject('category'),
    model(params) {
        return this.get('repository').findById(params.category_id);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel;
            if (model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.storeType = 'category';
                transition.abort();
            } else {
                Ember.$('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.categories');
        }
    }
});

export default CategorySingleRoute;
