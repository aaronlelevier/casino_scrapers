import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phonenumber-type';

export default Ember.Route.extend({
    repository: inject('person'),
    state_repository: inject('state'),
    phonenumber_repo: inject('phonenumber'),
    phonenumber_type_repo: inject('phonenumber-type'),
    init: function() {
        var comp = this.get("tabDoc");
        this.set('editPrivilege', true);
    },
    model: function(params) {
        var state_repository = this.get('state_repository');

        //Rip this out and make a repository
        var address_types = [
            AddressType.create({
                id: 1,
                name: 'admin.address_type.office'
            }),
            AddressType.create({
                id: 2,
                name: 'admin.address_type.shipping'
            })
        ];

        var repository = this.get('repository');
        var person = repository.findById(params.person_id);

        var phonenumber_repo = this.get('phonenumber_repo');
        var phone_numbers = phonenumber_repo.findByPersonId(params.person_id);

        var phonenumber_type_repo = this.get('phonenumber_type_repo');
        var phonenumber_types = phonenumber_type_repo.find();

        return Ember.RSVP.hash({
            model: person,
            phoneNumberTypes: phonenumber_types,
            phone_numbers: phone_numbers,
            state_list: state_repository.find(),
            address_types: address_types
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phoneNumberTypes', hash.phoneNumberTypes);
        controller.set('phone_numbers', hash.phone_numbers);
        controller.set('state_list', hash.state_list);
        controller.set('address_types', hash.address_types);
    },
    actions: {
        willTransition: function(transition) {
            var controller = this.get('controller');
            var model = this.currentModel.model;
            if(model.get('isDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                transition.abort();
            }else{
                $('.t-modal').modal('hide');
            }
        },
        savePerson: function() {
            this.transitionTo('admin.people');
        },
        cancelPerson: function() {
            this.transitionTo('admin.people');
        }
    }
});
