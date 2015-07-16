import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel: function() {
        var store = this.get('store');
        // Get phone number types from config
        var phone_number_config = $('[data-preload-phonenumber_types]').html();
        var phone_number_types = JSON.parse(phone_number_config);
        phone_number_types.forEach((model) => {
            store.push('phonenumber-type', model);
        });
        // Get address types from config
        var address_config = $('[data-preload-address_types]').html();
        var address_types = JSON.parse(address_config);
        address_types.forEach((model) => {
            store.push('address-type', model);
        });
        // Get countries from config
        var country_config = $('[data-preload-countries]').html();
        var countries = JSON.parse(country_config);
        countries.forEach((model) => {
            store.push('country', model);
        });
        // Get statelist from config
        var state_config = $('[data-preload-states_us]').html();
        var state_list = JSON.parse(state_config);
        state_list.forEach((model) => {
            store.push('state', model);
        });

        return {};

    },
    model: function() {
        return {};
    },
    actions: {
        cancel_modal: function() {
            $('.t-modal').modal('hide');
        }
    }
    //need to figure out how to output errors on screen
    //   //application error resource -- still not working; default route defined with wildcard in router
    //   error: function(error) {
    //     this.transitionTo('application-error', error);
    //   }
    // }
});
