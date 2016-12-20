import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import GridRepository from 'bsrs-ember/mixins/repositories/grid';

var FakeRepo = Ember.Object.extend(GridRepository);

var original_xhr, expected_endpoint;

module('unit: grid repository test', {
  beforeEach(assert) {
    module_registry(this.container, this.registry, ['model:ticket', 
      'model:grid-count', 'service:person-current']);
    original_xhr = PromiseMixin.xhr;
    PromiseMixin.xhr = function(endpoint) {
      assert.equal(endpoint, expected_endpoint);
      return {
        then() {}
      };
    };
  },
  afterEach() {
    PromiseMixin.xhr = original_xhr;
    expected_endpoint = undefined;
  }
});

test('it accepts id_in paramter single and correctly modifies url', function(assert) {
  let subject = FakeRepo.create();
  const priority_id = 'dfe28a24-307f-4da0-85e7-cdac016808c0';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(url, 1, undefined, undefined, `priority:${priority_id}`);
  assert.equal(endpoint, `/api/tickets/?page=1&priority__id__in=${priority_id}`);
});

test('it accepts id_in paramter multiple and correctly modifies url', function(assert) {
  let subject = FakeRepo.create();
  const priority_id = 'dfe28a24-307f-4da0-85e7-cdac016808c0';
  const priority_two_id = '2a4c8c9c-7acb-44ca-af95-62a84e410e09';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(url, 1, undefined, undefined, `priority:${priority_id},${priority_two_id}`);
  assert.equal(endpoint, `/api/tickets/?page=1&priority__id__in=${priority_id},${priority_two_id}`);
});

test('modifyEndpoint - no page argument - search', assert => {
  let subject = FakeRepo.create();
  const args = 'a';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    args, // search
    undefined, // find
    undefined, // id_in
    undefined, // page_size
    undefined, // sort
    undefined // special_url
  );
  assert.equal(endpoint, `/api/tickets/?search=${args}`);
});

test('modifyEndpoint - no page argument - find', assert => {
  let subject = FakeRepo.create();
  const args = 'status.translated_name:b';
  const key = 'status__name__icontains';
  const value = 'b';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    undefined, // search
    args, // find
    undefined, // id_in
    undefined, // page_size
    undefined, // sort
    undefined // special_url
  );
  assert.equal(endpoint, `/api/tickets/?${key}=${value}`);
});

test('modifyEndpoint - no page argument - id_in', assert => {
  let subject = FakeRepo.create();
  const priority_id = 'dfe28a24-307f-4da0-85e7-cdac016808c0';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    undefined, // search
    undefined, // find
    `priority:${priority_id}`, // id_in
    undefined, // page_size
    undefined, // sort
    undefined // special_url
  );
  assert.equal(endpoint, `/api/tickets/?priority__id__in=${priority_id}`);
});

test('modifyEndpoint - no page argument - page_size', assert => {
  let subject = FakeRepo.create();
  const args = 10;
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    undefined, // search
    undefined, // find
    undefined, // id_in
    args, // page_size
    undefined, // sort
    undefined // special_url
  );
  assert.equal(endpoint, `/api/tickets/?page_size=${args}`);
});

test('modifyEndpoint - no page argument - sort', assert => {
  let subject = FakeRepo.create();
  const args = 'number';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    undefined, // search
    undefined, // find
    undefined, // id_in
    undefined, // page_size
    args, // sort
    undefined // special_url
  );
  assert.equal(endpoint, `/api/tickets/?ordering=${args}`);
});

test('modifyEndpoint - no page argument - sort translated_name', assert => {
  let subject = FakeRepo.create();
  const args = 'status.translated_name';
  const value = 'status__name';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    undefined, // search
    undefined, // find
    undefined, // id_in
    undefined, // page_size
    args, // sort
    undefined // special_url
  );
  assert.equal(endpoint, `/api/tickets/?ordering=${value}`);
});

test('modifyEndpoint - no page argument - special_url', assert => {
  let subject = FakeRepo.create();
  const args = 'foo';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    undefined, // search
    undefined, // find
    undefined, // id_in
    undefined, // page_size
    undefined, // sort
    args // special_url
  );
  assert.equal(endpoint, `/api/tickets/?${args}`);
});

test('modifyEndpoint - no page argument - multiple filters', assert => {
  let subject = FakeRepo.create();
  const search = 'a';
  // find
  const findArgs = 'status.translated_name:b';
  const findKey = 'status__name__icontains';
  const findValue = 'b';
  // sort
  const sort = 'number';
  const url = '/api/tickets/';
  let endpoint = subject.modifyEndpoint(
    url,
    undefined, // page
    search, // search
    findArgs, // find
    undefined, // id_in
    undefined, // page_size
    sort, // sort
    undefined // special_url
  );
  assert.equal(endpoint, `/api/tickets/?ordering=${sort}&search=${search}&${findKey}=${findValue}`);
});
