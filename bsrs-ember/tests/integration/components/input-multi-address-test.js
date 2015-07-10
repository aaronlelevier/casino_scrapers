import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import initializer from "bsrs-ember/instance-initializers/ember-i18n";
import Ember from 'ember';

function createAddress(id) {
  return Ember.Object.create({
    id: id,
    type: 'Office',
    address: '9325 Sky Park Ct\nSuite 120',
    city: 'San Diego',
    state: 'CA',
    zip: '92123',
    country: 'United States of America'
  });
}//createPerson

var People = Ember.Object.extend({
  addresses: null
});

var XAddress = Ember.Object.extend({
  type: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: ''
});



moduleForComponent('input-multi-address', 'integration: input-multi-address test', {
  integration: true,
  setup: function() {
    initializer.initialize(this);
  }
});

test('renders a single button with a class of t-add-btn', function(assert){

  this.render(hbs`{{input-multi-address model=addresses}}`);
  var $component = this.$('.t-input-multi-address');
  assert.equal($component.find('.t-add-btn').length, 1);

});

test('click add btn will append blank entry to list of entries and binds value to model', function(assert) {

  this.registry.register('model:x-address', XAddress);

  // Create an empty model to push new entries into
  var model = People.create({ addresses: []});
  this.set('model', model);

  // render the component - a new entry will be a phone number, and the value will be a "number"
  this.render(hbs`{{input-multi-address model=model.addresses modelType="x-address"}}`);

  //get a jQuery handle to the component
  var $component = this.$('.t-input-multi-address');

  //make sure that there is no address block to start
  assert.equal(this.$('.t-del-btn').length, 0);

  //get a jQ handle to the add button
  var $first_btn = $component.find('.t-add-btn:eq(0)');

  // click the add button
  // $first_btn.trigger('click');

  //make sure there is now 1 empty input
  // assert.equal(this.$('.t-del-btn').length, 1);

  // //make sure that we also added a record to the model
  // assert.equal(model.get('addresses').length, 1);
  //
  // //make sure that the record is blank
  // assert.equal(model.get('addresses').objectAt(0).get('type'), '');
  //
  // this.$('.t-address').val('andier').trigger('change');
  //
  // assert.equal(model.get('addresses').objectAt(0).get('address'), 'andier');

});

//
// test('click delete btn will remove input', function(assert) {
//
//   var model = People.create({ phonenumbers: [
//     createPerson(1)
//   ] });
//
//   this.set('model', model);
//
//   this.render(hbs`{{input-multi model=model.phonenumbers }}`);
//   var $component = this.$('.t-input-multi');
//
//   assert.equal(this.$('.t-new-entry').length, 1);
//
//   var $first_del_btn = $component.find('.t-del-btn:eq(0)');
//     $first_del_btn.trigger('click');
//     assert.equal(this.$('.t-new-entry').length, 0);
//
// });
//
//
// test('model with existing array of entries is shown at render and bound to model', function(assert) {
//
//   var model = People.create({ phonenumbers: [
//       createPerson(1),
//       createPerson(3),
//       createPerson(4)
//   ] });
//
//   this.set('model', model);
//
//   this.render(hbs`{{input-multi model=model.phonenumbers modelType="x-number" fieldNames="number"}}`);
//   var $component = this.$('.multi-entry');
//
//   assert.equal(this.$('.t-new-entry').length, 3);
//
//   this.$('.t-new-entry:eq(0)').val('andier').trigger('change');
//
//   assert.equal(model.get('phonenumbers').objectAt(0).get('number'), 'andier');
//
// });
//
// test('keep original value for editing', function(assert) {
//
//   this.registry.register('model:x-number', XNumber);
//
//   // Create an empty model to push new entries into
//   var originalNumber =  "999-Nevermind";
//   var number = XNumber.create({
//     number: originalNumber
//   });
//   var model = People.create({ phonenumbers: [number] });
//   this.set('model', model);
//
//   // render the component - a new entry will be a phone number, and the value will be a "number"
//   this.render(hbs`{{input-multi model=model.phonenumbers modelType="x-number" fieldNames="number"}}`);
//
//   //get a jQuery handle to the component
//   var $component = this.$('.t-input-multi');
//
//   //Make sure that the original value matches our model
//   assert.equal(model.get('phonenumbers').objectAt(0).get('number'), originalNumber);
//   //
//   // var myE = $.Event('keyup');
//   // myE.which = 65;
//   // this.$('.t-new-entry').trigger(myE).trigger('change');
//   //
//   // console.log("New Value: " + this.$('.t-new-entry').val());
//   // assert.equal(model.get('phonenumbers').objectAt(0).get('number'), originalNumber);
//
//
// });
