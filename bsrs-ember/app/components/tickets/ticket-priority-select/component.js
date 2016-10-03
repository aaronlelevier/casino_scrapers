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
        if(!old_selection_ids.includes(new_model.id)) {
          const pojoNewModel = {id: new_model.get('id'), name: new_model.get('name')};
          model[add_func](pojoNewModel);
        }
      });
      old_selection.forEach((old_model) => {
        /* if new selection does not contain old id, then remove */
        if(!new_selection_ids.includes(old_model.get('id'))) {
          model[remove_func](old_model.get('id'));
        }
      });
    }
  }
});
