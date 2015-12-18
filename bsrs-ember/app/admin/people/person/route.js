import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import ContactRouteMixin from 'bsrs-ember/mixins/route/contact';

var PersonRoute = TabRoute.extend(ContactRouteMixin, {
    store: injectStore('main'),
    repository: inject('person'),
    location_repo: inject('location'),
    status_repo: inject('status'),
    role_repo: inject('role'),
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
        const status_repo = this.get('status_repo');
        const role_repo = this.get('role_repo');
        const repository = this.get('repository');
        let person = this.get('store').find('person', person_pk);
        if (!person.get('length') || person.get('isNotDirtyOrRelatedNotDirty')) {
            person = repository.findById(person_pk);
        }
        const roles = role_repo.get_default();
        const role_change = transition.queryParams.role_change;
        return {
            model: person,
            model_id: person_pk,
            phone_number_types: this.phone_number_type_repo.find(),
            default_phone_number_type: this.phone_number_type_repo.get_default(),
            address_types: this.address_type_repo.find(),
            default_address_type: this.address_type_repo.get_default(),
            countries: this.country_repo.find(),
            state_list: this.state_repo.find(),
            statuses: status_repo.find(),
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
