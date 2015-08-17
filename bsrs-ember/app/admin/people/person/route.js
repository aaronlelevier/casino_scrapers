import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';

export default Ember.Route.extend({
    repository: inject('person'),
    state_repo: inject('state'),
    status_repo: inject('status'),
    country_repo: inject('country'),
    role_repo: inject('role'),
    phone_number_type_repo: inject('phone-number-type'),
    address_type_repo: inject('address-type'),
    init() {
        var comp = this.get('tabDoc');
        this.set('editPrivilege', true);
    },
    model(params) {
        var person_pk = params.person_id,
            country_repo = this.get('country_repo'),
            state_repo = this.get('state_repo'),
            status_repo = this.get('status_repo'),
            role_repo = this.get('role_repo'),
            repository = this.get('repository'),
            person = repository.findById(person_pk),
            phone_number_type_repo = this.get('phone_number_type_repo'),
            default_phone_number_type = phone_number_type_repo.get_default(),
            address_type_repo = this.get('address_type_repo'),
            default_address_type = address_type_repo.get_default(),
            roles = role_repo.get_default();

        return Ember.RSVP.hash({
            model: person,
            phone_number_types: phone_number_type_repo.find(),
            countries: country_repo.find(),
            state_list: state_repo.find(),
            address_types: address_type_repo.find(),
            statuses: status_repo.find(),
            default_phone_number_type: default_phone_number_type,
            default_address_type: default_address_type,
            roles: roles
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phone_number_types', hash.phone_number_types);
        controller.set('default_phone_number_type', hash.default_phone_number_type);
        controller.set('address_types', hash.address_types);
        controller.set('default_address_type', hash.default_address_type);
        controller.set('state_list', hash.state_list);
        controller.set('countries', hash.countries);
        controller.set('statuses', hash.statuses);
        controller.set('roles', hash.roles);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.storeType = 'person';
                transition.abort();
            } else {
                Ember.$('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.people');
        }
    }
});
