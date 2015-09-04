import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';

var CategoryNewRoute = Ember.Route.extend({
    uuid: injectUUID('uuid'),
    model() {
        let pk = this.get('uuid').v4();
        return this.get('store').push('category', {id: pk});
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel;
            if (model.get('isNew')) {
                model.removeRecord();
            } else if (model.get('dirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.newModel = true;
                this.trx.storeType = 'category';
                transition.abort();
            } else {
                Ember.$('.t-modal').modal('hide');
            }
        },
        redirectUser() {
           this.transitionTo('admin.categories.index');
        }
    }
});

export default CategoryNewRoute;
