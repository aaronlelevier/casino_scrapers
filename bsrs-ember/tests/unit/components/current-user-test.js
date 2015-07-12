import {test, module} from 'qunit';
import CurrentUserComponent from "bsrs-ember/components/current-user/component";
import Ember from 'ember';

module('unit: current-user test');

test('xx current user is displayed', (assert) => {
  var subject = CurrentUserComponent.create({});
  subject.set('fullName', 'Big Lebowsky');
  assert.equal(subject.get('fullName'), 'Big Lebowsky');
});
