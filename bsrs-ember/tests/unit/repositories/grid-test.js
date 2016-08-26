import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import GridRepository from 'bsrs-ember/mixins/repositories/grid';

var FakeRepo = Ember.Object.extend(GridRepository);

var store, original_xhr, expected_endpoint;

module('unit: grid repository test', {
  beforeEach(assert) {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:grid-count']);
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

test('findWithQuery will format sort url string correctly', (assert) => {
  assert.expect(1);
  expected_endpoint = '?page=1&ordering=status__name,request,priority__name';
  let subject = FakeRepo.create({simpleStore: store, type: 'ticket', url:''});
  subject.findWithQuery(1, undefined, undefined, undefined, undefined, 'status.translated_name,request,priority.translated_name');
});

test('findWithQuery will format find url string correctly', (assert) => {
  assert.expect(1);
  expected_endpoint = '?page=1&status__name__icontains=a&request__icontains=r&priority__name__icontains=b';
  let subject = FakeRepo.create({simpleStore: store, type: 'ticket', url:''});
  subject.findWithQuery(1, '', 'status.translated_name:a,request:r,priority.translated_name:b');
});

// test('findWithQuery will format find url string correctly with array based property', (assert) => {
//   assert.expect(1);
//   expected_endpoint = '?page=1&status__name__icontains=a&categories__name__icontains=x&request__icontains=r';
//   let subject = FakeRepo.create({simpleStore: store, type: 'ticket', url:''});
//   subject.findWithQuery(1, '', 'status.translated_name:a,categories[name]:x,request:r');
// });

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
