import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import PhoneNumberType from 'bsrs-ember/models/phonenumber-type';

moduleForComponent('input-multi-phone', 'integration: input-multi-phone test', {
  integration: true,
  setup: function() {
    translation.initialize(this);
  }
});

test('defaults to use phone number model with field name of number', function(assert) {
  var model = Person.create({ phonenumbers: []}); //TODO: is this callout in create needed/good for the reader
  this.set('model', model);

  this.render(hbs`{{input-multi-phone model=model.phonenumbers}}`);

  var $component = this.$('.t-input-multi-phone');

  assert.equal(this.$('.t-new-entry').length, 0);

  var $first_btn = $component.find('.t-add-btn:eq(0)');

  $first_btn.trigger('click');

  assert.equal(this.$('.t-new-entry').length, 1);

  assert.equal(model.get('phonenumbers').length, 1);

  assert.equal(model.get('phonenumbers').objectAt(0).get('number'), '');

  this.$('.t-new-entry').val('andier').trigger('change');

  assert.equal(model.get('phonenumbers').objectAt(0).get('number'), 'andier');
});

test('once added a button for phone number type appears', function(assert) {
  var model = Person.create({ phonenumbers: []});
  var phoneNumberTypes = [PhoneNumberType.create({ id: 1, name: 'admin.phonenumbertype.office' }), PhoneNumberType.create({ id: 2, name: 'admin.phonenumbertype.mobile' })];
  this.set('model', model);
  this.set('phonenumberTypes', phoneNumberTypes);

  this.render(hbs`{{input-multi-phone model=model.phonenumbers types=phonenumberTypes}}`);

  var $component = this.$('.t-input-multi-phone');
  var $first_btn = $component.find('.t-add-btn:eq(0)');
  var $first_type_select = $component.find('.t-multi-phone-type');
  assert.equal($first_type_select.length, 0);
  $first_btn.trigger('click');
  $first_type_select = $component.find('.t-multi-phone-type');
  assert.equal($first_type_select.length, 1);
  //NOTE: If we modify from select to div / ul the below needs to be updated
  assert.equal($first_type_select.find('option').length, 2);
  assert.equal($first_type_select.find('option:eq(0)').text(), 'Office');
  assert.equal($first_type_select.find('option:eq(1)').text(), 'Mobile');
  assert.equal(model.get("phonenumbers").objectAt(0).get("type"), 1);
});

test('changing the phone number type will alter the bound value', function(assert) {
  var model = Person.create({ phonenumbers: []});
  var phoneNumberTypes = [PhoneNumberType.create({ id: 1, name: 'admin.phonenumbertype.office' }), PhoneNumberType.create({ id: 2, name: 'admin.phonenumbertype.mobile' })];
  this.set('model', model);
  this.set('phonenumberTypes', phoneNumberTypes);

  this.render(hbs`{{input-multi-phone model=model.phonenumbers types=phonenumberTypes}}`);

  var $component = this.$('.t-input-multi-phone');
  var $first_btn = $component.find('.t-add-btn:eq(0)');
  var $first_type_select = $component.find('.t-multi-phone-type');
  assert.equal($first_type_select.length, 0);
  $first_btn.trigger('click');
  $first_type_select = $component.find('.t-multi-phone-type');
  assert.equal(model.get("phonenumbers").objectAt(0).get("type"), 1);
  $first_type_select.val(2).trigger("change");
  assert.equal(model.get("phonenumbers").objectAt(0).get("type"), 2);
});
