import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import ContactRouteMixin from 'bsrs-ember/mixins/route/contact';
import FindById from 'bsrs-ember/mixins/route/findById';

var LocationRoute = TabRoute.extend(FindById, ContactRouteMixin, {
    repository: inject('location'),
    redirectRoute: Ember.computed(function() { return 'admin.locations.index'; }),
    modelName: Ember.computed(function() { return 'location'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        const pk = params.location_id;
        const repository = this.get('repository');
        let location = repository.fetch(pk);
        const all_location_levels = this.get('store').find('location-level');
        const all_statuses = this.get('store').find('location-status');
        const email_types = this.email_type_repo.find();
        const default_email_type = this.email_type_repo.get_default();
        const phone_number_types = this.phone_number_type_repo.find();
        const default_phone_number_type = this.phone_number_type_repo.get_default();
        const address_types = this.address_type_repo.find();
        const default_address_type = this.address_type_repo.get_default();
        const countries = this.country_repo.find();
        const state_list = this.state_repo.find();
        return this.findByIdScenario(location, pk, {all_statuses:all_statuses, all_location_levels:all_location_levels, 
                                     email_types:email_types, default_email_type:default_email_type, 
                                     phone_number_types:phone_number_types,default_phone_number_type:default_phone_number_type,
                                     address_types:address_types, default_address_type:default_address_type, 
                                     state_list:state_list, countries:countries});

    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
        controller.set('all_statuses', hash.all_statuses);
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

export default LocationRoute;
