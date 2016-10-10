import Ember from 'ember';

var PowerSelectActionComponent = Ember.Component.extend({
  displayName: 'name',
  objSelected: Ember.computed(function() {
    //field has option w/ property isChecked
    const options = this.get('field').get('options') || [];
    var obj = options.filter((opt) => {
      if (opt.get('isChecked')) {
        return this.set('objSelected', opt);
      }
    });
    return obj[0];
  }),
  actions: {
    /*
    * @method selected
    * only used for dt update request. TODO: need to change name
    * updateRequest is curried down from field-element-display component
    * @param obj - option model. May be null if clear out select
    */
    selected(obj) {
      const action = this.get('action');
      const val = obj ? obj.get('text') : null;
      action(val, this.get('ticket'), obj);
      this.set('objSelected', obj);
    }
  },
});

export default PowerSelectActionComponent;
