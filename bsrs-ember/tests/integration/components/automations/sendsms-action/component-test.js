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

var store, trans, action, person_repo;

moduleForComponent('automations/sendsms-action', 'Integration | Component | automations/sendsms action', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:automation']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, message: SMSD.messageOne, generic_recipient_fks: [SMSJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PD.idOne, fullname: PD.fullname});
    store.push('generic-join-recipients', {id: SMSJRD.idOne, generic_pk: SMSD.idOne, recipient_pk: PD.idOne});
    person_repo = repository.initialize(this.container, this.registry, 'person');
    person_repo.findPeople = function() { 
      return [{id: PD.idTwo, fullname: PD.fullname}]; };
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('it renders', function(assert) {
  this.model = action;
  this.index = 0;
  this.render(hbs`{{automations/sendsms-action model=model index=index}}`);
  assert.equal(this.$('.t-sendsms-recipient-label').text().trim(), trans.t('admin.action.sendsms.recipients'));
  assert.equal(this.$('.t-sendsms-message-label').text().trim(), trans.t('admin.action.sendsms.message'));
  assert.equal(this.$('.t-action-message0').val(), action.get('sendsms').get('message'));
  assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), action.get('sendsms').get('recipient').objectAt(0).get('fullname'));
});

test('shows validation messages', function(assert) {
  var done = assert.async();
  this.model = action;
  this.didValidate = false;
  this.index = 0;
  this.personRepo = person_repo;
  this.render(hbs`{{automations/sendsms-action model=model index=index didValidate=didValidate personRepo=personRepo}}`);
  assert.equal(this.$('.t-action-message0').prop('type'), 'textarea');
  assert.equal(this.$('.t-action-message0').val(), SMSD.messageOne);
  let $component = this.$('.t-action-message-validator0');
  let $component2 = this.$('.t-action-recipient-validator0');
  assert.equal($component.hasClass('invalid'), false);
  assert.equal($component2.hasClass('invalid'), false);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  assert.equal(Ember.$('.validated-input-error-dialog:eq(1)').text().trim(), '');
  page.sendSmsMessageFillIn('');
  nativeMouseDown('.ember-power-select-multiple-remove-btn');
  this.set('didValidate', true);
  assert.equal($component.hasClass('invalid'), true);
  assert.equal($component2.hasClass('invalid'), true);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.sendsms.recipient'));
  assert.equal(Ember.$('.validated-input-error-dialog:eq(1)').text().trim(), trans.t('errors.sendsms.message'));
  this.$('.t-action-message0').val('a'.repeat(160)).trigger('keyup');
  assert.equal($component.hasClass('invalid'), false);
  this.$('.t-action-message0').val('a'.repeat(261)).trigger('keyup');
  Ember.run.later(() => {
    // valid input
    $component = this.$('.t-action-message-validator0');
    assert.equal($component.hasClass('invalid'), true);
    this.$('.t-action-message0').val('this is the message').trigger('keyup');
    Ember.run.later(() => {
      assert.equal($component.hasClass('invalid'), false);
      run(() => { typeInSearch('e'); });
      Ember.run.later(() => {
        assert.equal(action.get('sendsms').get('recipient').get('length'), 0);
        nativeMouseUp(`.ember-power-select-option:contains(${PD.fullname})`);
        assert.equal(action.get('sendsms').get('recipient').get('length'), 1);
        assert.equal(this.$('.invalid').length, 0);
        assert.equal($component2.hasClass('invalid'), false);
        done();
      }, 300);
    }, 300);
  }, 1900);
});
