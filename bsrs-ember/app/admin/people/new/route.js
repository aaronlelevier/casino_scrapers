import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    cancelPersonEdit() {
      this.transitionTo('admin.people');
    },
    createPerson() {
      var title = this.get('title'),
          first_name = this.get('first_name'),
          last_name = this.get('last_name'),
          is_active = this.get('is_active'),
          emp_number = this.get('emp_number'),
          role = this.get('role'),
          username = this.get('username'),
          auth_amount = this.get('auth_amount');

      if (!title.trim() || !first_name.trim()) {return;}

      var person = this.store.createRecord('admin.person', {
        title: title,
        username: username,
        firstName: first_name,
        lastName: last_name,
        isActive: is_active,
        auth_amount: auth_amount,
        emp_number: emp_number,
        role: role
      });
      this.set('first_name', '');

      person.save();

    }//createPerson
  }//actions
});
