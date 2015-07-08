import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['wrapper', 'form'],
  // init: function(){
	// 	var comp = this.get("tabDoc");
  //   this.set('editPrivilege', true);
	// },
  actions: {
    saveRole: function() {
      this.sendAction('saveRole');
    },//savePerson
    deleteRole: function() {
      var model = this.modelFor('admin.roles.role');
      // model.destroyRecord().then(() => {
      //   this.transitionTo('admin.people');
      // });
      this.transitionTo('admin.roles');
    },
    cancelRole: function() {
      this.sendAction('cancelRole');
    }
  },//actions
});
