import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        var store = this.get('store');
        var phone_number_config = Ember.$('[data-preload-phonenumber_types]').html();
        var phone_number_types = JSON.parse(phone_number_config);
        phone_number_types.forEach((model) => {
            store.push('phone-number-type', model);
        });
        var address_config = Ember.$('[data-preload-address_types]').html();
        var address_types = JSON.parse(address_config);
        address_types.forEach((model) => {
            store.push('address-type', model);
        });
        var country_config = Ember.$('[data-preload-countries]').html();
        var countries = JSON.parse(country_config);
        countries.forEach((model) => {
            store.push('country', model);
        });
        var state_config = Ember.$('[data-preload-states_us]').html();
        var state_list = JSON.parse(state_config);
        state_list.forEach((model) => {
            store.push('state', model);
        });
        var status_config = Ember.$('[data-preload-person-statuses]').html();
        var status_list = JSON.parse(status_config);
        status_list.forEach((model) => {
            store.push('status', model);
        });
        var loc_status_config = Ember.$('[data-preload-location-statuses]').html();
        var loc_status_list = JSON.parse(loc_status_config);
        loc_status_list.forEach((model) => {
            store.push('location-status', model);
        });
        var currency_config = Ember.$('[data-preload-currencies]').html();
        var currency_list = JSON.parse(currency_config);
        for (var key in currency_list) {
            store.push('currency', currency_list[key]);
        }
        var location_level_config = Ember.$('[data-preload-location-levels]').html();
        var location_level_list = JSON.parse(location_level_config);
        location_level_list.forEach((model) => {
            store.push('location-level', model);
        });
        var role_config = Ember.$('[data-preload-roles]').html();
        var role_list = JSON.parse(role_config);
        role_list.forEach((model) => {
            var loc_level = store.find('location-level', model.location_level);
            var existing_roles = loc_level.get('roles') || [];
            loc_level.set('roles', existing_roles.concat([model.id])); 
            loc_level.save();
            delete model.location_level;
            store.push('role', model);
        });
        var role_types_config = Ember.$('[data-preload-role-types]').html();
        var role_type_list = JSON.parse(role_types_config);
        role_type_list.forEach((model, index) => {
            store.push('role-type', {id: index+1, name: model});
        });
    },
    actions: {
        cancel_modal() {
            Ember.$('.t-modal').modal('hide');
        }
    }
    //need to figure out how to output errors on screen
    //   //application error resource -- still not working; default route defined with wildcard in router
    //   error: function(error) {
    //     this.transitionTo('application-error', error);
    //   }
    // }
});
