import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TicketRepository from 'bsrs-ember/repositories/ticket';

var store, ticket, ticketRepo, uuid;

module('unit: ticket repo test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket',
      'model:ticket-status', 'model:ticket-priority', 'model:uuid',
      'service:i18n', 'service:person-current']);
    uuid = this.container.lookup('model:uuid');
    run(() => {
        store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey, default: true});
        store.push('ticket-status', {id: TD.statusTwo, name: TD.statusTwoKey});
        store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey, default: true});
        store.push('ticket-priority', {id: TD.priorityTwo, name: TD.priorityTwoKey});
    });
  }
});

test('create - will default status and priority (which exist in the store because they are bootstrapped)', assert => {
    let new_pk = 1;
    let init_count = store.find('ticket').get('length');
    ticketRepo = TicketRepository.create({simpleStore: store, type: 'ticket', url:'', uuid: uuid});
    ticket = ticketRepo.create(new_pk);
    let post_count = store.find('ticket').get('length');
    assert.equal(post_count, init_count+1);
    assert.equal(ticket.get('status.id'), store.find('ticket-status', {default: true}).objectAt(0).get('id'));
    assert.equal(ticket.get('priority.id'), store.find('ticket-priority', {default: true}).objectAt(0).get('id'));
});
