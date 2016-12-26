import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/currency';
import wait from 'ember-test-helpers/wait';

var trans;
const ERR_TEXT = '.validated-input-error-dialog';

moduleForComponent('role-single', 'integration: role-single test', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:role', 'model:currency']);
    trans = this.container.lookup('service:i18n');
    run(() => {
      this.store.push('currency', {
        id: CD.id,
        symbol: CD.symbol,
        name: CD.name,
        decimal_digits: CD.decimal_digits,
        code: CD.code,
        name_plural: CD.name_plural,
        rounding: CD.rounding,
        symbol_native: CD.symbol_native,
        default: true,
      });
      this.model = this.store.push('role', {});
    });
  },
  afterEach() {
    delete this.store;
  }
});

test('translation keys', function(assert) {
  this.render(hbs `{{roles/role-single model=model}}`);
  assert.equal(getLabelText('name'), trans.t('admin.role.label.name'));
  assert.equal(getLabelText('role_type'), trans.t('admin.role.label.role_type'));
  assert.equal(getLabelText('role_location_level_select'), trans.t('admin.role.label.location_level'));
  assert.equal(getLabelText('category'), trans.t('admin.role.label.category'));
  assert.equal(getLabelText('auth_amount'), trans.t('admin.person.label.auth_amount'));
  assert.equal(getLabelText('dashboard_text'), trans.t('admin.setting.dashboard_text'));
});

test('auth amount required', function(assert) {
  var done = assert.async();
  this.render(hbs `{{roles/role-single model=model}}`);
  assert.notOk(Ember.$('.invalid').is(':visible'));
  this.$('.t-amount').val('8').trigger('keyup');
  assert.notOk(Ember.$('.invalid').is(':visible'));
  this.$('.t-amount').val('').trigger('keyup');
  return wait().
    then(() => {
    assert.ok(Ember.$('.invalid').is(':visible'));
    assert.equal(Ember.$(ERR_TEXT).text().trim(), trans.t('errors.role.auth_amount'));
    done();
  });
});

test('if save isRunning, btn is disabled', function(assert) {
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.permissions = ['change_role'];
  this.render(hbs`{{roles/role-single 
    model=model 
    saveTask=saveIsRunning
    permissions=permissions
  }}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});
