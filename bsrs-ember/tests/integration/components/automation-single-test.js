import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import { typeInSearch, triggerKeydown, clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import wait from 'ember-test-helpers/wait';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import SMSD from 'bsrs-ember/vendor/defaults/sendsms';
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

    let automation_repo = repository.initialize(this.container, this.registry, 'automation');
    automation_repo.getEmailRecipients = function() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve([
            { id: PD.idOne, fullname: PD.fullname, type: 'role' },
            { id: PD.idTwo, fullname: PD.fullnameBoy, type: 'person' },
          ]);
      });
    };
    automation_repo.getSmsRecipients = function() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve([
            { id: PD.idOne, fullname: PD.fullname, type: 'role' },
            { id: PD.idTwo, fullname: PD.fullnameBoy, type: 'person' },
          ]);
      });
    };
    automation_repo.getActionTypes = function() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve({ results: [
            { id: ATD.idOne, key: ATD.keyOne },
            { id: ATD.idTwo, key: ATD.keyTwo },
            { id: ATD.idThree, key: ATD.keyThree },
            { id: ATD.idFour, key: ATD.keyFour },
            { id: ATD.idFive, key: ATD.keyFive },
            { id: ATD.idSix, key: ATD.keySix },
            { id: ATD.idSeven, key: ATD.keySeven },
          ]});
      });
    };
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

test('selecting status show all statuses', function(assert) {
  run(() => {
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
  });
  model.add_action({id: '1'});
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  clickTrigger('.t-automation-action-type-select');  
  nativeMouseUp(`.ember-power-select-option:contains(${ATD.keyThree})`);
  clickTrigger('.t-ticket-status-select');
  assert.equal(Ember.$('li.ember-power-select-option').length, 1);
});

test('selecting assignee shows empty select power select', function(assert) {
  model.add_action({id: '1'});
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  clickTrigger('.t-automation-action-type-select');  
  nativeMouseUp(`.ember-power-select-option:contains(${ATD.keyOne})`);
  assert.equal(Ember.$('.t-automation-action-assignee-select .ember-power-select-selected-item').text().trim(), '');
  assert.equal(model.get('action').objectAt(0).get('assignee'), undefined);
});

test('select sendsms filter and update automation', function(assert) {
  model.add_action({id: '1'});
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  clickTrigger('.t-automation-action-type-select');
  nativeMouseUp(`.ember-power-select-option:contains(${ATD.keyFive})`);
  assert.equal(this.$('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), trans.t(ATD.keyFive), 'selected type');
  page.sendSmsBodyFillIn(SMSD.bodyTwo);
  clickTrigger('.t-action-recipient-select');
  typeInSearch('a');
  return wait().then(() => {
    nativeMouseUp('.ember-power-select-option:eq(0)');
    assert.equal(page.sendSmsBodyValue, SMSD.bodyTwo, 'sms body');
    assert.equal(page.actionSendSmsRecipientOne.replace(/\W/, '').trim(), PD.fullname, 'recipient selected for sendsms');
  });
});

test('select sendemail filter and update automation', function(assert) {
  model.add_action({id: '1'});
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  clickTrigger('.t-automation-action-type-select');
  nativeMouseUp(`.ember-power-select-option:contains(${ATD.keyFour})`);
  assert.equal(this.$('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), trans.t(ATD.keyFour), 'selected type');
  page.sendEmailBodyFillIn(SED.bodyTwo);
  clickTrigger('.t-action-recipient-select');
  typeInSearch('a');
  return wait().then(() => {
    nativeMouseUp('.ember-power-select-option:eq(0)');
    assert.equal(page.sendEmailBodyValue, SED.bodyTwo, 'sms body');
    assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), PD.fullname, 'recipient selected for sendemail');
  });
});

test('select sendemail filter will remove old related model', function(assert) {
  model.add_action({id: '1'});
  const action = store.find('automation-action', 1);
  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  action.change_assignee({id: PD.idOne});
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  assert.equal(action.get('assignee_fk'), undefined);
  this.model = model;
  this.render(hbs `{{automations/automation-single model=model}}`);
  clickTrigger('.t-automation-action-type-select');
  nativeMouseUp(`.ember-power-select-option:contains(${ATD.keyFour})`);
  assert.equal(this.$('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), trans.t(ATD.keyFour), 'selected type');
  page.sendEmailBodyFillIn(SED.bodyTwo);
  clickTrigger('.t-action-recipient-select');
  typeInSearch('a');
  return wait().then(() => {
    nativeMouseUp('.ember-power-select-option:eq(0)');
    assert.equal(page.sendEmailBodyValue, SED.bodyTwo, 'sms body');
    assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), PD.fullname, 'recipient selected for sendemail');
    assert.equal(action.get('assignee'), undefined);
    assert.equal(action.get('assignee_fk'), undefined);
    assert.ok(action.get('sendemail').get('id'));
  });
});
