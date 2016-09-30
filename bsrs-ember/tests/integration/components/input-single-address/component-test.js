import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import AD from 'bsrs-ember/vendor/defaults/address';
import LD from 'bsrs-ember/vendor/defaults/location';
import LADD from 'bsrs-ember/vendor/defaults/location-join-address';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, trans;

moduleForComponent('input-single-address', 'Integration | Component | input single address', {
  integration: true,
  beforeEach() {
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:address', 'model:address-type', 'model:location', 'model:location-join-address']);
    trans = this.container.lookup('service:i18n');
  },
  afterEach() {
    generalPage.removeContext(this);
  }
});

test('if pass noDelete as true, no delete button', function(assert) {
  this.render(hbs`{{input-single-address}}`);
  assert.equal(this.$('.t-del-address-btn').length, 1);
  this.render(hbs`{{input-single-address noDelete=true}}`);
  assert.equal(this.$('.t-del-address-btn').length, 0);
});

test('setup for belongsTo works', function(assert) {
  let tenant, address;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_address_fk: AD.idOne});
    store.push('address', {id: AD.idOne, address: AD.streetOne, tenants: [TD.idOne]});
    address = store.push('address', {id: AD.idOne, address_type_fk: ATD.idOne});
    store.push('address-type', {id: ATD.idOne, name: ATD.officeName, addresses: [AD.idOne]});
  });
  this.model = tenant;
  this.address=address;
  this.render(hbs`{{input-single-address model=model address=address}}`);
  assert.equal(this.$('.t-address-type-select').text().trim(), trans.t(ATD.officeName));
  assert.equal(this.$('.t-address-address').val(), AD.streetOne);
});

test('setup for m2m works and can delete', function(assert) {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne]});
    store.push('address', {id: AD.idOne, address: AD.streetOne, address_type_fk: ATD.idOne});
    store.push('address-type', {id: ATD.idOne, name: ATD.officeName, addresses: [AD.idOne]});
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
  });
  this.model = location;
  this.address=location.get('addresses').objectAt(0);
  this.index = 0;
  this.render(hbs`{{input-single-address model=model address=address index=index}}`);
  assert.equal(this.$('.t-address-type-select').text().trim(), trans.t(ATD.officeName));
  assert.equal(this.$('.t-address-address0').val(), AD.streetOne);
  assert.equal(location.get('addresses').get('length'), 1);
  generalPage.clickDeleteAddress();
  assert.equal(location.get('addresses').get('length'), 0);
  // dont get two way db
  // assert.equal(this.$('.t-address-type-select').text().trim(), trans.t(ATD.officeName));
  // assert.equal(this.$('.t-address-address0').val(), '');
});