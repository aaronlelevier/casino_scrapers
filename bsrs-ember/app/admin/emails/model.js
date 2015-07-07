import DS from 'ember-data';

var attr = DS.attr,
    belongsTo = DS.belongsTo,
    hasMany = DS.hasMany,
    computed = Ember.computed;

export default DS.Model.extend({
  email: attr('string'),
  type: attr('string'),
  person: belongsTo('person')
});
