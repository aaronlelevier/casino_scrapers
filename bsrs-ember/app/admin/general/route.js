import Ember from 'ember';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';
import Scott from 'bsrs-ember/admin/scott/model';

export default Ember.Route.extend({
	model(){
        var phone_number_types = [
            PhoneNumberType.create(
                {id: 1, name: 'admin.phonenumbertype.office'}),
            PhoneNumberType.create(
                {id: 2, name: 'admin.phonenumbertype.mobile'})
        ];
        return Ember.RSVP.hash({
            model: Scott.create(),
            phone_number_types: phone_number_types
        });
	},
  setupController: function(controller, hash) {
      controller.set('model', hash.model);
      controller.set('phone_number_types', hash.phone_number_types);
  }
});
