import Ember from 'ember';

var Person = Ember.Object.extend({

});

export default Person;


// import DS from 'ember-data';

// //ES6 module pattern
// var attr = DS.attr,
//     belongsTo = DS.belongsTo,
//     hasMany = DS.hasMany,
//     computed = Ember.computed;

// export default DS.Model.extend({
//   username: attr('string'),
//   firstName: attr('string'),
//   lastName: attr('string'),
//   //isActive: attr('boolean', {defaultValue: false}),
//   title: attr('string'),
//   emp_number: attr('number'),
//   // role: attr('number'),
//   // roleName: attr('string'),
//   auth_amount: attr('number', {defaultValue: 0}),
//   // phoneNumbers: hasMany('admin/phonenumber', { async: false }), //corrent folder structure determines api req string
//   phoneNumbers: [],
//   //addresses: attr('string'),
//   //emails: hasMany('emails'),
//   //createdAt: attr('string', {
//     //defaultValue: function() { return new Date(); }
//   //})
//   fullName: computed('firstName', 'lastName', function(key, value) {
//     return this.get('firstName') + ' ' + this.get('lastName');
//   }),

//   //roles: DS.belongsTo('roles'),
// });
