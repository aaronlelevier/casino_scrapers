import Ember from 'ember';
const { run, set } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TCD from 'bsrs-ember/vendor/defaults/model-category';
import LD from 'bsrs-ember/vendor/defaults/location';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import CD from 'bsrs-ember/vendor/defaults/category';
import TSD from 'bsrs-ember/vendor/defaults/status';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';

const PC = PERSON_CURRENT.defaults();
const PD = PERSON_DEFAULTS.defaults();

let ticket;

moduleForComponent('base-component', 'integration: base-component test', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:ticket', 
      'model:ticket-status', 'model:model-category', 'service:person-current']);
    translation.initialize(this);
    this.container.lookup('service:i18n');
    run(() => {
      this.store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
      ticket = this.store.push('ticket', {id: TD.idOne});
    });
  },
  afterEach() {
    delete this.store;
  }
});

test('if btnDisabled as a result of save xhr outstanding, button is disabled', function(assert) {
  this.model = ticket;
  this.btnDisabled = true;
  this.render(hbs`{{base-component model=model btnDisabled=btnDisabled}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('if model is invalid save button should be visiable and disables', function(assert) {
  run(() => {
    ticket = this.store.push('ticket', { id: TD.idOne, request: 'n'});
  });
  this.model = ticket;
  this.btnDisabled = false;
  this.render(hbs`{{base-component model=model btnDisabled=btnDisabled}}`);
  assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
  assert.equal(ticket.get('validations.isInvalid'), true);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if model is dirty and invalid');
});

test('if model is clean save button is disabled', function(assert) {
  run(() => {
    this.store.push('related-location', { id: LD.idOne, tickets: [TD.idOne]});
    this.store.push('ticket-status', { id: TSD.idOne, name: TD.statusOneKey, tickets: [TD.idOne]});
    this.store.push('ticket-priority', {id: TPD.idOne, tickets: [TD.idOne]});
    this.store.push('person', {id: PD.idOne, tickets: [TD.idOne]});
    this.store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
    this.store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
    this.store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
    this.store.push('category', {id: CD.idThree, parent_id: CD.idOne});
    this.store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
    this.store.push('category', {id: CD.idTwo, parent_id: null});
    ticket = this.store.push('ticket', { id: TD.idOne, request: TD.requestOne, requester: TD.requesterOne, location_fk: LD.idOne, status_fk: TSD.idOne, priority_fk: TPD.idOne, assigned_tickets: PD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
    ticket.save();
  });
  this.model = ticket;
  this.btnDisabled = false;
  this.render(hbs`{{base-component model=model btnDisabled=btnDisabled}}`);
  assert.equal(ticket.get('isNotDirty'), true);
  assert.equal(ticket.get('isNotDirtyOrRelatedNotDirty'), true);
  assert.equal(ticket.get('validations.isInvalid'), false);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if model is dirty and invalid');
});

test('if permissions do not contain delete for noun, then button does not show', function(assert) {
  run(() => {
    ticket = this.store.push('ticket', { id: TD.idOne });
    this.person_current = this.store.push('person-current', {id: PD.idOne, permissions: PC.permissions});
  });
  this.model = ticket;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{base-component 
    model=model 
    btnDisabled=btnDisabled 
    noun="ticket"
    permissions=permissions
  }}`);
  assert.equal(this.$('.t-delete-btn').length, 1, 'Delete button does not show if permissions do not contain delete hash');
  run(() => {
    set(this, 'permissions', ['view_ticket', 'add_ticket', 'change_ticket']);
  });
  assert.equal(this.$('.t-delete-btn').length, 0, 'Delete button show');
});

test('if permissions do not contain save for noun, then button does not show', function(assert) {
  run(() => {
    ticket = this.store.push('ticket', { id: TD.idOne });
    this.person_current = this.store.push('person-current', {id: PD.idOne, permissions: PC.permissions});
  });
  this.model = ticket;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{base-component 
    model=model 
    btnDisabled=btnDisabled 
    noun="ticket"
    permissions=permissions
  }}`);
  assert.equal(this.$('.t-save-btn').length, 1, 'Save button does show');
  run(() => {
    set(this, 'permissions', ['view_ticket', 'add_ticket', 'delete_ticket']);
  });
  assert.equal(this.$('.t-save-btn').length, 0, 'Save button does not show');
});
