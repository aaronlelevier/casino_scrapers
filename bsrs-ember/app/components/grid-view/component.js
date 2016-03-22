import Ember from 'ember';

var GridViewComponent = Ember.Component.extend({
  customHeaderBlock: false,
  classNames: ['wrapper'],
  actions: {
    save_filterset(name){
      //can't reproduce in tests but this is needed. Check selenium if tested
      this.sendAction('save_filterset', name);
    }
  }
});

export default GridViewComponent;
