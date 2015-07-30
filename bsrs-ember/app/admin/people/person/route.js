import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';

export default Ember.Route.extend({
    repository: inject('person'),
    state_repo: inject('state'),
    status_repo: inject('status'),
    country_repo: inject('country'),
    phone_number_type_repo: inject('phone-number-type'),
    address_type_repo: inject('address-type'),
    init() {
        var comp = this.get("tabDoc");
        this.set('editPrivilege', true);
    },
    model(params) {
        var person_pk = params.person_id,
            country_repo = this.get('country_repo'),
            state_repo = this.get('state_repo'),
            status_repo = this.get('status_repo'),
            repository = this.get('repository'),
            person = repository.findById(person_pk),
            phone_number_type_repo = this.get('phone_number_type_repo'),
            phone_number_types = phone_number_type_repo.find(),
            address_type_repo = this.get('address_type_repo'),
            address_types = address_type_repo.find(),
            statuses = status_repo.find(),
            default_phone_number_type = phone_number_type_repo.get_default();

        return Ember.RSVP.hash({
            model: person,
            phone_number_types: phone_number_types,
            countries: country_repo.find(),
            state_list: state_repo.find(),
            address_types: address_types,
            statuses: statuses,
            default_phone_number_type: default_phone_number_type
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phone_number_types', hash.phone_number_types);
        controller.set('state_list', hash.state_list);
        controller.set('countries', hash.countries);
        controller.set('address_types', hash.address_types);
        controller.set('statuses', hash.statuses);
        controller.set('default_phone_number_type', hash.default_phone_number_type);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
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
