import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import initializer from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import AddressType from 'bsrs-ember/models/address-type';
import StateSingle from 'bsrs-ember/models/state'; // weird name because State is a reserved word
import Country from 'bsrs-ember/models/country';
import ADDRESS_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import STATE_DEFAULTS from 'bsrs-ember/vendor/defaults/state';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

function createAddress(id) {
  return Ember.Object.create({
    id: id,
    type: ADDRESS_DEFAULTS.officeId,
    address: '9325 Sky Park Ct\nSuite 120',
    city: 'San Diego',
    state: STATE_DEFAULTS.id,
    zip: '92123',
    country: COUNTRY_DEFAULTS.id
  });
}//createAddress

var STATE_LIST = [StateSingle.create({ id: STATE_DEFAULTS.idTwo, name: STATE_DEFAULTS.nameTwo }), StateSingle.create({ id: STATE_DEFAULTS.id, name: STATE_DEFAULTS.name })];
var ADDRESS_TYPES = [AddressType.create({ id: ADDRESS_DEFAULTS.officeId, name: ADDRESS_DEFAULTS.officeName }), AddressType.create({ id: ADDRESS_DEFAULTS.shippingId, name: ADDRESS_DEFAULTS.shippingName })];
var COUNTRIES = [Country.create({ id: COUNTRY_DEFAULTS.id, name: COUNTRY_DEFAULTS.name }), Country.create({ id: COUNTRY_DEFAULTS.idTwo, name: COUNTRY_DEFAULTS.nameTwo })];

moduleForComponent('input-multi-address', 'integration: input-multi-address test', {
    integration: true,
    setup() {
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
    this.set('state_list', STATE_LIST);
    this.set('address_types', ADDRESS_TYPES);
    this.set('countries', COUNTRIES);

    // render the component
    this.render(hbs`{{input-multi-address model=model.addresses state_list=state_list address_types=address_types countries=countries }}`);

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
    assert.equal($component.find('.t-address-state option').length, 3);
    assert.equal($component.find('.t-address-country option').length, 3);

    // make sure that we also added a record to the model
    assert.equal(model.get('addresses').length, 1);
    //
    // //make sure that the record is blank
    assert.equal(model.get('addresses').objectAt(0).get('type'), ADDRESS_DEFAULTS.officeId);
    assert.equal(model.get('addresses').objectAt(0).get('address'), '');
    assert.equal(model.get('addresses').objectAt(0).get('city'), '');
    assert.equal(model.get('addresses').objectAt(0).get('state'), '');
    assert.equal(model.get('addresses').objectAt(0).get('postal_code'), '');

    //Update all fields and make sure that the model is updated
    this.$('.t-address').val(PEOPLE_DEFAULTS.username).trigger('change');

    //assert.equal(model.get('addresses').objectAt(0).get('type'), 2);
    assert.equal(model.get('addresses').objectAt(0).get('address'), PEOPLE_DEFAULTS.username);

});

test('click delete btn will remove input', function(assert) {

    var model = Person.create({ addresses: [ createAddress('b51665da-7a21-41e6-9956-d0d0ebbd27d1') ]});

    this.set('model', model);
    this.set('state_list', STATE_LIST);
    this.set('address_types', ADDRESS_TYPES);
    this.set('countries', COUNTRIES);

    // render the component
    this.render(hbs`{{input-multi-address model=model.addresses state_list=state_list address_types=address_types countries=countries }}`);

    //get a jQuery handle to the component
    var $component = this.$('.t-input-multi-address');

    assert.equal($component.find('.t-del-btn').length, 1);

    var $first_del_btn = $component.find('.t-del-btn:eq(0)');
    $first_del_btn.trigger('click');
    assert.equal($component.find('.t-del-btn').length, 0);

});

test('model with existing array of entries is shown at render and bound to model', function(assert) {

    var model = Person.create({
        addresses: [
            createAddress('b51665da-7a21-41e6-9956-d0d0ebbd27d1'),
            createAddress('b51665da-7a21-41e6-9956-d0d0ebbd27d2'),
            createAddress('b51665da-7a21-41e6-9956-d0d0ebbd27d3')
        ]
    });

    this.set('model', model);
    this.set('state_list', STATE_LIST);
    this.set('address_types', ADDRESS_TYPES);
    this.set('countries', COUNTRIES);

    // render the component
    this.render(hbs`{{input-multi-address model=model.addresses state_list=state_list address_types=address_types countries=countries }}`);

    var $component = this.$('.t-input-multi-address');
    assert.equal($component.find('.t-del-btn').length, 3);
    $component.find('.t-address-type:eq(0)').val(ADDRESS_DEFAULTS.officeId).trigger('change');
    $component.find('.t-address:eq(0)').val(PEOPLE_DEFAULTS.username).trigger('change');
    $component.find('.t-address-city:eq(0)').val('San Jose').trigger('change');
    $component.find('.t-address-state:eq(0)').val(STATE_DEFAULTS.idTwo).trigger('change');
    $component.find('.t-address-postal-code:eq(0)').val('12345').trigger('change');
    $component.find('.t-address-country:eq(0)').val(COUNTRY_DEFAULTS.idTwo).trigger('change');

    assert.equal(model.get('addresses').objectAt(0).get('type'), ADDRESS_DEFAULTS.officeId);
    assert.equal(model.get('addresses').objectAt(0).get('address'), PEOPLE_DEFAULTS.username);
    assert.equal(model.get('addresses').objectAt(0).get('city'), 'San Jose');
    assert.equal(model.get('addresses').objectAt(0).get('state'), STATE_DEFAULTS.idTwo);
    assert.equal(model.get('addresses').objectAt(0).get('country'), COUNTRY_DEFAULTS.idTwo);
});
