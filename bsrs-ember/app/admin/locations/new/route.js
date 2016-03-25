import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';
import ContactRouteMixin from 'bsrs-ember/mixins/route/contact';

var LocationNewRoute = TabRoute.extend(ContactRouteMixin, {
    repository: inject('location'),
    redirectRoute: 'admin.locations.index',
    module: 'location',
    templateModelField: Ember.computed(function() { return 'Location'; }),
    model(params) {
        let new_pk = parseInt(params.new_id, 10);
        let all_location_levels = this.get('store').find('location-level');
        const all_statuses = this.get('store').find('location-status');
        let model = this.get('store').find('location', {new_pk: new_pk}).objectAt(0);
        if(!model){
            model = this.get('repository').create(new_pk);
        }
        return {
            model: model,
            all_statuses: all_statuses,
            all_location_levels: all_location_levels,
            email_types: this.email_type_repo.find(),
            default_email_type: this.email_type_repo.get_default(),
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
        controller.set('all_statuses', hash.all_statuses);
        controller.set('all_location_levels', hash.all_location_levels);
        controller.set('email_types', hash.email_types);
        controller.set('default_email_type', hash.default_email_type);
        controller.set('phone_number_types', hash.phone_number_types);
        controller.set('default_phone_number_type', hash.default_phone_number_type);
        controller.set('address_types', hash.address_types);
        controller.set('default_address_type', hash.default_address_type);
        controller.set('state_list', hash.state_list);
        controller.set('countries', hash.countries);
    }
});

export default LocationNewRoute;
