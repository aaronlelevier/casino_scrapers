import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';

export default Ember.Route.extend({
    repository: inject('person'),
    state_repo: inject('state'),
    country_repo: inject('country'),
    phone_number_repo: inject('phonenumber'),
    phone_number_type_repo: inject('phone-number-type'),
    address_repo: inject('address'),
    address_type_repo: inject('address-type'),
    init() {
        var comp = this.get("tabDoc");
        this.set('editPrivilege', true);
    },
    model(params) {
        var person_pk = parseInt(params.person_id, 10),
            country_repo = this.get('country_repo'),
            state_repo = this.get('state_repo'),
            repository = this.get('repository'),
            person = repository.findById(person_pk),
            phone_number_repo = this.get('phone_number_repo'),
            phone_numbers = phone_number_repo.findByPersonId(person_pk),
            phone_number_type_repo = this.get('phone_number_type_repo'),
            phone_number_types = phone_number_type_repo.find(),
            address_repo = this.get('address_repo'),
            addresses = address_repo.findByPersonId(person_pk),
            address_type_repo = this.get('address_type_repo'),
            address_types = address_type_repo.find();

        return Ember.RSVP.hash({
            model: person,
            phone_number_types: phone_number_types,
            phone_numbers: phone_numbers,
            countries: country_repo.find(),
            state_list: state_repo.find(),
            addresses: addresses,
            address_types: address_types
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phone_number_types', hash.phone_number_types);
        controller.set('phone_numbers', hash.phone_numbers);
        controller.set('state_list', hash.state_list);
        controller.set('countries', hash.countries);
        controller.set('addresses', hash.addresses);
        controller.set('address_types', hash.address_types);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedIsDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        savePerson() {
            this.transitionTo('admin.people');
        },
        cancelPerson() {
            this.transitionTo('admin.people');
        }
    }
});
