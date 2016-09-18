import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import page from 'bsrs-ember/tests/pages/settings';
import generalPage from 'bsrs-ember/tests/pages/general';
import repository from 'bsrs-ember/tests/helpers/repository';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';

let store, model, tenant_repo, trans;

moduleForComponent('settings/general-settings', 'integration: settings/general-settings (tenant) test', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    generalPage.setContext(this);
    trans = this.container.lookup('service:i18n');
    store = module_registry(this.container, this.registry, ['model:tenant']);
    run(function() {
      model = store.push('tenant', {
        id: TD.id,
      });
    });
    tenant_repo = repository.initialize(this.container, this.registry, 'tenant');
    tenant_repo.update = () => { return new Ember.RSVP.Promise(() => {}); };
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('translations - for labels', function(assert) {
  this.set('model', model);
  this.render(hbs `{{settings/general-settings model=model }}`);
  assert.equal(getLabelText('company_name'), trans.t('admin.setting.company_name'));
  assert.equal(getLabelText('company_code'), trans.t('admin.setting.company_code'));
  assert.equal(getLabelText('dashboard_text'), trans.t('admin.setting.dashboard_text'));
  assert.equal(page.testmodelLableText, trans.t('admin.setting.test_mode'));
  assert.equal(getLabelText('dt_start_id'), trans.t('admin.setting.dt_start_key'));
  assert.equal(getLabelText('default_currency'), trans.t('admin.category.label.cost_currency'));
});

test('company name is required validation, cannot save w/o name', function(assert) {
  this.set('model', model);
  this.render(hbs `{{settings/general-settings model=model }}`);
  let $err = this.$('.t-settings-company-name-validator.invalid');
  assert.notOk($err.is(':visible'));
  assert.equal($('.validated-input-error-dialog').length, 0);
  assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), '');
  generalPage.save();
  $err = this.$('.t-settings-company-name-validator.invalid');
  assert.ok($err.is(':visible'));
});

test('company code is required validation, cannot save w/o code', function(assert) {
  this.set('model', model);
  this.render(hbs `{{settings/general-settings model=model }}`);
  let $err = this.$('.t-settings-company-code-validator.invalid');
  assert.notOk($err.is(':visible'));
  assert.equal($('.validated-input-error-dialog').length, 0);
  assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), '');
  generalPage.save();
  $err = this.$('.t-settings-company-code-validator.invalid');
  assert.ok($err.is(':visible'));
});

test('dashboard text is required validation, cannot save w/o code', function(assert) {
  this.set('model', model);
  this.render(hbs `{{settings/general-settings model=model }}`);
  let $err = this.$('.t-settings-dashboard-text-validator.invalid');
  assert.notOk($err.is(':visible'));
  assert.equal($('.validated-input-error-dialog').length, 0);
  assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), '');
  generalPage.save();
  $err = this.$('.t-settings-dashboard-text-validator.invalid');
  assert.ok($err.is(':visible'));
});
