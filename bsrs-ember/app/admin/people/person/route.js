import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phonenumber-type';

export default Ember.Route.extend({
  repository: inject('person'),
  state_repository: inject('state'),
  model: function(params) {
    var repository = this.get('repository');
    var state_repository = this.get('state_repository');

    //Rip this out and make a repository
    var address_types = [
        AddressType.create({
          id: 1,
          name: 'admin.address_type.office'
        }),
        AddressType.create({
          id: 2,
          name: 'admin.address_type.shipping'
        })
    ];

    var phoneNumberTypes = [
        PhoneNumberType.create(
            {id: 1, name: 'admin.phonenumbertype.office'}),
        PhoneNumberType.create(
            {id: 2, name: 'admin.phonenumbertype.mobile'})
    ];

    return Ember.RSVP.hash({
        model: repository.findById(params.person_id),
        state_list: state_repository.find(),
        address_types: address_types,
        phoneNumberTypes: phoneNumberTypes
    });
  },//model
  setupController: function(controller, hash) {
      controller.set('model', hash.model);
      controller.set('state_list', hash.state_list);
      controller.set('address_types', hash.address_types);
      controller.set('phoneNumberTypes', hash.phoneNumberTypes);
  },
  init: function() {
    var comp = this.get("tabDoc");
    this.set('editPrivilege', true);
  },
  actions: {
    savePerson: function() {
      var model = this.modelFor('admin.people.person');
      var repository = this.get('repository');
      repository.save(model.model).then(() => {
        this.transitionTo('admin.people');
      });
    },//savePerson
    deletePerson: function() {
      var model = this.modelFor('admin.person');
      // model.destroyRecord().then(() => {
      //   this.transitionTo('admin.people');
      // });
      this.transitionTo('admin.people');
    },
    cancelPerson: function() {
      this.transitionTo('admin.people');
    },
    changeType: function(){
      console.log("I'm here now.");
    }
  },//actions
});
