import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import ContactRouteMixin from 'bsrs-ember/mixins/route/contact';

var LocationRoute = TabRoute.extend(ContactRouteMixin, {
    repository: inject('location'),
    redirectRoute: Ember.computed(function() { return 'admin.locations.index'; }),
    modelName: Ember.computed(function() { return 'location'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        let location_pk = params.location_id;
        let all_location_levels = this.get('store').find('location-level');
        let all_statuses = this.get('store').find('location-status');
        let repository = this.get('repository');
        let location = this.get('store').find('location', location_pk);
        if (!location.get('length') || location.get('isNotDirtyOrRelatedNotDirty')) { 
            location = repository.findById(location_pk);
        }
        return {
            model: location,
            all_location_levels: all_location_levels,
            all_statuses: all_statuses,
            phone_number_types: this.phone_number_type_repo.find(),
            default_phone_number_type: this.phone_number_type_repo.get_default(),
            address_types: this.address_type_repo.find(),
            default_address_type: this.address_type_repo.get_default(),
            countries: this.country_repo.find(),
            state_list: this.state_repo.find(),
        };

    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
        controller.set('all_statuses', hash.all_statuses);
        controller.set('phone_number_types', hash.phone_number_types);
        controller.set('default_phone_number_type', hash.default_phone_number_type);
        controller.set('address_types', hash.address_types);
        controller.set('default_address_type', hash.default_address_type);
        controller.set('state_list', hash.state_list);
        controller.set('countries', hash.countries);
    }
});

export default LocationRoute;
