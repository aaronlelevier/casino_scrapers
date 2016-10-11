import Ember from 'ember';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { sortCreated } from 'bsrs-ember/helpers/sort-created';
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';
const { run } = Ember;

let store;

module('Unit | Helper | sort created', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:activity']);
    run(() => {
      store.push('activity', {id: TAD.idAssigneeOne, type: 'assignee', to_fk: 2, from_fk: 3, created: new Date()});
      const d = new Date();
      store.push('activity', {id: TAD.idAssigneeTwo, type: 'assignee', to_fk: 2, from_fk: 3, created: d.setDate(d.getDate()-90)});
    });
  }
});

test('it sorts created property on an array proxy', function(assert) {
  const activities = store.find('activity');
  let result = sortCreated([activities]);
  assert.equal(result[0].get('id'), TAD.idAssigneeOne);
  assert.equal(result[1].get('id'), TAD.idAssigneeTwo);
});
