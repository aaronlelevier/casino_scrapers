import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/automation';

var store, trans, automation;

moduleForComponent('automations/detail-section', 'Integration | Component | automations/detail section', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    automation = store.push('automation', {id: AD.idOne, description: AD.descriptionOne});
  }
});

test('it renders with placeholder', function(assert) {
  this.render(hbs`{{automations/detail-section}}`);
  assert.equal(this.$('.t-automation-description').attr('placeholder'), trans.t('admin.automation.description'));
  // TODO: working on this in master
  // assert.equal(this.$('.t-automation-assignee-select').attr('placeholder'), trans.t('admin.automation.description'));
});

test('validation on automation description works', function(assert) {
  const DESCRIPTION = '.t-automation-description';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'description';
  var done = assert.async();
  this.model = automation;
  this.render(hbs`{{automations/detail-section model=model}}`);
  const $component = this.$('.invalid');
  assert.notOk($component.is(':visible'));
  this.$(DESCRIPTION).val('').keyup();
  Ember.run.later(() => {
    const $component = this.$('.invalid');
    assert.ok($component.is(':visible'), 'no entry. Too low');
    assert.equal(Ember.$('.validated-input-error-dialog').text().trim(), trans.t('errors.automation.description'));
    this.$(DESCRIPTION).val('a'.repeat(4)).keyup();
    Ember.run.later(() => {
      const $component = this.$('.invalid');
      assert.ok($component.is(':visible'), 'only 4 characters. Too low');
      assert.equal(Ember.$('.validated-input-error-dialog').text().trim(), trans.t('errors.automation.description.min_max'));
      this.$(DESCRIPTION).val('a'.repeat(5)).keyup();
      Ember.run.later(() => {
        const $component = this.$('.invalid');
        assert.notOk($component.is(':visible'), 'meets min length');
        done();
      }, 300);
    }, 300);
  }, 1900);
});
