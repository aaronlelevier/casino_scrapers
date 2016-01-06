import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PersonCurrent from "bsrs-ember/models/person-current";
import Ember from 'ember';

var store, run = Ember.run;

module('unit: current-user test', {
  beforeEach() {
      store = module_registry(this.container, this.registry, ['model:person','model:person-current','service:person-current','service:translations-fetcher','service:i18n']);
  }
});

test('current user is displayed', (assert) => {
  let relatedSubject, subject;
  run(function() {
    relatedSubject = store.push('person', { id: 1 });
    subject = store.push('person-current', { id: 1 });
  });
  assert.equal(subject.get('person.fullname'), 'undefined undefined');
  relatedSubject.set('first_name', 'Big');
  relatedSubject.set('last_name', 'Lebowsky');
  assert.equal(subject.get('person.fullname'), 'Big Lebowsky');
});
