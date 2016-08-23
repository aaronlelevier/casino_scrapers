import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import page from 'bsrs-ember/tests/pages/assignment';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, model, trans;

moduleForComponent('assignment-single', 'integration: assignment-single test', {
  integration: true,
  setup() {
    page.setContext(this);
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:assignment']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      model = store.push('assignment', {
        id: AD.idOne,
        description: AD.descriptionOne,
      });
    });
    this.set('model', model);
    /* Desktop */
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'huge').begin + 5;
    flexi.set('width', width);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('if save isRunning, btn is disabled', function(assert) {
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.render(hbs`{{assignments/assignment-single model=model saveTask=saveIsRunning}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('description is required validation, cannot save w/o description', function(assert) {
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'description';
  run(function() {
    model = store.push('assignment', {
      id: AD.idTwo,
    });
  });
  this.set('model', model);
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  let $err = this.$('.invalid');
  assert.notOk($err.is(':visible'));
  generalPage.save();
  $err = this.$('.invalid');
  assert.ok($err.is(':visible'));
});

test('header - shows detail if not model.new and not description', function(assert) {
  model.set('description', undefined);
  this.model = model;
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  assert.equal(page.headerText, trans.t('assignment.detail'));
});

test('header - shows detail if description if description exists and not model.new', function(assert) {
  this.model = model;
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  assert.equal(page.headerText, model.get('description'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.model = model;
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  assert.equal(page.headerText, trans.t('assignment.new'));
});

test('labels are translated', function(assert) {
  this.model = model;
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  assert.equal(getLabelText('description'), trans.t('assignment.description'));
  assert.equal(getLabelText('assignee'), trans.t('assignment.assignee'));
});
