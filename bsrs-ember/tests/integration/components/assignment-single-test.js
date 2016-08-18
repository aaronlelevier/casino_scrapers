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
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
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
  // TODO: bug b/c already saved??
  // this.$('.t-assignment-description').val('a'.repeat(15)).keyup();
  // var done = assert.async();
  // Ember.run.later(() => {
  //   $err = this.$('.invalid');
  //   assert.notOk($err.is(':visible'));
  // }, 300);
});

test('header - shows detail if not model.new', function(assert) {
  this.model = model;
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  assert.equal(this.$('.t-assignment-header').text().trim(), trans.t('assignment.detail'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.model = model;
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  assert.equal(this.$('.t-assignment-header').text().trim(), trans.t('assignment.new'));
});

test('labels are translated', function(assert) {
  this.model = model;
  this.render(hbs `{{assignments/assignment-single model=model}}`);
  assert.equal(getLabelText('description'), trans.t('assignment.description'));
  assert.equal(getLabelText('assignee'), trans.t('assignment.assignee'));
});
