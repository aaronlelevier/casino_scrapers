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
  this.render(hbs `{{settings/general-settings
      model=model
    }}`);
  assert.equal(getLabelText('company_name'), trans.t('admin.setting.company_name'));
  assert.equal(getLabelText('company_code'), trans.t('admin.setting.company_code'));
  assert.equal(getLabelText('dashboard_text'), trans.t('admin.setting.dashboard_text'));
  assert.equal(page.testmodelLableText, trans.t('admin.setting.test_mode'));
  assert.equal(getLabelText('dt_start_id'), trans.t('admin.setting.dt_start_key'));
  assert.equal(getLabelText('default_currency'), trans.t('admin.category.label.cost_currency'));
});

test('validation errors for required fields', function(assert) {
  this.set('model', model);
  this.render(hbs `{{settings/general-settings
      model=model
    }}`);
  generalPage.save();
  const $company_name_error = this.$('.t-company_name-text-validation-error');
  assert.equal($company_name_error.text().trim(), trans.t('validation.invalid')+ ' '+trans.t('admin.setting.company_name'));
  const $company_code_error = this.$('.t-company_code-text-validation-error');
  assert.equal($company_code_error.text().trim(), trans.t('validation.invalid')+ ' '+trans.t('admin.setting.company_code'));
  const $dashboard_text_error = this.$('.t-welcome-text-validation-error');
  assert.equal($dashboard_text_error.text().trim(), trans.t('validation.invalid')+ ' '+trans.t('admin.setting.dashboard_text'));
  page.companyNameFill('x');
  page.companyCodeFill('y');
  page.dashboardTextFill('z');
  generalPage.save();
});
