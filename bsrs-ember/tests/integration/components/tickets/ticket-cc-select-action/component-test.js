import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import page from 'bsrs-ember/tests/pages/automation';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import waitFor from 'ember-test-helpers/wait';
import { clickTrigger, triggerKeydown, nativeMouseUp, nativeMouseDown, typeInSearch } from 'bsrs-ember/tests/helpers/ember-power-select';

let store, trans, action, person_repo;
const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('tickets/ticket-request-select-action', 'Integration | Component | tickets/ticket request select action', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    trans = this.container.lookup('service:i18n');  
    store = module_registry(this.container, this.registry, ['model:automation']);
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    run(function() {
      action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idSaven, automation_action_ticketcc_fks: [10]});
      store.push('automation-action-type', {id: ATD.idSeven, key: ATD.keySeven, actions: [AAD.idOne]});
      store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
      store.push('related-person', {id: PD.idOne, first_name: PD.first_name, last_name: PD.last_name});
      store.push('related-person', {id: PD.idTwo, first_name: 'Scooter', last_name: 'McGavin'});
      store.push('related-person', {id: PD.unusedId, first_name: 'Aaron', last_name: 'Wat'});
    });
    person_repo = repository.initialize(this.container, this.registry, 'person');
    person_repo.findPeople = function() { 
      return [{id: PD.idTwo, fullname: 'scooter'}];
    };
  }
});

test('it renders with existing ticketcc', function(assert) {
  this.model = action;
  this.index = 0;
  this.render(hbs`{{tickets/ticket-cc-select-action model=model index=index}}`);
  assert.equal(this.$('[data-test-id=automation-ticket-cc]').text().trim(), trans.t('automation.actions.cc'));
  assert.equal(action.get('ticketcc').get('length'), 1);
  assert.equal(page.actionTicketccOne.replace(/\W/, '').trim(), action.get('ticketcc').objectAt(0).get('fullname'));
});

test('shows validation messages', function(assert) {
  this.model = action;
  this.index = 0;
  this.render(hbs`{{tickets/ticket-cc-select-action model=model index=index}}`);
  let $component = this.$('.t-action-ticketcc-validator0');
  assert.equal($component.hasClass('invalid'), false);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  nativeMouseDown('.ember-power-select-multiple-remove-btn');
  assert.equal($component.hasClass('invalid'), true);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.automation.ticketcc'));
});

test('add multiple ticketcc and track to see if valid', function(assert) {
  this.model = action;
  this.index = 0;
  this.personRepo = person_repo;
  this.render(hbs`{{tickets/ticket-cc-select-action model=model index=index personRepo=personRepo}}`);
  let $component = this.$('.t-action-ticketcc-validator0');
  assert.equal($component.hasClass('invalid'), false);
  clickTrigger('.t-action-ticketcc-select');
  typeInSearch('s');
  return waitFor().then(() => {
    nativeMouseUp('.ember-power-select-option:contains("scooter")');
    assert.equal($component.hasClass('invalid'), false);
    assert.equal(action.get('ticketcc').get('length'), 2);
    assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
    nativeMouseDown('.ember-power-select-multiple-remove-btn:eq(1)');
    assert.equal($component.hasClass('invalid'), false);
    assert.equal(action.get('ticketcc').get('length'), 1);
    assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
    nativeMouseDown('.ember-power-select-multiple-remove-btn');
    assert.equal(action.get('ticketcc').get('length'), 0);
    assert.equal($component.hasClass('invalid'), true);
    assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.automation.ticketcc'));
  });
});

test('ticketcc should have avatar and fullname', function(assert) {
  this.model = action;
  this.index = 0;
  this.personRepo = person_repo;
  this.render(hbs`{{tickets/ticket-cc-select-action
    model=model
    index=index 
    personRepo=personRepo
    componentArg="photo-avatar"
  }}`);
  nativeMouseDown('.ember-power-select-multiple-remove-btn');
  clickTrigger('.t-action-ticketcc-select');
  typeInSearch('a');
  return waitFor().then(() => {
    assert.equal(Ember.$('.ember-power-select-option').length, 1);
    nativeMouseUp('.ember-power-select-option:contains("scooter")');
    assert.equal(Ember.$('[data-test-id="user-avatar"]').length, 1);
    assert.equal(Ember.$('[data-test-id="user-fullname"]').text().trim(), 'scooter');
  });
});
