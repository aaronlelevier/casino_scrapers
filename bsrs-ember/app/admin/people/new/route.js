import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';
import Person from 'bsrs-ember/models/person';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    uuid: injectUUID('uuid'),
    phone_number_type_repo: inject('phone-number-type'),
    model() {
        var pk = this.get('uuid').v4();
        var phone_number_type_repo = this.get('phone_number_type_repo');
        var phone_number_types = phone_number_type_repo.find();
        var default_phone_number_type = phone_number_type_repo.get_default();
        return Ember.RSVP.hash({
            model: this.get('store').push('person', {id: pk}),
            phone_number_types: phone_number_types,
            default_phone_number_type: default_phone_number_type
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phone_number_types', hash.phone_number_types);
        controller.set('default_phone_number_type', hash.default_phone_number_type);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.newModel = true;
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        savePerson() {
            this.transitionTo('admin.people');
        },
        redirectUser() {
            this.transitionTo('admin.people');
        }
    }
});
