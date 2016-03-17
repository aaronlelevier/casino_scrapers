import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import page from 'bsrs-ember/tests/pages/dtd';

var store, trans;

moduleForComponent('dtds/dtd-header', 'Integration | Component | dtds/dtd header', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-header', 'service:i18n']);
    run(() => {
      store.push('dtd-header', {id: 1});
    });
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('amk it renders with buttons', function(assert) {
  this.render(hbs`{{#dtds/dtd-header}}{{/dtds/dtd-header}}`);
  assert.equal(this.$('button:eq(0)').text().trim(), trans.t('admin.dtd.list'));
  assert.equal(this.$('button:eq(1)').text().trim(), trans.t('admin.dtd.detail'));
  assert.equal(this.$('button:eq(2)').text().trim(), trans.t('admin.dtd.preview'));
});
test('amk buttons have active class when rendered', function(assert) {
  Ember.run(() => {
    store.push('dtd-header', {id: 1, showingList: true, showingDetail: true, showingPreview: true});
  });
  this.render(hbs`{{#dtds/dtd-header}}{{/dtds/dtd-header}}`);

  assert.ok(page.listButtonOn);
  page.clickListToggle();
  assert.ok(page.listButtonOff);

  assert.ok(page.detailButtonOn);
  page.clickDetailToggle();
  assert.ok(page.detailButtonOff);

  page.clickListToggle();

  assert.ok(page.previewButtonOn);
  page.clickPreviewToggle();
  assert.ok(page.previewButtonOff);
});
