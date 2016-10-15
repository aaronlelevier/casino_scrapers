import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
// import loadTranslations from 'bsrs-ember/tests/helpers/translations';
// import translation from "bsrs-ember/instance-initializers/ember-i18n";
// import translations from "bsrs-ember/vendor/translation_fixtures";
import AD from 'bsrs-ember/vendor/defaults/address';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import LADD from 'bsrs-ember/vendor/defaults/location-join-address';
// import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
// import STATE_DEFAULTS from 'bsrs-ember/vendor/defaults/state';
import LD from 'bsrs-ember/vendor/defaults/location';
import ADTYPEREPO from 'bsrs-ember/repositories/address-type';

var store, addresses;

moduleForComponent('input-multi-address', 'integration: input-multi-address test', {
  integration: true,
  setup() {
    // translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:location', 'model:address', 'model:location-join-address', 'model:address-type']);
    const location = store.push('location', { id: LD.idOne, location_addresses_fks: [LADD.idOne] });
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
    store.push('address', {id: AD.idOne, street: AD.streetOne, address_type_fk: ATD.idOne});
    store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
    addresses = store.find('address');
    store.push('address-type', {id: ATD.officeId, name: ATD.officeName});
    store.push('address-type', {id: ATD.shippingId, name: ATD.shippingName});
    this.set('model', location);
    this.set('addresses', addresses);
    this.address_type_repo = ADTYPEREPO.create({simpleStore: store});
    this.simpleStore = store;
    this.render(hbs `{{input-multi-address addresses=addresses model=model address_type_repo=address_type_repo simpleStore=simpleStore}}`);
    // var service = this.container.lookup('service:i18n');
    // var json = translations.generate('en');
    // loadTranslations(service, json);
  }
});

test('renders a single button', function(assert) {
  this.render(hbs `{{input-multi-address}}`);
  var $component = this.$('.t-input-multi-address');
  assert.equal($component.find('.t-add-address-btn').length, 1);
});

test('click add btn will append blank entry to list of entries and binds value to model', function(assert) {
  var $component = this.$('.t-input-multi-address');
  var $first_btn = $component.find('.t-add-address-btn');
  assert.equal(addresses.get('length'), 1);
  assert.equal(addresses.objectAt(0).get('address_type_fk'), ATD.idOne);
  assert.equal(addresses.objectAt(0).get('address_type').get('id'), ATD.idOne);
  $first_btn.trigger('click').trigger('change');
  assert.equal(addresses.objectAt(0).get('address_type_fk'), ATD.idOne);
  assert.equal(addresses.objectAt(0).get('address_type').get('id'), ATD.idOne);
  // default is address when add new address
  assert.equal(addresses.get('length'), 2);
  assert.equal(addresses.objectAt(1).get('address_type_fk'), ATD.officeId);
  assert.equal(addresses.objectAt(1).get('address_type').get('id'), ATD.officeId);
  assert.equal(addresses.objectAt(1).get('address'), undefined);
  assert.equal(addresses.objectAt(1).get('city'), undefined);
  assert.equal(addresses.objectAt(1).get('state'), undefined);
  assert.equal(addresses.objectAt(1).get('postal_code'), undefined);
  this.$('.t-address-address1').val(AD.streetOne).trigger('change');
  this.$('.t-address-postal-code1').val(AD.zipOne).trigger('change');
  assert.equal(addresses.objectAt(1).get('address'), AD.streetOne);
  assert.equal(addresses.objectAt(1).get('postal_code'), AD.zipOne);
  // leaving out other fields b/c possiblity using GOOGLE API for this stuff
});

test('once added a button for address type appears with a button to delete it', function(assert) {
  let $component = this.$('.t-input-multi-address');
  let $first_btn = $component.find('.t-add-address-btn');
  let $del = $component.find('.t-del-address-btn');
  let $select = $component.find('.t-address-type-select');
  assert.equal($del.length, 1);
  assert.equal($select.length, 1);
  $first_btn.trigger('click').trigger('change');
  $del = $component.find('.t-del-address-btn');
  $select = $component.find('.t-address-type-select');
  assert.equal($del.length, 2);
  assert.equal($select.length, 2);
  // const $last_del_btn = $component.find('.t-del-address-btn:eq(1)');
  // $last_del_btn.trigger('click').trigger('change');
  // $del = $component.find('.t-del-address-btn');
  // $select = $component.find('.t-address-type-select');
  // assert.equal($del.length, 1);
  // assert.equal($select.length, 1);
});
