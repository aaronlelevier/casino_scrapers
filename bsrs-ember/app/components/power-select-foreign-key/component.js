import Ember from 'ember';

var PowerSelectFKComponent = Ember.Component.extend({
  displayName: 'name',
  actions: {
    selected(obj) {
      let change_method_name = this.get('change_method');
      this.get('mainModel')[change_method_name](obj ? obj.get('id') : null);
    }
  },
});

export default PowerSelectFKComponent;
