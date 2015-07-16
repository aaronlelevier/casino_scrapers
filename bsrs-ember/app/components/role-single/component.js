import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['wrapper', 'form'],
  // init(){
	// 	var comp = this.get("tabDoc");
  //   this.set('editPrivilege', true);
	// },
  actions: {
    saveRole() {
      this.sendAction('saveRole');
    },//savePerson
    deleteRole() {
      var model = this.modelFor('admin.roles.role');
      // model.destroyRecord().then(() => {
      //   this.transitionTo('admin.people');
      // });
      this.transitionTo('admin.roles');
    },
    cancelRole() {
      this.sendAction('cancelRole');
    }
  },//actions
});
