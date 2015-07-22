import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import initializer from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import AddressType from 'bsrs-ember/models/address-type';
import StateSingle from 'bsrs-ember/models/state'; // weird name because State is a reserved word
import Country from 'bsrs-ember/models/country';
import AddressDefaults from 'bsrs-ember/vendor/address-type';
import Ember from 'ember';

function createAddress(id) {
  return Ember.Object.create({
    id: id,
    type: 2,
    address: '9325 Sky Park Ct\nSuite 120',
    city: 'San Diego',
    state: 1,
    zip: '92123',
    country: 1
  });
}//createAddress

var STATE_LIST = [StateSingle.create({ id: 1, name: "Alabama" }), StateSingle.create({ id: 2, name: "California" })];
var ADDRESS_TYPES = [AddressType.create({ id: AddressDefaults.officeType, name: AddressDefaults.officeName }), AddressType.create({ id: AddressDefaults.shippingType, name: AddressDefaults.shippingName })];
var COUNTRIES = [Country.create({ id: 1, name: 'United States' }), Country.create({ id: 2, name: 'Canada' })];

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

    var model = Person.create({ addresses: [ createAddress(1) ]});

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
            createAddress(1),
            createAddress(3),
            createAddress(4)
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
    $component.find('.t-address-type:eq(0)').val(2).trigger('change');
    $component.find('.t-address:eq(0)').val('andier').trigger('change');
    $component.find('.t-address-city:eq(0)').val('San Jose').trigger('change');
    $component.find('.t-address-state:eq(0)').val(2).trigger('change');
    $component.find('.t-address-postal-code:eq(0)').val('12345').trigger('change');
    $component.find('.t-address-country:eq(0)').val(2).trigger('change');

    assert.equal(model.get('addresses').objectAt(0).get('type'), 2);
    assert.equal(model.get('addresses').objectAt(0).get('address'), 'andier');
    assert.equal(model.get('addresses').objectAt(0).get('city'), 'San Jose');
    assert.equal(model.get('addresses').objectAt(0).get('state'), 2);
    assert.equal(model.get('addresses').objectAt(0).get('country'), 2);

});
