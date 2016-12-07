import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

moduleFor('service:functional-store', 'Unit | Service | functional store', {
  needs: ['service:functional-store', 'model:ticket-list'],
  beforeEach() {
    module_registry(this.container, this.registry, []);
    let service = this.subject();
    service.clear();
  },
});

test('it pushes in an array of data and can retrieve the same object', function(assert) {
  const array = [{id: '123', name: 'wat'}, {id: '456', name: 'foo'}];
  let service = this.subject();
  
  const ticketList1 = service.push('ticket-list', array[0]);
  const ticketList2 = service.push('ticket-list', array[1]);
  // emulate what the route/deserializer would do
  const functionalArray = [ticketList1, ticketList2];
  assert.equal(functionalArray.length, 2);
  assert.equal(functionalArray[0].get('id'), '123');
  assert.equal(functionalArray[1].get('id'), '456');

  const findArray = service.find('ticket-list');
  assert.equal(findArray.length, 2);
  assert.equal(findArray[0].get('id'), '123');
  assert.equal(findArray[1].get('id'), '456');

  assert.ok(functionalArray[0] === findArray[0], 'push and find are same objs');
  assert.ok(functionalArray[1] === findArray[1]);
});

test('find returns a unique array', function(assert) {
  const obj = {id: '123', name: 'wat'};
  let service = this.subject();

  const ticketList = service.push('ticket-list', obj);
  assert.equal(ticketList.get('id'), '123');

  const findObj = service.find('ticket-list', obj.id);
  const findObj2 = service.find('ticket-list', obj.id);

  assert.ok(findObj === findObj2, 'find returns diff objects');
});

test('it pushes in a single object and returns a ', function(assert) {
  const obj = {id: '123', name: 'wat'};
  let service = this.subject();

  const ticketList = service.push('ticket-list', obj);
  assert.equal(ticketList.get('id'), '123');

  const findObj = service.find('ticket-list', obj.id);
  assert.equal(findObj.get('id'), '123');

  assert.ok(ticketList === findObj, 'push and find are same objs when single');

  const ticketList2 = service.push('ticket-list', obj);
  assert.ok(ticketList2 !== ticketList);
});

test('is clears by type', function(assert) {
  const obj = {id: '123', name: 'wat'};
  let service = this.subject();

  const ticketList = service.push('ticket-list', obj);
  assert.equal(ticketList.get('id'), '123');

  service.clear('ticket-list');
  const findObj = service.find('ticket-list');
  assert.equal(findObj.size, undefined);
  
});

test('is clears all', function(assert) {
  const obj = {id: '123', name: 'wat'};
  let service = this.subject();

  const ticketList = service.push('ticket-list', obj);
  assert.equal(ticketList.get('id'), '123');

  service.clear();
  assert.deepEqual(service.get('persistentContainer'), {});
  
});
