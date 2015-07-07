import DS from 'ember-data';

var attr = DS.attr,
    belongsTo = DS.belongsTo,
    hasMany = DS.hasMany,
    computed = Ember.computed;

export default DS.Model.extend({
  name: attr('string')
});
