import Ember from 'ember';

var TicketPriority = Ember.Component.extend({
  selected: Ember.computed('role.role_type', function() {
    const all_role_types = this.get('all_role_types') || [];
    return all_role_types.filter((type) => {
      return type.get('name') === this.get('role').get('role_type');
    }).objectAt(0);
  }),
  actions: {
    selected(role) {
      const model = this.get('role');
      model.set('role_type', role.get('name'));
    },
  }
});

export default TicketPriority;
