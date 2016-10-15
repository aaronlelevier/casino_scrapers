import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TBD from 'bsrs-ember/vendor/defaults/tab';
import TBF from 'bsrs-ember/vendor/tab_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, tab1;

module('unit: tab', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tab', 'model:ticket']);
  }
});

test('test generic attrs on the model', (assert) => {
  let data = TBF.get();
  tab1 = store.push('tab', data);
  assert.equal(tab1.get('id'), TBD.id_one);
  assert.equal(tab1.get('type'), TBD.typeTwo);
  assert.equal(tab1.get('module'), TBD.module_one);
  assert.equal(tab1.get('routeName'), TBD.routeName_one);
  assert.equal(tab1.get('templateModelField'), TBD.templateModelField_one);
  assert.equal(tab1.get('redirectRoute'), TBD.redirect_one);
  assert.equal(tab1.get('newModel'), TBD.newModel_one);
});

// test('ensure tabs are aware of the total tab count', (assert) => {
//   let data = TBF.get();
//   run(()=>{
//     tab1 = store.push('tab', data);
//   });
//   assert.equal(tab1.get('tab_count').get('length'), 1);
//   data = TBF.get(TBD.id_two);
//   run(()=>{
//     tab2 = store.push('tab', data);
//   });
//   assert.equal(tab1.get('tab_count').get('length'), 2);
//   assert.equal(tab2.get('tab_count').get('length'), 2);
// });

test('model is returned based on id of corresponding model', (assert) => {
  let data = TBF.get();
  run(()=>{
    tab1 = store.push('tab', data);
  });
  assert.equal(tab1.get('id'), data.id);
});

test('singleTabModel is returned based on model_id of corresponding model defined in after model hook', (assert) => {
  let data = TBF.get();
  data.model_id = data.id;
  let ticket;
  run(()=>{
    ticket = store.push('ticket', {id: data.id, singleTabId: 'ticket123'});
    tab1 = store.push('tab', data);
  });
  assert.equal(tab1.get('module'), 'ticket');
  assert.equal(tab1.get('singleTabModel').get('id'), ticket.get('id'));
});
