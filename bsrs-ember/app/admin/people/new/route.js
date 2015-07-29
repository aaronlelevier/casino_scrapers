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
        return Ember.RSVP.hash({
            model: this.get('store').push('person', {id: pk}),
            phone_number_types: phone_number_types
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phone_number_types', hash.phone_number_types);
    },
    actions: {
        savePerson() {
            this.transitionTo('admin.people');
        }
    }
});
