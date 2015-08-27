import {test, module} from 'qunit';
import PersonCurrent from "bsrs-ember/models/person-current";
import Ember from 'ember';

module('unit: current-user test');

test('current user is displayed', (assert) => {
  var subject = PersonCurrent.create({});
  subject.set('first_name', 'Big');
  subject.set('last_name', 'Lebowsky');
  assert.equal(subject.get('full_name'), 'Big Lebowsky');
});
