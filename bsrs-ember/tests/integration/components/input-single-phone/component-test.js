import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import LD from 'bsrs-ember/vendor/defaults/location';
import LPHD from 'bsrs-ember/vendor/defaults/location-join-phonenumber';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, trans;

moduleForComponent('input-single-phone', 'Integration | Component | input single phone', {
  integration: true,
  beforeEach() {
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:phonenumber', 'model:phone-number-type', 'model:location', 'model:location-join-phonenumber']);
    trans = this.container.lookup('service:i18n');
  },
  afterEach() {
    generalPage.removeContext(this);
  }
});

test('pass noDelete as true, no delete button', function(assert) {
  this.render(hbs`{{input-single-phone}}`);
  assert.equal(this.$('.t-del-phone-number-btn').length, 1);
  this.render(hbs`{{input-single-phone noDelete=true}}`);
  assert.equal(this.$('.t-del-phone-number-btn').length, 0);
});

test('setup for belongsTo works', function(assert) {
  let tenant, phonenumber;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_number_fk: PND.idOne});
    store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, tenants: [TD.idOne]});
    phonenumber = store.push('phonenumber', {id: PND.idOne, phone_number_type_fk: PNTD.idOne});
    store.push('phone-number-type', {id: PNTD.idOne, name: PNTD.officeName, phonenumbers: [PND.idOne]});
  });
  this.model = tenant;
  this.phonenumber=phonenumber;
  this.render(hbs`{{input-single-phone model=model phonenumber=phonenumber}}`);
  assert.equal(this.$('.t-phone-number-type-select').text().trim(), trans.t(PNTD.officeName));
  assert.equal(this.$('.t-phonenumber-number').val(), PND.numberOne);
});

test('setup for m2m works and can delete', function(assert) {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne]});
    store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.idOne});
    store.push('phone-number-type', {id: PNTD.idOne, name: PNTD.officeName, phonenumbers: [PND.idOne]});
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
  });
  this.model = location;
  this.phonenumber=location.get('phonenumbers').objectAt(0);
  this.index = 0;
  this.render(hbs`{{input-single-phone model=model phonenumber=phonenumber index=index}}`);
  assert.equal(this.$('.t-phone-number-type-select').text().trim(), trans.t(PNTD.officeName));
  assert.equal(this.$('.t-phonenumber-number0').val(), PND.numberOne);
  assert.equal(location.get('phonenumbers').get('length'), 1);
  generalPage.clickDeletePhoneNumber();
  assert.equal(location.get('phonenumbers').get('length'), 0);
  // dont get two way db
  // assert.equal(this.$('.t-phone-number-type-select').text().trim(), trans.t(PNTD.officeName));
  // assert.equal(this.$('.t-phonenumber-number0').val(), '');
});
