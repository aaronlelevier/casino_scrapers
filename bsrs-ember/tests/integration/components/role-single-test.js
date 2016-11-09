import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/currency';

var store, trans;
const ERR_TEXT = '.validated-input-error-dialog';

moduleForComponent('role-single', 'integration: role-single test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:role', 'model:currency']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      store.push('currency', {
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
    });
  }
});

test('translation keys', function(assert) {
  run(() => {
    this.set('model', store.push('role', {}));
  });
  this.render(hbs `{{roles/role-single model=model}}`);
  assert.equal(getLabelText('name'), trans.t('admin.role.label.name'));
  assert.equal(getLabelText('role_type'), trans.t('admin.role.label.role_type'));
  assert.equal(getLabelText('role_location_level_select'), trans.t('admin.location.label.location_level'));
  assert.equal(getLabelText('category'), trans.t('admin.role.label.category'));
  assert.equal(getLabelText('auth_amount'), trans.t('admin.person.label.auth_amount'));
  assert.equal(getLabelText('dashboard_text'), trans.t('admin.setting.dashboard_text'));
});

test('auth amount required', function(assert) {
  var done = assert.async();
  run(() => {
    this.set('model', store.push('role', {}));
  });
  this.render(hbs `{{roles/role-single model=model}}`);
  assert.notOk(Ember.$('.invalid').is(':visible'));
  this.$('.t-amount').val('8').trigger('keyup');
  assert.notOk(Ember.$('.invalid').is(':visible'));
  this.$('.t-amount').val('').trigger('keyup');
  Ember.run.later(() => {
    assert.ok(Ember.$('.invalid').is(':visible'));
    assert.equal(Ember.$(ERR_TEXT).text().trim(), trans.t('errors.role.auth_amount'));
    done();
  }, 300);
});

test('if save isRunning, btn is disabled', function(assert) {
  run(() => {
    this.set('model', store.push('role', {}));
  });
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.render(hbs`{{roles/role-single model=model saveTask=saveIsRunning}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});
