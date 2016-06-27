import Ember from 'ember';
import ComponentsGridMixin from 'bsrs-ember/mixins/repositories/grid';
import { module, test } from 'qunit';

module('Unit | Mixin | repositories/grid');

test('it accepts id_in paramter single and correctly modifies url', function(assert) {
  let ComponentsGridObject = Ember.Object.extend(ComponentsGridMixin);
  let subject = ComponentsGridObject.create({url: '/api/tickets/'});
  const priority_id = 'dfe28a24-307f-4da0-85e7-cdac016808c0';
  let endpoint = subject.modifyEndpoint(1, undefined, undefined, `priority:${priority_id}`);
  assert.equal(endpoint, `/api/tickets/?page=1&priority__id__in=${priority_id}`);
});

test('it accepts id_in paramter multiple and correctly modifies url', function(assert) {
  let ComponentsGridObject = Ember.Object.extend(ComponentsGridMixin);
  let subject = ComponentsGridObject.create({url: '/api/tickets/'});
  const priority_id = 'dfe28a24-307f-4da0-85e7-cdac016808c0';
  const priority_two_id = '2a4c8c9c-7acb-44ca-af95-62a84e410e09';
  let endpoint = subject.modifyEndpoint(1, undefined, undefined, `priority:${priority_id};${priority_two_id}`);
  assert.equal(endpoint, `/api/tickets/?page=1&priority__id__in=${priority_id},${priority_two_id}`);
});
