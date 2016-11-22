import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/automation';
import page from 'bsrs-ember/tests/pages/automation';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, model, trans;

moduleForComponent('automation-single', 'integration: automation-single test', {
  integration: true,
  setup() {
    page.setContext(this);
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:automation']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      model = store.push('automation', {
        id: AD.idOne,
        description: AD.descriptionOne,
      });
    });
    this.set('model', model);
    /* Desktop */
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'desktop').begin + 5;
    flexi.set('width', width);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('shows correct title if model has new property, description, or no description', function(assert) {
  run(() => {
    store.push('automation', {id: AD.idOne, new: true});
  });
  model.set('new', true);
  this.model = model;
  this.render(hbs`{{automations/automation-single model=model}}`);
  assert.equal(this.$('.t-automation-header').text().trim(), trans.t('admin.automation.new'));
  run(() => {
    store.push('automation', {id: AD.idOne, new: false});
  });
  assert.equal(this.$('.t-automation-header').text().trim(), AD.descriptionOne);
  run(() => {
    store.push('automation', {id: AD.idOne, description: undefined});
  });
  assert.equal(this.$('.t-automation-header').text().trim(), trans.t('admin.automation.detail'));
});

test('if save isRunning, btn is disabled', function(assert) {
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.render(hbs`{{automations/automation-single model=model saveTask=saveIsRunning}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('header - shows detail if not model.new and not description', function(assert) {
  model.set('description', undefined);
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  assert.equal(page.headerText, trans.t('admin.automation.detail'));
});

test('header - shows detail if description if description exists and not model.new', function(assert) {
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  assert.equal(page.headerText, model.get('description'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  assert.equal(page.headerText, trans.t('admin.automation.new'));
});

test('labels are translated', function(assert) {
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  assert.equal(getLabelText('description'), trans.t('admin.automation.description'));
});
