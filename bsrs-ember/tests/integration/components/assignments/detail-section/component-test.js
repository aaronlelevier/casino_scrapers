import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/assignment';

var store, trans;

moduleForComponent('assignments/detail-section', 'Integration | Component | assignments/detail section', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:assignment']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne});
  }
});

test('it renders with placeholder', function(assert) {
  this.render(hbs`{{assignments/detail-section}}`);
  assert.equal(this.$('.t-assignment-description').attr('placeholder'), trans.t('admin.assignment.description'));
  // TODO: working on this in master
  // assert.equal(this.$('.t-assignment-assignee-select').attr('placeholder'), trans.t('admin.assignment.description'));
});

test('validation on assignment description works', function(assert) {
  const DESCRIPTION = '.t-assignment-description';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'description';
  var done = assert.async();
  this.model = assignment;
  this.render(hbs`{{assignments/detail-section model=model}}`);
  const $component = this.$('.invalid');
  assert.notOk($component.is(':visible'));
  this.$(DESCRIPTION).val('').keyup();
  Ember.run.later(() => {
    const $component = this.$('.invalid');
    assert.ok($component.is(':visible'), 'no entry. Too low');
    assert.equal($('.validated-input-error-dialog').text().trim(), trans.t('errors.assignment.description'));
    this.$(DESCRIPTION).val('a'.repeat(4)).keyup();
    Ember.run.later(() => {
      const $component = this.$('.invalid');
      assert.ok($component.is(':visible'), 'only 4 characters. Too low');
      assert.equal($('.validated-input-error-dialog').text().trim(), trans.t('errors.assignment.description.min_max'));
      this.$(DESCRIPTION).val('a'.repeat(5)).keyup();
      Ember.run.later(() => {
        const $component = this.$('.invalid');
        assert.notOk($component.is(':visible'), 'meets min length');
        done();
      }, 300);
    }, 300);
  }, 1900);
});
