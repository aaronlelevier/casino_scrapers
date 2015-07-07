// import DS from 'ember-data';
//
// var attr = DS.attr,
//     belongsTo = DS.belongsTo,
//     hasMany = DS.hasMany,
//     computed = Ember.computed;
//
// export default DS.Model.extend({
//   number: attr('string'),
//   type: belongsTo('admin/phonenumbertype', { async: true }), //load type on load
//   // typeName: attr('string'),
//   location: belongsTo('admin/location', { async: true }),
//   person: belongsTo('admin/person', { async: true })
// });

import Ember from 'ember';

export default Ember.Object.extend({
  number: ''
});
