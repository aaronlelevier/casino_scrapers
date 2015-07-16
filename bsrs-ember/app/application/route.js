import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel: function() {
        var store = this.get('store');
        var phone_number_config = $('[data-preload-phonenumber_types]').html();
        var address_config = $('[data-preload-address_types]').html();
        var phone_number_types = JSON.parse(phone_number_config);
        var address_types = JSON.parse(address_config);
        phone_number_types.forEach((model) => {
            store.push('phone-number-type', model);
        });
        address_types.forEach((model) => {
            store.push('address-type', model);
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
