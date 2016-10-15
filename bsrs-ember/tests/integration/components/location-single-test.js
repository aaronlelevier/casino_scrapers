import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import LLF from "bsrs-ember/vendor/location-level_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import page from 'bsrs-ember/tests/pages/location';
import general from 'bsrs-ember/tests/pages/general';

var store, trans;

moduleForComponent('locations/location-single', 'integration: locations/location-single test', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    general.setContext(this);
    store = module_registry(this.container, this.registry, ['model:location', 'model:phonenumber', 'model:phone-number-type', 'model:address-type', 'model:address', 'model:email', 'model:email-type']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    var service = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(service, json);
    let pn_types = [{ 'id': '2bff27c7-ca0c-463a-8e3b-6787dffbe7de', 'name': 'admin.phonenumbertype.office' },
      { 'id': '9416c657-6f96-434d-aaa6-0c867aff3270', 'name': 'admin.phonenumbertype.mobile' }];
      run(() => {
        pn_types.forEach(function(pnt) {
          store.push('phone-number-type', pnt);
        });
      });
      let ad_types = [{ "id": "8e16a68c-fda6-4c30-ba7d-fee98257e92d", "name": "admin.address_type.office" },
        { "id": "f7e55e71-1ff2-4cc2-8700-139802738bd0", "name": "admin.address_type.shipping" }];
        run(() => {
          ad_types.forEach(function(ad) {
            store.push('address-type', ad);
          });
        });
        let em_types = [{ 'id': ETD.personalId, 'name': ETD.personalEmail },
          { 'id': ETD.workId, 'name': ETD.workEmail }];
          run(() => {
            em_types.forEach(function(emt) {
              store.push('email-type', emt);
            });
          });
  },
  afterEach() {
    page.removeContext(this);
    general.removeContext(this);
  }
});

