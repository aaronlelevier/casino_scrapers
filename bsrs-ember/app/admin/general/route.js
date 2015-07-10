import Ember from 'ember';
import PhoneNumberType from 'bsrs-ember/models/phonenumber-type';
import Scott from 'bsrs-ember/admin/scott/model';

export default Ember.Route.extend({
	model: function(){
        var phoneNumberTypes = [
            PhoneNumberType.create(
                {id: 1, name: 'admin.phonenumbertype.office'}),
            PhoneNumberType.create(
                {id: 2, name: 'admin.phonenumbertype.mobile'})
        ];
        return Ember.RSVP.hash({
            model: Scott.create(),
            phoneNumberTypes: phoneNumberTypes
        });
	},
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phoneNumberTypes', hash.phoneNumberTypes);
    }
});
