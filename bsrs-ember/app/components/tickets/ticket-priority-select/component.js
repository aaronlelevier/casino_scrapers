import Ember from 'ember';

export default Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  options: Ember.computed(function() {
    return this.get('simpleStore').find('ticket-priority');
  }),
  actions: {
    update(new_selection){
      const model = this.get('model');
      const add_func = 'add_criteria';
      const remove_func = 'remove_criteria';
      const old_selection = model.get('criteria');
      const old_selection_ids = model.get('criteria_ids');
      const new_selection_ids = new_selection.mapBy('id');
      new_selection.forEach((new_model) => {
        if(Ember.$.inArray(new_model.id, old_selection_ids) < 0) {
          model[add_func](new_model);
        }
      });
      old_selection.forEach((old_model) => {
        /* if new selection does not contain old id, then remove */
        if(Ember.$.inArray(old_model.get('id'), new_selection_ids) < 0){
          model[remove_func](old_model.get('id'));
        }
      });
      if (new_selection.length === 0) {
        this.set('addFilterDisabled', true);
      } else {
        this.set('addFilterDisabled', false);
      }
    }
  }
});