test('clicking save will reveal all validation msgs', function(assert) {
  // no addresses/phone/email
  run(() => {
    this.model = store.push('location', {id: LD.idOne, name: LD.storeName});
  });
  this.render(hbs`{{locations/location-single model=model}}`);
  this.$('.t-location-name').val('').trigger('change');
  assert.equal(this.$('.validated-input-error-dialog').length, 0);
  assert.equal(this.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  assert.equal(this.$('.validated-input-error-dialog:eq(1)').text().trim(), '');
  assert.equal(this.$('.validated-input-error-dialog:eq(2)').text().trim(), '');
  assert.equal(this.$('.validated-input-error-dialog:eq(3)').text().trim(), '');
  assert.notOk(page.nameValidationErrorVisible);
  assert.notOk(page.numberValidationErrorVisible);
  assert.notOk(page.llevelValidationErrorVisible);
  assert.notOk(page.statusValidationErrorVisible);
  const save_btn = this.$('.t-save-btn');
  save_btn.trigger('click').trigger('change');
  assert.equal(Ember.$('.validated-input-error-dialog').length, 4);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.location.name'));
  assert.equal(Ember.$('.validated-input-error-dialog:eq(1)').text().trim(), trans.t('errors.location.number'));
  assert.equal(Ember.$('.validated-input-error-dialog:eq(2)').text().trim(), trans.t('errors.location.location_level'));
  assert.equal(Ember.$('.validated-input-error-dialog:eq(3)').text().trim(), trans.t('errors.location.status'));
  assert.ok(page.nameValidationErrorVisible);
  assert.ok(page.numberValidationErrorVisible);
  assert.ok(page.llevelValidationErrorVisible);
  assert.ok(page.statusValidationErrorVisible);
});

test('filling in location level on location new template will set diabled to false for children and parents', function(assert) {
  run(() => {
    this.model = store.push('location', {id: UUID.value, new: true});
    store.push('location-level', LLF.generate(LLD.idOne));
    store.push('location-level', LLF.generate(LLD.idTwo, LLD.nameDistrict));
  });
  this.render(hbs`{{locations/location-single model=model}}`);
  assert.equal(this.$('.t-location-children-select .ember-basic-dropdown-trigger input').attr('disabled'), 'disabled');
  assert.equal(this.$('.t-location-parent-select .ember-basic-dropdown-trigger input').attr('disabled'), 'disabled');
  clickTrigger('.t-location-level-select');
  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameDistrict})`);
  assert.equal(this.$('.t-location-children-select-trigger > input').attr('disabled'), undefined);
  assert.equal(this.$('.t-location-parent-select-trigger > input').attr('disabled'), undefined);
});

test('if save isRunning, btn is disabled', function(assert) {
  run(() => {
    this.model = store.push('location', {id: LD.idOne});
  });
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.render(hbs`{{locations/location-single model=model saveTask=saveIsRunning}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

// test('filling in invalid phone number reveal validation messages', function(assert) {
//   var done = assert.async();
//   run(() => {
//     this.model = store.push('location', {});
//   });
//   this.render(hbs`{{locations/location-single model=model}}`);
//   general.clickAddPhoneNumber();
//   let $err = this.$('.invalid');
//   assert.equal($err.text().trim(), '');
//   this.$('.t-phonenumber-number0').val('').keyup();
//   Ember.run.later(() => {
//     let $err = this.$('.invalid');
//     assert.ok($err.is(':visible'));
//     assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.phonenumber.number'));
//     this.$('.t-phonenumber-number0').val('444-455-4332').keyup();
//     Ember.run.later(() => {
//       // valid input
//       $err = this.$('.invalid');
//       assert.notOk($err.is(':visible'));
//       assert.equal($(ERR_TEXT).text().trim(), trans.t(''));
//       done();
//     }, 300);
//   }, 1900);
// });

// test('filling in invalid emails reveal validation messages', function(assert) {
//   var done = assert.async();
//   run(() => {
//       this.model = store.push('location', {});
//   });
//   this.render(hbs`{{locations/location-single model=model}}`);
//   general.clickAddEmail();
//   let $err = this.$('.invalid');
//   assert.equal($err.text().trim(), '');
//   this.$('.t-email-email0').val('').keyup();
//   Ember.run.later(() => {
//     let $err = this.$('.invalid');
//     assert.ok($err.is(':visible'));
//     assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.email.email'));
//     this.$('.t-email-email0').val('abbay@gmail.com').keyup();
//     Ember.run.later(() => {
//       // valid input
//       $err = this.$('.invalid');
//       assert.notOk($err.is(':visible'));
//       assert.equal($(ERR_TEXT).text().trim(), trans.t(''));
//       done();
//     }, 300);
//   }, 1900);
// });

// test('can remove a new phone number', function(assert) {
//   run(() => {
//     this.model = store.push('location', {});
//   });
//   this.render(hbs`{{locations/location-single model=model}}`);
//   general.clickAddPhoneNumber();
//   assert.equal(this.$('.t-phonenumber-number0').length, 1);
//   general.clickDeletePhoneNumber();
//   assert.equal(this.$('.t-phonenumber-number0').length, 0);
// });

// test('can add and remove new email', function(assert) {
//   run(() => {
//     this.model = store.push('location', {});
//   });
//   this.render(hbs`{{locations/location-single model=model}}`);
//   general.clickAddEmail();
//   assert.equal(this.$('.t-email-email0').length, 1);
//   general.clickDeleteEmail();
//   assert.equal(this.$('.t-email-email0').length, 0);
// });

// test('can add and remove new address', function(assert) {
//   run(() => {
//     this.model = store.push('location', {});
//   });
//   this.render(hbs`{{locations/location-single model=model}}`);
//   general.clickAddAddress();
//   assert.equal(this.$('.t-address-address0').length, 1);
//   general.clickDeleteAddress();
//   assert.equal(this.$('.t-address-address0').length, 0);
// });
