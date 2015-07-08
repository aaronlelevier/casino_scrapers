import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  repository: inject('role'),
  model: function(params) {
    var repository = this.get('repository');
    return repository.find();
  },
  actions: {
    cancel: function() {
      this.transitionTo('admin.roles');
    },
    new: function() {
      this.transitionTo('admin.roles.new');
    }
  }
});
