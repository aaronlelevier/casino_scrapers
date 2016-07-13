import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= secondModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= secondModel %>';

var store, <%= dasherizedModuleName %>, <%= secondModel %>;

module('unit: <%= dasherizedModuleName %> test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:<%= dasherizedModuleName %>', 'model:<%= secondModel %>', 'model:<%= secondModel %>-current', 'service:<%= secondModel %>-current', 'service:translations-fetcher', 'service:i18n']);
    run(function() {
    <%= dasherizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondProperty %>_fk: <%= secondModelTitle %>D.idOne});
    <%= secondModel %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  });
}
});

test('dirty test | <%= firstProperty %>', assert => {
  assert.equal(<%= dasherizedModuleName %>.get('isDirty'), false);
  <%= dasherizedModuleName %>.set('<%= firstProperty %>', 'wat');
  assert.equal(<%= dasherizedModuleName %>.get('isDirty'), true);
  <%= dasherizedModuleName %>.set('<%= firstProperty %>', '');
  assert.equal(<%= dasherizedModuleName %>.get('isDirty'), false);
});

test('serialize', assert => {
  <%= dasherizedModuleName %> = store.push('<%= dasherizedModuleName %>', {
    id: <%= camelizedModuleName %>D.idOne,
    <%= firstProperty %>: <%= camelizedModuleName %>D.descOne,
  });
  let ret = <%= dasherizedModuleName %>.serialize();
  assert.equal(ret.id, <%= camelizedModuleName %>D.idOne);
  assert.equal(ret.<%= firstProperty %>, <%= camelizedModuleName %>D.descOne);
  assert.equal(ret.<%= secondProperty %>, <%= camelizedModuleName %>D.<%= secondProperty %>One);
});

/* <%= secondProperty %> */
test('related <%= secondModel %> should return one <%= secondModel %> for a <%= dasherizedModuleName %>', (assert) => {
  let people = store.find('<%= secondModel %>');
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= secondModelTitle %>D.idOne);
});

test('change_<%= secondProperty %> will update the <%= secondModel %>s <%= secondProperty %> and dirty the model', (assert) => {
  let <%= secondProperty %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= dasherizedModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondProperty %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= dasherizedModuleName %>s: []});
  assert.ok(<%= dasherizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= dasherizedModuleName %>.change_<%= secondProperty %>({id: inactive_<%= secondProperty %>.get('id')});
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= dasherizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
});

test('save <%= dasherizedModuleName %> will set <%= secondProperty %>_fk to current <%= secondProperty %> id', (assert) => {
  let <%= secondProperty %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= dasherizedModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondProperty %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= dasherizedModuleName %>s: []});
  assert.ok(<%= dasherizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= dasherizedModuleName %>.change_<%= secondProperty %>({id: inactive_<%= secondProperty %>.get('id')});
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= dasherizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  <%= dasherizedModuleName %>.saveRelated();
  assert.ok(<%= dasherizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idTwo);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
});

test('rollback <%= dasherizedModuleName %> will set <%= secondProperty %> to current <%= secondProperty %>_fk', (assert) => {
  let <%= secondProperty %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= dasherizedModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondProperty %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= dasherizedModuleName %>s: []});
  assert.ok(<%= dasherizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= dasherizedModuleName %>.change_<%= secondProperty %>({id: inactive_<%= secondProperty %>.get('id')});
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= dasherizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  <%= dasherizedModuleName %>.rollback();
  assert.ok(<%= dasherizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= dasherizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
});
