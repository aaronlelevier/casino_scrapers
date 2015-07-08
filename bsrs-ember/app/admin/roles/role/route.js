import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  repository: inject('role'),
  model: function(params) {
    var repository = this.get('repository');
    return repository.findById(params.role_id);
  },//model

  init: function() {
  },
  actions: {
    saveRole: function() {
      var model = this.modelFor('admin.roles.role');
      var repository = this.get('repository');
      repository.save(model).then(() => {
        this.transitionTo('admin.roles');
      });
    },//saveRole
    deleteRole: function() {
      var model = this.modelFor('admin.roles.role');
      // model.destroyRecord().then(() => {
      //   this.transitionTo('admin.people');
      // });
      this.transitionTo('admin.roles');
    },
    cancelRole: function() {
      this.transitionTo('admin.roles');
    }
  },//actions
});
