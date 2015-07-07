import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    cancelPersonEdit: function() {
      this.transitionTo('admin.people');
    },
    createPerson: function() {
      var title = this.get('title'),
          first_name = this.get('first_name'),
          last_name = this.get('last_name'),
          is_active = this.get('is_active'),
          empnumber = this.get('empnumber'),
          role = this.get('role'),
          username = this.get('username'),
          authamount = this.get('authamount');

      if (!title.trim() || !first_name.trim()) {return;}

      var person = this.store.createRecord('admin.person', {
        title: title,
        username: username,
        firstName: first_name,
        lastName: last_name,
        isActive: is_active,
        authamount: authamount,
        empnumber: empnumber,
        role: role
      });
      this.set('first_name', '');

      person.save();

    }//createPerson
  }//actions
});
