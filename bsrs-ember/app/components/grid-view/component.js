import Ember from 'ember';
const { inject } = Ember;

var GridViewComponent = Ember.Component.extend({
  customHeaderBlock: false,
  classNames: ['wrapper'],
  personCurrent: inject.service(),
});

export default GridViewComponent;
