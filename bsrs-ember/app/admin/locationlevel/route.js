import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.store.find('admin/locationlevel', params.loc_id, {reload: true});
  },//model
  setupController: function(controller, model){
    controller.set("model", model);
    controller.set("mylocationlevels", this.store.find("admin/locationlevel"));
  },
  init: function() {
    this.set('editPrivilege', true);
  },

  actions: {
    save: function() {
      var model = this.modelFor('admin.locationlevel');
      model.save().then(() => {
        this.transitionTo('admin.locationlevels');
      }).catch((error) => {
        console.log(error);
      });
    },//savePerson
    delete: function() {
      var model = this.modelFor('admin.locationlevel');
      // model.destroyRecord().then(() => {
      //   this.transitionTo('admin.people');
      // });
      this.transitionTo('admin.locationlevels');
    },
    cancel: function() {
      this.transitionTo('admin.locationlevels');
    }
  },//actions
});
