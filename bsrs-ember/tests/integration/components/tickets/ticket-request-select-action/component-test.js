import Ember from 'ember';
const { set, run } = Ember;
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import page from 'bsrs-ember/tests/pages/automation';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';

var store, trans, action;

moduleForComponent('tickets/ticket-request-select-action', 'Integration | Component | tickets/ticket request select action', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    trans = this.container.lookup('service:i18n');  
    store = module_registry(this.container, this.registry, ['model:automation']);
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idSix});
    store.push('automation-action-type', {id: ATD.idSix, key: ATD.keySix, actions: [AAD.idOne]});
  }
});

test('it renders with model bound values', function(assert) {
  this.model = action;
  this.render(hbs`{{tickets/ticket-request-select-action model=model}}`);
  assert.equal(this.$('[data-test-id=automation-request]').text().trim(), trans.t('automation.actions.request'));
  assert.equal(this.$('.t-automation-ticket-request').prop('type'), 'textarea');
  assert.equal(this.$('.t-automation-ticket-request').val(), '');
  page.ticketRequestFillIn(AAD.requestOne);
  assert.equal(this.$('.t-automation-ticket-request').val(), AAD.requestOne);
  assert.equal(page.ticketRequestValue, AAD.requestOne);
  assert.equal(action.get('request'), AAD.requestOne);
  assert.equal(action.get('isDirty'), true);
});

test('it renders with validation', function(assert) {
  this.model = action;
  this.render(hbs`{{tickets/ticket-request-select-action model=model}}`);
  let $component = this.$('.t-automation-ticket-request-validator');
  assert.equal($component.hasClass('invalid'), false);
  this.$('.t-automation-ticket-request').val('').trigger('keyup');
  return wait().then(() => {
    assert.equal($component.hasClass('invalid'), true);
    assert.equal(Ember.$('.t-validation-request').text().trim(), trans.t('errors.automation.request'));
    this.$('.t-automation-ticket-request').val(AAD.requestOne).trigger('keyup');
    return wait().then(() => {
      assert.equal($component.hasClass('invalid'), false);
    });
  });
});
