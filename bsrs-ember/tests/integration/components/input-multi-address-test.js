import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import Person from 'bsrs-ember/models/person';
import AddressType from 'bsrs-ember/models/address-type';
import StateSingle from 'bsrs-ember/models/state';
import Country from 'bsrs-ember/models/country';
import ADDRESS_DEFAULTS from 'bsrs-ember/vendor/defaults/address';
import ADDRESS_TYPE_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import STATE_DEFAULTS from 'bsrs-ember/vendor/defaults/state';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

var store, person, default_type, run = Ember.run;

var STATE_LIST = [StateSingle.create({ id: STATE_DEFAULTS.idTwo, name: STATE_DEFAULTS.nameTwo }), StateSingle.create({ id: STATE_DEFAULTS.id, name: STATE_DEFAULTS.name })];
var COUNTRIES = [Country.create({ id: COUNTRY_DEFAULTS.id, name: COUNTRY_DEFAULTS.name }), Country.create({ id: COUNTRY_DEFAULTS.idTwo, name: COUNTRY_DEFAULTS.nameTwo })];
moduleForComponent('input-multi-address', 'aaron integration: input-multi-address test', {
  integration: true,
  setup() {
    translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:person', 'model:address']);
    default_type = AddressType.create({
      id: ADDRESS_TYPE_DEFAULTS.officeId,
      name: ADDRESS_TYPE_DEFAULTS.officeName
    });
    var service = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(service, json);
  }
});

test('renders a single button with a class of t-btn-add', function(assert) {
  run(function() {
    person = store.push('person', {
      id: PEOPLE_DEFAULTS.id
    });
  });
  var model = store.find('address', {
    model_fk: PEOPLE_DEFAULTS.id
  });
  this.set('model', model);
  this.render(hbs `{{input-multi-address model=model}}`);
  var $component = this.$('.t-input-multi-address');
  assert.equal($component.find('.t-add-address-btn').length, 1);
});

test('click add btn will append blank entry to list of entries and binds value to model', function(assert) {
  run(function() {
    person = store.push('person', {
      id: PEOPLE_DEFAULTS.id
    });
  });
  var model = store.find('address', {
    model_fk: PEOPLE_DEFAULTS.id
  });
  this.set('model', model);
  this.set('related_pk', PEOPLE_DEFAULTS.id);
  this.set('related_field', 'model_fk');
  this.set('default_type', default_type);
  this.render(hbs `{{input-multi-address model=model related_pk=related_pk related_field=related_field default_type=default_type}}`);
  var $component = this.$('.t-input-multi-address');
  assert.equal(model.get('content.length'), 0);
  var $first_btn = $component.find('.t-add-address-btn:eq(0)');
  $first_btn.trigger('click').trigger('change');
  assert.equal(model.get('content.length'), 1);
  assert.equal(model.objectAt(0).get('type'), ADDRESS_TYPE_DEFAULTS.officeId);
  assert.equal(model.objectAt(0).get('model_fk'), PEOPLE_DEFAULTS.id);
  assert.equal(model.objectAt(0).get('address'), undefined);
  assert.equal(model.objectAt(0).get('city'), undefined);
  assert.equal(model.objectAt(0).get('state'), undefined);
  assert.equal(model.objectAt(0).get('postal_code'), undefined);
  this.$('.t-address-address').val(ADDRESS_DEFAULTS.streetOne).trigger('change');
  assert.equal(model.objectAt(0).get('address'), ADDRESS_DEFAULTS.streetOne);
});

test('once added a button for address type appears with a button to delete it', function(assert) {
  //currently in General Settings Route
  var model = store.find('address', {
    model_fk: PEOPLE_DEFAULTS.id
  });
  var address_types = [AddressType.create({
    id: ADDRESS_TYPE_DEFAULTS.officeId,
    name: ADDRESS_TYPE_DEFAULTS.officeName
  }), AddressType.create({
    id: ADDRESS_TYPE_DEFAULTS.shippingId,
    name: ADDRESS_TYPE_DEFAULTS.shippingName
  })];
  this.set('model', model);
  this.set('related_pk', PEOPLE_DEFAULTS.id);
  this.set('related_field', 'model_fk');
  this.set('address_types', address_types);
  this.set('default_type', default_type);
  this.render(hbs `{{input-multi-address model=model types=address_types related_pk=related_pk related_field=related_field default_type=default_type}}`);
  var $component = this.$('.t-input-multi-address');
  var $first_btn = $component.find('.t-add-address-btn:eq(0)');
  var $first_type_select = $component.find('.t-address-type');
  var $first_del = $component.find('.t-del-address-btn:eq(0)');
  assert.equal($first_type_select.length, 0);
  assert.equal($first_del.length, 0);
  $first_btn.trigger('click');
  $first_del = $component.find('.t-del-address-btn:eq(0)');
  $first_type_select = $component.find('.t-address-type-select');
  assert.equal($first_del.length, 1);
  assert.equal($first_type_select.length, 1);
  assert.equal(model.objectAt(0).get("type"), ADDRESS_TYPE_DEFAULTS.officeId);
});

