import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    repository: inject('person'),
    phonenumber_repo: inject('phonenumber'),
    phonenumber_type_repo: inject('phonenumber-type'),
    init: function() {
        var comp = this.get("tabDoc");
        this.set('editPrivilege', true);
    },
    model: function(params) {
        var repository = this.get('repository');
        var person = repository.findById(params.person_id);

        var phonenumber_repo = this.get('phonenumber_repo');
        var phone_numbers = phonenumber_repo.findByPersonId(params.person_id);

        var phonenumber_type_repo = this.get('phonenumber_type_repo');
        var phonenumber_types = phonenumber_type_repo.find();

        return Ember.RSVP.hash({
            model: person,
            phoneNumberTypes: phonenumber_types,
            phone_numbers: phone_numbers
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phoneNumberTypes', hash.phoneNumberTypes);
        controller.set('phone_numbers', hash.phone_numbers);
    },
    actions: {
        savePerson: function() {
            this.transitionTo('admin.people');
        },
        cancelPerson: function() {
            this.transitionTo('admin.people');
        }
    }
});
