import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import initializer from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import STATE_FIXTURES from 'bsrs-ember/vendor/state_fixtures';
import ADDRESS_TYPES_FIXTURES from 'bsrs-ember/vendor/address_types_fixtures';
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
}//createAddress
//
// var People = Ember.Object.extend({
//   addresses: null
// });

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

  var model = Person.create({ addresses: []});
  this.set('model', model);

  this.set('state_list', STATE_FIXTURES);
  this.set('address_types', ADDRESS_TYPES_FIXTURES);

  // render the component
  this.render(hbs`{{input-multi-address model=model.addresses state_list=state_list address_types=address_types}}`);

  //get a jQuery handle to the component
  var $component = this.$('.t-input-multi-address');

  //make sure that there is no address block to start
  assert.equal(this.$('.t-del-btn').length, 0);

  //get a jQ handle to the add button
  var $first_btn = $component.find('.t-add-btn:eq(0)');

  // click the add button
  $first_btn.trigger('click');

  //make sure there is now 1 empty input
  assert.equal($component.find('.t-del-btn').length, 1);
  assert.equal($component.find('.t-address-type').length, 1);
  assert.equal($component.find('.t-address-state').length, 1);
  assert.equal($component.find('.t-address-state option').length, 51);

  // make sure that we also added a record to the model
  assert.equal(model.get('addresses').length, 1);
  //
  // //make sure that the record is blank
  assert.equal(model.get('addresses').objectAt(0).get('type'), 1);
  assert.equal(model.get('addresses').objectAt(0).get('address'), '');
  assert.equal(model.get('addresses').objectAt(0).get('city'), '');
  assert.equal(model.get('addresses').objectAt(0).get('state'), '');
  assert.equal(model.get('addresses').objectAt(0).get('postal_code'), '');

  //Update all fields and make sure that the model is updated
  this.$('.t-address').val('andier').trigger('change');

  //assert.equal(model.get('addresses').objectAt(0).get('type'), 2);
  assert.equal(model.get('addresses').objectAt(0).get('address'), 'andier');

});

test('click delete btn will remove input', function(assert) {

  var model = Person.create({ addresses: [
    createAddress(1)
  ] });

  this.set('model', model);

  this.set('state_list', STATE_FIXTURES);
  this.set('address_types', ADDRESS_TYPES_FIXTURES);

  // render the component
  this.render(hbs`{{input-multi-address model=model.addresses state_list=state_list address_types=address_types}}`);

  //get a jQuery handle to the component
  var $component = this.$('.t-input-multi-address');

  assert.equal(this.$('.t-del-btn').length, 1);

  var $first_del_btn = $component.find('.t-del-btn:eq(0)');
  $first_del_btn.trigger('click');
  assert.equal(this.$('.t-del-btn').length, 0);

});

test('model with existing array of entries is shown at render and bound to model', function(assert) {

  var model = Person.create({ addresses: [
      createAddress(1),
      createAddress(3),
      createAddress(4)
  ] });

  this.set('model', model);

  this.render(hbs`{{input-multi-address model=model.addresses state_list=state_list address_types=address_types}}`);

  assert.equal(this.$('.t-del-btn').length, 3);

  this.$('.t-address:eq(0)').val('andier').trigger('change');

  assert.equal(model.get('addresses').objectAt(0).get('address'), 'andier');

});
