import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PersonCurrent from "bsrs-ember/models/person-current";
import Ember from 'ember';
var store, container, registry;

module('unit: current-user test', {
  beforeEach() {
      registry = new Ember.Registry();
      container = registry.container();
      store = module_registry(container, registry, ['model:person', 'model:person-current']);
  },
  afterEach() {
      registry = null;
      container = null;
      store = null;
  }
});

test('current user is displayed', (assert) => {
  var relatedSubject = store.push('person', { id: 1 });
  var subject = store.push('person-current', { id: 1 });

  assert.equal(subject.get('person.full_name'), 'undefined undefined');

  relatedSubject.set('first_name', 'Big');
  relatedSubject.set('last_name', 'Lebowsky');
  assert.equal(subject.get('person.full_name'), 'Big Lebowsky');
});
