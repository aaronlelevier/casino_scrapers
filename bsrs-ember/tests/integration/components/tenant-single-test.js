import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, model, trans;

moduleForComponent('tenant-single', 'integration: tenant-single test', {
  integration: true,
  setup() {
    page.setContext(this);
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:tenant']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      model = store.push('tenant', {
        id: TD.idOne,
        company_name: TD.companyNameOne,
      });
    });
    this.set('model', model);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('company_name is required validation, cannot save w/o company_name', function(assert) {
  run(function() {
    model = store.push('tenant', {
      id: TD.idTwo,
    });
  });
  this.set('model', model);
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  let $err = this.$('.invalid');
  assert.notOk($err.is(':visible'));
  generalPage.save();
  $err = this.$('.invalid');
  assert.ok($err.is(':visible'));
});

test('header - shows detail if not model.new', function(assert) {
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal(this.$('.t-tenant-header').text().trim(), trans.t('tenant.detail'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.set('model', model);
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal(this.$('.t-tenant-header').text().trim(), trans.t('tenant.new'));
});

test('labels are translated', function(assert) {
  this.render(hbs `{{tenants/tenant-single}}`);
  assert.equal(getLabelText('company_name'), trans.t('tenant.company_name'));
  assert.equal(getLabelText('currency'), trans.t('tenant.currency'));
});

test('placeholders are translated', function(assert) {
  this.render(hbs `{{tenants/tenant-single}}`);
  assert.equal(this.$('.t-tenant-company_name').get(0)['placeholder'], trans.t('tenant.company_name'));
});
