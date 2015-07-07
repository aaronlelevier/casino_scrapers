import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  repository: inject('person'),
  model: function(params) {
    var repository = this.get('repository');
    return repository.findById(params.person_id);
    //return store.find("person", pk);
  },//model

  init: function() {
    var comp = this.get("tabDoc");
    this.set('editPrivilege', true);
  },
  actions: {
    savePerson: function() {
      var model = this.modelFor('admin.people.person');
      var repository = this.get('repository');
      repository.save(model).then(() => {
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
    }
  },//actions
});
