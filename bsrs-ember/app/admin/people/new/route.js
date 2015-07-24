import Ember from 'ember';
import Person from 'bsrs-ember/models/person';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    phone_number_type_repo: inject('phone-number-type'),
    model() {
        var phone_number_type_repo = this.get('phone_number_type_repo');
        var phone_number_types = phone_number_type_repo.find();
        return Ember.RSVP.hash({
            model: this.get('store').push('person', {}),
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
