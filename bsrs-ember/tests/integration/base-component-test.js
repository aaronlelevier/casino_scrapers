import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TCD from 'bsrs-ember/vendor/defaults/model-category';
import LD from 'bsrs-ember/vendor/defaults/location';
import PD from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/category';
import TSD from 'bsrs-ember/vendor/defaults/status';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';

let store, ticket;

moduleForComponent('base-component', 'integration: base-component test', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status', 'model:model-category']);
    translation.initialize(this);
    this.container.lookup('service:i18n');
    run(() => {
      store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
      ticket = store.push('ticket', {id: TD.idOne});
    });
  },
});

test('if btnDisabled as a result of save xhr outstanding, button is disabled', function(assert) {
  this.model = ticket;
  this.btnDisabled = true;
  this.render(hbs`{{base-component model=model btnDisabled=btnDisabled}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('if model is invalid save button should be visiable and disables', function(assert) {
  run(() => {
    ticket = store.push('ticket', { id: TD.idOne, request: 'n'});
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
    store.push('location', { id: LD.idOne, tickets: [TD.idOne]});
    store.push('ticket-status', { id: TSD.idOne, name: TD.statusOneKey, tickets: [TD.idOne]});
    store.push('ticket-priority', {id: TPD.idOne, tickets: [TD.idOne]});
    store.push('person', {id: PD.idOne, tickets: [TD.idOne]});
    store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
    store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
    store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
    store.push('category', {id: CD.idThree, parent_id: CD.idOne});
    store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
    store.push('category', {id: CD.idTwo, parent_id: null});
    ticket = store.push('ticket', { id: TD.idOne, request: TD.requestOne, requester: TD.requesterOne, location_fk: LD.idOne, status_fk: TSD.idOne, priority_fk: TPD.idOne, assigned_tickets: PD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
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
