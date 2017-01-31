import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';


var store, ticket, ticket_detail;

module('unit: ticket list test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket',
      'model:ticket-list', 'model:general-status-list', 'model:ticket-priority-list',
      'model:location', 'model:category-list', 'service:person-current']);
    run(() => {
      ticket_detail = store.push('ticket', {id: TD.idOne, number: 'scoo'});
      ticket = store.push('ticket-list', {id: TD.idOne, location_fk: LD.idOne, category_ids: [CD.idOne, CD.idTwo]});
      store.push('general-status-list', {id: 1, name: 'wat', tickets: [TD.idOne]});
      store.push('general-status-list', {id: 2, name: 'wat'});
      store.push('ticket-priority-list', {id: 3, name: 'who', tickets: [TD.idOne]});
      store.push('ticket-priority-list', {id: 2, name: 'who'});
      store.push('category-list', {id: CD.idOne, name: CD.nameOne, level: 1});
      store.push('category-list', {id: CD.idTwo, name: CD.nameTwo, level: 2});
      store.push('category-list', {id: CD.idThree, name: CD.nameThree, level: 3});
    });
  }
});

test('ticket assignee is not setup because grid displays plain object data', (assert) => {
  assert.equal(ticket.get('assignee'), undefined);
});

test('ticket location is not setup because grid displays plain object data', (assert) => {
  assert.equal(ticket.get('location'), undefined);
});

test('ticket list is dirty trackable based on ticket', (assert) => {
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket_detail.set('number', '123');
  assert.ok(ticket_detail.get('isDirtyOrRelatedDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});
