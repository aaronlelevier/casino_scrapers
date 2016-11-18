import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import SMSD from 'bsrs-ember/vendor/defaults/sendsms';
import SMSJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';
import PD from 'bsrs-ember/vendor/defaults/person';
import page from 'bsrs-ember/tests/pages/automation';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import { clickTrigger, triggerKeydown, nativeMouseUp, nativeMouseDown, typeInSearch } from 'bsrs-ember/tests/helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';

var store, trans, action, automation_repo;

moduleForComponent('automations/sendsms-action', 'Integration | Component | automations/sendsms action', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:automation']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, body: SMSD.bodyOne, generic_recipient_fks: [SMSJRD.idOne], actions: [AAD.idOne]});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
    store.push('generic-join-recipients', {id: SMSJRD.idOne, generic_pk: SMSD.idOne, recipient_pk: PD.idOne});
    automation_repo = repository.initialize(this.container, this.registry, 'person');
    automation_repo.getSmsRecipients = function() { 
      return [{id: PD.idTwo, fullname: PD.fullname, type: 'person'}]; };
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('it renders', function(assert) {
  this.model = action;
  this.index = 0;
  this.render(hbs`{{automations/sendsms-action model=model index=index}}`);
  assert.equal(this.$('.t-sendsms-recipient-label').text().trim(), trans.t('automation.actions.recipients'));
  assert.equal(this.$('.t-sendsms-message-label').text().trim(), trans.t('automation.actions.message'));
  assert.equal(this.$('.t-action-body0').val(), action.get('sendsms').get('body'));
  assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), action.get('sendsms').get('recipient').objectAt(0).get('fullname'));
});

test('shows validation messages', function(assert) {
  this.model = action;
  this.index = 0;
  this.automationRepo = automation_repo;
  this.render(hbs`{{automations/sendsms-action model=model index=index automationRepo=automationRepo}}`);
  let $component2 = this.$('.t-action-body-validator0');
  let $component3 = this.$('.t-action-recipient-validator0');
  assert.equal($component2.hasClass('invalid'), false);
  assert.equal($component3.hasClass('invalid'), false);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  assert.equal(Ember.$('.validated-input-error-dialog:eq(1)').text().trim(), '');
  this.$('.t-action-body0').val('').trigger('keyup');
  nativeMouseDown('.ember-power-select-multiple-remove-btn');
  return waitFor().
    then(() => {
      assert.equal($component2.hasClass('invalid'), true);
      assert.equal($component3.hasClass('invalid'), true);
      assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.sendsms.recipient'));
      assert.equal(Ember.$('.validated-input-error-dialog:eq(1)').text().trim(), trans.t('errors.sendsms.body'));
      this.$('.t-action-body0').val('this is the body').trigger('keyup');
      run(() => { typeInSearch('a'); });
      return waitFor().
        then(() => {
          assert.equal($component2.hasClass('invalid'), false);
          assert.equal(action.get('sendsms').get('recipient').get('length'), 0);
          nativeMouseUp(`.ember-power-select-option:contains(${PD.fullname})`);
          assert.equal(action.get('sendsms').get('recipient').get('length'), 1);
          assert.equal(action.get('sendsms').get('recipient').objectAt(0).get('type'), 'person');
          assert.equal(this.$('.invalid').length, 0);
          assert.equal($component3.hasClass('invalid'), false);
        });
    });
});
