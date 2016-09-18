import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/person';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import RD from 'bsrs-ember/vendor/defaults/role';
import GLOBAL from 'bsrs-ember/vendor/defaults/global-message';
import CD from 'bsrs-ember/vendor/defaults/currencies';
import page from 'bsrs-ember/tests/pages/person';
import general from 'bsrs-ember/tests/pages/general';

var store, role, email_types, default_email_type, phone_number_types, default_phone_number_type, trans;
const ERR_TEXT = '.validated-input-error-dialog';

moduleForComponent('person-single', 'integration: person-single test', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    general.setContext(this);
    store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    const json = translations.generate('en');
    loadTranslations(trans, json);
    run(function() {
      store.push('person-current', {id: PD.idOne});
      store.push('currency', {id:CD.id, symbol:CD.symbol, name:CD.name, decimal_digits:CD.decimal_digits, code:CD.code, name_plural:CD.name_plural, rounding:CD.rounding, symbol_native:CD.symbol_native, default: true});
    });
    let pn_types = [{ 'id': '2bff27c7-ca0c-463a-8e3b-6787dffbe7de', 'name': 'admin.phonenumbertype.office' },
    { 'id': '9416c657-6f96-434d-aaa6-0c867aff3270', 'name': 'admin.phonenumbertype.mobile' }];
    run(function() {
      pn_types.forEach(function(pnt) {
        store.push('phone-number-type', pnt);
      });
    });
    phone_number_types = store.find('phone-number-type');
    default_phone_number_type = phone_number_types.objectAt(0);
    let em_types = [{ 'id': ETD.personalId, 'name': ETD.personalEmail }, { 'id': ETD.workId, 'name': ETD.workEmail }];
    run(() => {
      em_types.forEach(function(emt) {
        store.push('email-type', emt);
      });
    });
    email_types = store.find('email-type');
    default_email_type = email_types.objectAt(0);
    /* Desktop */
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'desktop').begin + 5;
    flexi.set('width', width);
  },
  afterEach() {
    page.removeContext(this);
    general.removeContext(this);
  }
});

test('dropdown displays correct print and duplicate text', function(assert) {
  run(() => {
    this.set('model', store.push('person', {id: PD.idOne}));
  });
  this.render(hbs`{{people/person-single model=model}}`);
  this.$('.t-dropdown-delete').click();
  assert.equal(this.$('.t-print-btn').text().split(' ')[1], trans.t('crud.print.button'));
  assert.equal(this.$('.t-duplicate-btn').text().split(' ')[1], trans.t('crud.duplicate.button'));
});

test('validation on person username works if clear out username', function(assert) {
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id, username: 'foo'}));
  });
  this.render(hbs`{{people/person-single model=model}}`);
  let $component = this.$('.invalid');
  assert.equal($component.text().trim(), '');
  page.usernameFillIn('wat');
  assert.equal(page.username, 'wat');
  assert.notOk($component.is(':visible'));
  page.usernameFillIn('');
  Ember.run.later(() => {
    const $component = this.$('.invalid');
    assert.ok($component.is(':visible'));
    assert.equal($component.text().trim(), trans.t('errors.person.username'));
    done();
  }, 300);
});

test('if save isRunning, btn is disabled', function(assert) {
  run(() => {
    this.model = store.push('person', {id: PD.idOne});
  });
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.render(hbs`{{people/person-single model=model saveTask=saveIsRunning}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('filling in invalid phone number reveal validation messages', function(assert) {
  var done = assert.async();
  run(() => {
    this.model = store.push('person', {});
  });
  this.phone_number_types = phone_number_types;
  this.default_phone_number_type = default_phone_number_type;
  this.render(hbs`{{people/person-single model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
  general.clickAddPhoneNumber();
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$('.t-phonenumber-number0').val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.ok($err.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.phonenumber.number'));
    this.$('.t-phonenumber-number0').val('444-455-4332').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), trans.t(''));
      done();
    }, 300);
  }, 1900);
});

test('filling in invalid emails reveal validation messages', function(assert) {
  var done = assert.async();
  run(() => {
      this.model = store.push('person', {});
  });
  this.email_types = email_types;
  this.default_email_type = default_email_type;
  this.render(hbs`{{people/person-single model=model email_types=email_types default_email_type=default_email_type}}`);
  general.clickAddEmail();
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$('.t-email-email0').val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.ok($err.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.email.email'));
    this.$('.t-email-email0').val('abbay@gmail.com').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), trans.t(''));
      done();
    }, 300);
  }, 1900);
});

test('clicking save will reveal all validation msgs', function(assert) {
  // no phone/email
  run(() => {
    this.model = store.push('person', {id: PD.idOne});
  });
  this.phone_number_types = phone_number_types;
  this.default_phone_number_type = default_phone_number_type;
  this.render(hbs`{{people/person-single model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
  assert.equal($('.validated-input-error-dialog').length, 0);
  assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), '');
  assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), '');
  assert.notOk(page.firstNameValidationErrorVisible);
  assert.notOk(page.lastNameValidationErrorVisible);
  const save_btn = this.$('.t-save-btn');
  save_btn.trigger('click').trigger('change');
  assert.equal($('.validated-input-error-dialog').length, 2);
  assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.person.first_name'));
  assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), trans.t('errors.person.last_name'));
  assert.ok(page.firstNameValidationErrorVisible);
  assert.ok(page.lastNameValidationErrorVisible);
});

test('can remove a new phone number', function(assert) {
  run(() => {
    this.model = store.push('person', {});
  });
  this.phone_number_types = phone_number_types;
  this.default_phone_number_type = default_phone_number_type;
  this.render(hbs`{{people/person-single model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
  general.clickAddPhoneNumber();
  assert.equal(this.$('.t-phonenumber-number0').length, 1);
  general.clickDeletePhoneNumber();
  assert.equal(this.$('.t-phonenumber-number0').length, 0);
});

test('can add and remove new email', function(assert) {
  run(() => {
    this.model = store.push('person', {});
  });
  this.email_types = email_types;
  this.default_email_type = default_email_type;
  this.render(hbs`{{people/person-single model=model email_types=email_types default_email_type=default_email_type}}`);
  general.clickAddEmail();
  assert.equal(this.$('.t-email-email0').length, 1);
  general.clickDeleteEmail();
  assert.equal(this.$('.t-email-email0').length, 0);
});

test('header populates with username and role name', function(assert) {
  let model;
  run(() => {
    model = store.push('person', {id: PD.id, username: PD.username, role_fk: RD.idOne});
    role = store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.id]});
  });
  this.set('model', model);
  this.render(hbs`{{people/person-single model=model}}`);
  assert.equal(this.$('.t-person-single-header').text().trim(), PD.username);
  assert.equal(this.$('.t-person-single-sub-header').text().trim(), RD.nameOne);
  page.firstNameFill(PD.first_name);
  page.lastNameFill(PD.last_name);
  assert.equal(this.$('.t-person-single-header').text().trim(), PD.first_name+'  '+PD.last_name);
  page.firstNameFill('');
  page.middleInitialFill(PD.middle_initial);
  page.lastNameFill(PD.last_name);
  assert.equal(this.$('.t-person-single-header').text().trim(), PD.middle_initial+' '+PD.last_name);
});
