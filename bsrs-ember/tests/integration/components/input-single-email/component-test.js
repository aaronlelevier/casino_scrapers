import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import ED from 'bsrs-ember/vendor/defaults/email';
import LD from 'bsrs-ember/vendor/defaults/location';
import LPHD from 'bsrs-ember/vendor/defaults/location-join-phonenumber';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, trans; 

moduleForComponent('input-single-email', 'Integration | Component | input single email', {
  integration: true,
  beforeEach() {
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:email', 'model:email-type', 'model:location', 'model:location-join-email']);
    trans = this.container.lookup('service:i18n');
  },
  afterEach() {
    generalPage.removeContext(this);
  }
});

test('if pass noDelete as true, no delete button', function(assert) {
  this.render(hbs`{{input-single-email}}`);
  assert.equal(this.$('.t-del-email-btn').length, 1);
  this.render(hbs`{{input-single-email noDelete=true}}`);
  assert.equal(this.$('.t-del-email-btn').length, 0);
});

test('setup for belongsTo works', function(assert) {
  let tenant, email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_email_fk: ED.idOne});
    store.push('email', {id: ED.idOne, number: ED.numberOne, tenants: [TD.idOne]});
    email = store.push('email', {id: ED.idOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, name: ETD.workName, emails: [ED.idOne]});
  });
  this.model = tenant;
  this.email=email;
  this.render(hbs`{{input-single-email model=model email=email}}`);
  assert.equal(this.$('.t-email-type-select').text().trim(), trans.t(ETD.workName));
  assert.equal(this.$('.t-email-number').val(), ED.numberOne);
});

test('setup for m2m works and can delete', function(assert) {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LPHD.idOne]});
    store.push('email', {id: ED.idOne, number: ED.numberOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, name: ETD.workName, emails: [ED.idOne]});
    store.push('location-join-email', {id: LPHD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
  });
  this.model = location;
  this.email=location.get('emails').objectAt(0);
  this.index = 0;
  this.render(hbs`{{input-single-email model=model email=email index=index}}`);
  assert.equal(this.$('.t-email-type-select').text().trim(), trans.t(ETD.workName));
  assert.equal(this.$('.t-email-number0').val(), ED.numberOne);
  assert.equal(location.get('emails').get('length'), 1);
  generalPage.clickDeleteEmail();
  assert.equal(location.get('emails').get('length'), 0);
  // dont get two way db
  // assert.equal(this.$('.t-email-type-select').text().trim(), trans.t(ETD.workName));
  // assert.equal(this.$('.t-email-number0').val(), '');
});
