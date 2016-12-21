import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import RD from 'bsrs-ember/vendor/defaults/role';
import SD from 'bsrs-ember/vendor/defaults/status';
import CD from 'bsrs-ember/vendor/defaults/currency';
import page from 'bsrs-ember/tests/pages/person';
import general from 'bsrs-ember/tests/pages/general';
import { clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';

let store, role, trans;
const PD = PERSON_DEFAULTS.defaults();

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
    let em_types = [{ 'id': ETD.personalId, 'name': ETD.personalEmail }, { 'id': ETD.workId, 'name': ETD.workEmail }];
    run(() => {
      em_types.forEach(function(emt) {
        store.push('email-type', emt);
      });
    });
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
  let done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.idOne, username: 'foo'}));
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
  this.permissions = ['change_person'];
  this.render(hbs`{{people/person-single 
    model=model 
    saveTask=saveIsRunning
    permissions=permissions
  }}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('header populates with username and role name', function(assert) {
  let model;
  run(() => {
    model = store.push('person', {id: PD.idOne, username: PD.username, role_fk: RD.idOne});
    store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.idOne]});
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

test('click on status dropdown and select status', function(assert) {
  let model;
  run(() => {
    model = store.push('person', {id: PD.idOne, status_fk: SD.activeId});
    store.push('status', {id: SD.activeId, name: SD.activeNameTranslated, people: [PD.idOne]});
    store.push('status', {id: SD.inactiveId, name: SD.inactiveNameTranslated});
    store.push('status', {id: SD.expiredId, name: SD.expiredNameTranslated});
  });
  this.set('model', model);
  this.render(hbs`{{people/person-single model=model}}`);
  assert.equal(Ember.$('[data-test-id="status-tag"]').length, 1);
  clickTrigger('.t-status-select');
  assert.equal(Ember.$('.ember-power-select-option > [data-test-id="status-tag"]').length, 3); 
  nativeMouseUp(`.ember-power-select-option:contains(${SD.inactiveNameTranslated})`);
  assert.equal(Ember.$('[data-test-id="status-tag"]').text().trim(), SD.inactiveNameTranslated);
  assert.equal(Ember.$('[data-test-id="status-tag"]').length, 1);
});