test('click delete btn will remove input', function(assert) {
  run(function() {
    person = store.push('person', {
      id: PEOPLE_DEFAULTS.id,
      address_fks: [ADDRESS_DEFAULTS.idOne, ADDRESS_DEFAULTS.idTwo]
    });
    store.push('address', {
      id: ADDRESS_DEFAULTS.idOne,
      address: ADDRESS_DEFAULTS.streetOne,
      city: ADDRESS_DEFAULTS.cityOne,
      state: ADDRESS_DEFAULTS.stateOne,
      postal_code: ADDRESS_DEFAULTS.zipOne,
      country: ADDRESS_DEFAULTS.countryOne,
      model_fk: PEOPLE_DEFAULTS.id
    });
    store.push('address', {
      id: ADDRESS_DEFAULTS.idTwo,
      address: ADDRESS_DEFAULTS.streetTwo,
      city: ADDRESS_DEFAULTS.cityTwo,
      state: ADDRESS_DEFAULTS.stateTwo,
      postal_code: ADDRESS_DEFAULTS.zipTwo,
      country: ADDRESS_DEFAULTS.countryTwo,
      model_fk: PEOPLE_DEFAULTS.id
    });
  });
  var model = store.find('address', {
    model_fk: PEOPLE_DEFAULTS.id
  });
  this.set('model', model);
  this.render(hbs `{{input-multi-address model=model}}`);
  var $component = this.$('.t-input-multi-address');
  assert.equal(this.$('.t-address-city').length, 2);
  assert.equal($component.find('.t-del-address-btn').length, 2);
  var $first_del_btn = $component.find('.t-del-address-btn:eq(0)');
  $first_del_btn.trigger('click');
  var addresses = store.find('address');
  assert.equal(addresses.get('length'), 2);
  assert.equal(addresses.objectAt(0).get('removed'), true);
});

test('model with existing array of entries is shown at render and bound to model', function(assert) {
  var address_types = [AddressType.create({
    id: ADDRESS_TYPE_DEFAULTS.officeId
  }), AddressType.create({
    id: ADDRESS_TYPE_DEFAULTS.shippingId
  })];
  run(function() {
    store.push('address', {
      id: ADDRESS_DEFAULTS.idOne,
      address: ADDRESS_DEFAULTS.streetOne,
      city: ADDRESS_DEFAULTS.cityOne,
      state: ADDRESS_DEFAULTS.stateOne,
      postal_code: ADDRESS_DEFAULTS.zipOne,
      country: ADDRESS_DEFAULTS.countryOne,
      model_fk: PEOPLE_DEFAULTS.id
    });
    store.push('address', {
      id: ADDRESS_DEFAULTS.idTwo,
      address: ADDRESS_DEFAULTS.streetTwo,
      city: ADDRESS_DEFAULTS.cityTwo,
      state: ADDRESS_DEFAULTS.stateTwo,
      postal_code: ADDRESS_DEFAULTS.zipTwo,
      country: ADDRESS_DEFAULTS.countryTwo,
      model_fk: PEOPLE_DEFAULTS.id
    });
  });
  var model = store.find('address', {
    model_fk: PEOPLE_DEFAULTS.id
  });
  this.set('model', model);
  this.set('address_types', address_types);
  this.set('related_pk', PEOPLE_DEFAULTS.id);
  this.set('related_field', 'model_fk');
  this.set('default_type', default_type);
  this.render(hbs `{{input-multi-address model=model types=address_types related_pk=related_pk related_field=related_fieldi default_type=default_type}}`);
  var $component = this.$('.t-input-multi-address');
  var $select = $component.find('.t-address-type-select');
  assert.equal(model.get('content.length'), 2);
  assert.equal($select.length, 2);
  $component.find('.t-address-address:eq(0)').val(PEOPLE_DEFAULTS.username).trigger('change');
  $component.find('.t-address-city:eq(0)').val('San Jose').trigger('change');
  $component.find('.t-address-postal-code:eq(0)').val('12345').trigger('change');
  assert.equal(model.objectAt(0).get('address'), PEOPLE_DEFAULTS.username);
  assert.equal(model.objectAt(0).get('city'), 'San Jose');
});

test('filling in invalid address reveals validation message', function(assert) {
  var model = store.find('address', {
    model_fk: PEOPLE_DEFAULTS.id
  });
  this.set('model', model);
  this.set('related_pk', PEOPLE_DEFAULTS.id);
  this.set('related_field', 'model_fk');
  this.set('default_type', default_type);
  var address_number_types = [AddressType.create({
    id: ADDRESS_TYPE_DEFAULTS.officeId,
    name: ADDRESS_TYPE_DEFAULTS.officeName
  }), AddressType.create({
    id: ADDRESS_TYPE_DEFAULTS.shippingId,
    name: ADDRESS_TYPE_DEFAULTS.shippingName
  })];
  this.set('address_number_types', address_number_types);
  this.render(hbs `{{input-multi-address model=model types=address_number_types related_pk=related_pk related_field=related_field default_type=default_type}}`);
  var $first_btn = this.$('.t-add-address-btn:eq(0)');
  $first_btn.trigger('click').trigger('change');
  var $component = this.$('.t-input-multi-address-validation-error');
  assert.ok($component.is(':hidden'));
  this.$('.t-address-address').val(ADDRESS_DEFAULTS.streetThree).trigger('change');
  assert.ok($component.is(':hidden'));
  this.$('.t-address-address').val('').trigger('change');
  assert.ok($component.is(':visible'));
});