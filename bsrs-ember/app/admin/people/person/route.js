import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import PhoneNumberType from 'bsrs-ember/models/phonenumber-type'; //remove this after we inject /wire up pN Types

export default Ember.Route.extend({
    repository: inject('person'),
    init: function() {
        var comp = this.get("tabDoc");
        this.set('editPrivilege', true);
    },
    model: function(params) {
        var repository = this.get('repository');
        var person = repository.findById(params.person_id);
        var phoneNumberTypes = [
            PhoneNumberType.create(
                    {id: 1, name: 'admin.phonenumbertype.office'}),
            PhoneNumberType.create(
                    {id: 2, name: 'admin.phonenumbertype.mobile'})
        ];
        return Ember.RSVP.hash({
            model: person,
            phoneNumberTypes: phoneNumberTypes
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phoneNumberTypes', hash.phoneNumberTypes);
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
