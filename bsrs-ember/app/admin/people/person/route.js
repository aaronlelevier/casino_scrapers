import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';

var PersonRoute = Ember.Route.extend({
    store: injectStore('main'),
    tabList: Ember.inject.service(),
    repository: inject('person'),
    location_repo: inject('location'),
    state_repo: inject('state'),
    status_repo: inject('status'),
    country_repo: inject('country'),
    role_repo: inject('role'),
    phone_number_type_repo: inject('phone-number-type'),
    address_type_repo: inject('address-type'),
    queryParams: {
        search: {
            refreshModel: true
        },
        role_change: {
            refreshModel: true
        },
    },
    redirectRoute: Ember.computed(function() { return 'admin.people.index'; }),
    modelName: Ember.computed(function() { return 'person'; }),
    templateModelField: Ember.computed(function() { return 'fullname'; }),
    model(params, transition) {
        let person_pk = params.person_id;
        let location_repo = this.get('location_repo');
        let country_repo = this.get('country_repo');
        let state_repo = this.get('state_repo');
        let status_repo = this.get('status_repo');
        let role_repo = this.get('role_repo');
        let repository = this.get('repository');
        let person = this.get('store').find('person', person_pk);
        if (!person.get('length') || person.get('isNotDirtyOrRelatedNotDirty')) { 
            person = repository.findById(person_pk);
        }
        let phone_number_type_repo = this.get('phone_number_type_repo');
        let default_phone_number_type = phone_number_type_repo.get_default();
        let address_type_repo = this.get('address_type_repo');
        let default_address_type = address_type_repo.get_default();
        let roles = role_repo.get_default();
        let search = transition.queryParams.search;
        let role_change = transition.queryParams.role_change;
        let location_level_pk = person.get('location_level_pk');
        var person_locations_children;
        if ((search || role_change) && location_level_pk) { 
            person_locations_children = location_repo.findLocationSelect({location_level: location_level_pk}, search, role_change);
        } else { 
            person_locations_children = []; 
        }
        this.get('tabList').createTab(this.routeName, this.get('modelName'), person_pk, this.get('templateModelField'), this.get('redirectRoute'));
        return Ember.RSVP.hash({
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
            search: search,
            role_change: role_change,
            person_locations_children: person_locations_children
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
        controller.set('locales', hash.locales);
        controller.set('search', hash.search);
        controller.set('role_change', hash.role_change);
        controller.set('person_locations_children', hash.person_locations_children);
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
