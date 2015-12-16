import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';

var PersonRoute = TabRoute.extend({
    store: injectStore('main'),
    repository: inject('person'),
    location_repo: inject('location'),
    state_repo: inject('state'),
    status_repo: inject('status'),
    country_repo: inject('country'),
    role_repo: inject('role'),
    phone_number_type_repo: inject('phone-number-type'),
    address_type_repo: inject('address-type'),
    queryParams: {
        role_change: {
            refreshModel: true
        }
    },
    redirectRoute: Ember.computed(function() { return 'admin.people.index'; }),
    modelName: Ember.computed(function() { return 'person'; }),
    templateModelField: Ember.computed(function() { return 'fullname'; }),
    model(params, transition) {
        const person_pk = params.person_id;
        const location_repo = this.get('location_repo');
        const country_repo = this.get('country_repo');
        const state_repo = this.get('state_repo');
        const status_repo = this.get('status_repo');
        const role_repo = this.get('role_repo');
        const repository = this.get('repository');
        let person = this.get('store').find('person', person_pk);
        if (!person.get('length') || person.get('isNotDirtyOrRelatedNotDirty')) {
            person = repository.findById(person_pk);
        }
        let phone_number_type_repo = this.get('phone_number_type_repo');
        let default_phone_number_type = phone_number_type_repo.get_default();
        let address_type_repo = this.get('address_type_repo');
        let default_address_type = address_type_repo.get_default();
        let roles = role_repo.get_default();
        let role_change = transition.queryParams.role_change;
        return {
            model: person,
            model_id: person_pk,
            phone_number_types: phone_number_type_repo.find(),
            countries: country_repo.find(),
            state_list: state_repo.find(),
            address_types: address_type_repo.find(),
            statuses: status_repo.find(),
            default_phone_number_type: default_phone_number_type,
            default_address_type: default_address_type,
            locales: this.get('store').find('locale'),
            roles: roles,
            role_change: role_change,
        };
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
        controller.set('locales', hash.locales);
        controller.set('role_change', hash.role_change);
    },
    actions: {
        localeChanged(locale){
            let model = this.currentModel.model;
            model.set('locale', locale);
            model.changeLocale();
        }
    }
});

export default PersonRoute;
