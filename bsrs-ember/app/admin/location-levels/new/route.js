import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

var LocationLevelNew = Ember.Route.extend({
    uuid: inject('uuid'),
    model() {
        var pk = this.get('uuid').v4();
        var all_location_levels = this.get('store').find('location-level');
        var default_location_level = all_location_levels.objectAt(0).get('id');
        var model = this.get('store').push('location-level', {id: pk, location_level: default_location_level});
        return Ember.RSVP.hash({
            model: model,
            all_location_levels: all_location_levels
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isNew')) {
                model.removeRecord(model.get('id'));
            } else if (model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.newModel = true;
                this.trx.storeType = 'location-level';
                transition.abort();
            } else {
                Ember.$('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.location-levels');
        }
    }
});

export default LocationLevelNew;
