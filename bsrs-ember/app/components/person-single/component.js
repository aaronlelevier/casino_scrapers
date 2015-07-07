import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['wrapper', 'form'],
  // init: function(){
	// 	var comp = this.get("tabDoc");
  //   this.set('editPrivilege', true);
	// },
  actions: {
    savePerson: function() {
      this.sendAction('savePerson');
    },//savePerson
    deletePerson: function() {
      var model = this.modelFor('admin.person');
      // model.destroyRecord().then(() => {
      //   this.transitionTo('admin.people');
      // });
      this.transitionTo('admin.people');
    },
    cancelPerson: function() {
      this.sendAction('cancelPerson');
    }
  },//actions
});
