import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import wait from 'ember-test-helpers/wait';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/currency';
import LCD from 'bsrs-ember/vendor/defaults/locale';
import { clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';

const PD = PERSON_DEFAULTS.defaults();
var person, trans;

moduleForComponent('people/detail-section', 'Integration | Component | people/detail section', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:person', 'model:locale']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    const json = translations.generate('en');
    loadTranslations(trans, json);
    run(() => {
      this.store.push('currency', {id: CD.id, symbol: CD.symbol, name: CD.name, decimal_digits: CD.decimal_digits, code: CD.code, name_plural: CD.name_plural, rounding: CD.rounding, symbol_native: CD.symbol_native, default: true});
    });
  },
  afterEach() {
    delete this.store;
  }
});

test('it renders with labels', function(assert) {
  run(() => {
    this.model = this.store.push('person', {id: PD.idOne});
  });
  this.render(hbs`{{people/detail-section model=model }}`);
  assert.equal(this.$('[data-test-id="first-name"]').text().trim(), trans.t('admin.person.label.first_name'));
  assert.equal(this.$('[data-test-id="middle-initial"]').text().trim(), trans.t('admin.person.label.middle_initial'));
  assert.equal(this.$('[data-test-id="last-name"]').text().trim(), trans.t('admin.person.label.last_name'));
  assert.equal(this.$('[data-test-id="title"]').text().trim(), trans.t('admin.person.label.title'));
  assert.equal(this.$('[data-test-id="role-name"] > label').text().trim(), trans.t('admin.person.label.role-name'));
  assert.equal(this.$('[data-test-id="location"]').text().trim(), trans.t('admin.person.label.location'));
  assert.equal(this.$('[data-test-id="auth-amount"] > label').text().trim(), trans.t('admin.person.label.auth_amount'));
  assert.equal(this.$('[data-test-id="employee-id"]').text().trim(), trans.t('admin.person.label.employee_id'));
  assert.equal(this.$('[data-test-id="locale"] > label').text().trim(), trans.t('admin.person.label.language'));
});

test('locale is set to browser default', function(assert) {
  run(() => {
    this.model = this.store.push('person', {id: PD.idOne, locale_fk: LCD.idDefault});
    this.store.push('locale', {id: LCD.idOne, name: LCD.nameOne});
    this.store.push('locale', {id: LCD.idTwo, name: LCD.nameTwo});
    this.store.push('locale', {id: LCD.idThree, name: LCD.nameThree});
  }); 
  this.render(hbs `{{people/detail-section model=model}}`);
  assert.equal(this.$('.t-locale-select .ember-power-select-selected-item').text().trim(), "");
  clickTrigger('.t-locale-select');
  nativeMouseUp(`.ember-power-select-option:contains(${LCD.nameThree})`);
  return wait().then(() => {
    assert.equal(this.$('.t-locale-select .ember-power-select-selected-item').text().trim(), LCD.nameThree);
  });
});
