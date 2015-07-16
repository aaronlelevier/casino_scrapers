import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  repository: inject('person'),
  model: function(params) {
    var repository = this.get('repository');
    return repository.find();
  },
  actions: {
    cancel() {
      this.transitionTo('admin.people');
    },
    new() {
      this.transitionTo('admin.people.new');
    }
  }
});
