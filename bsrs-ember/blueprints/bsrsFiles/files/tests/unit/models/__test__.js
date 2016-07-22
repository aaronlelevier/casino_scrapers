import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= secondModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= secondModel %>';
import <%= thirdAssociatedModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdAssociatedModel %>';
import <%= thirdJoinModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdJoinModel %>';

var store, <%= SnakeModuleName %>;

module('unit: <%= SnakeModuleName %> test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:<%= dasherizedModuleName %>', 'model:<%= thirdJoinModel %>', 'model:<%= thirdAssociatedModelSnake %>', 'model:<%= secondModel %>', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne});
    });
  }
});

test('dirty test | <%= firstProperty %>', assert => {
  assert.equal(<%= camelizedModuleName %>.get('isDirty'), false);
  <%= camelizedModuleName %>.set('<%= firstProperty %>', 'wat');
  assert.equal(<%= camelizedModuleName %>.get('isDirty'), true);
  <%= camelizedModuleName %>.set('<%= firstProperty %>', '');
  assert.equal(<%= camelizedModuleName %>.get('isDirty'), false);
});

test('serialize', assert => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= firstProperty %>: <%= camelizedModuleName %>D.descOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  let ret = <%= camelizedModuleName %>.serialize();
  assert.equal(ret.id, <%= camelizedModuleName %>D.idOne);
  assert.equal(ret.<%= firstProperty %>, <%= camelizedModuleName %>D.descOne);
  assert.equal(ret.<%= secondPropertySnake %>, <%= camelizedModuleName %>D.<%= secondPropertySnake %>One);
  assert.equal(ret.filters.length, 1);
});

/* <%= thirdProperty %> */
test('related <%= secondModel %> should return one <%= secondModel %> for a <%= SnakeModuleName %>', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= secondModelTitle %>D.idOne);
});

test('change_<%= secondPropertySnake %> - will update the <%= secondModel %>s <%= secondPropertySnake %> and dirty the model', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: undefined});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: []});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>'), undefined);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: <%= secondModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), undefined);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), undefined);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
});

test('save<%= secondPropertyTitle %> - <%= secondPropertySnake %> - <%= SnakeModuleName %>will set <%= secondPropertySnake %>_fk to current <%= secondPropertySnake %> id', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  <%= camelizedModuleName %>.save<%= secondPropertyTitle %>();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idTwo);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
});

test('rollback<%= secondPropertyTitle %> - <%= secondPropertySnake %> - <%= SnakeModuleName %>will set <%= secondPropertySnake %> to current <%= secondPropertySnake %>_fk', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  <%= camelizedModuleName %>.rollback<%= secondPropertyTitle %>();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
});

/* <%= SnakeModuleName %>& PROFILE_FILTER */
test('<%= thirdAssociatedName %>s property should return all associated <%= thirdAssociatedName %>s. also confirm related and join model attr values', (assert) => {
  let m2m = store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  let profile_filter = store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  let <%= thirdAssociatedName %>s = <%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s');
  assert.equal(<%= thirdAssociatedName %>s.get('length'), 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s_ids'), [<%= thirdAssociatedModelTitle %>D.idOne]);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>'), [<%= thirdJoinModelTitle %>D.idOne]);
  assert.equal(<%= thirdAssociatedName %>s.objectAt(0).get('id'), <%= thirdAssociatedModelTitle %>D.idOne);
});

test('<%= thirdAssociatedName %>s property is not dirty when no <%= thirdAssociatedName %>s present (undefined)', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: undefined});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.id});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
});

test('<%= thirdAssociatedName %>s property is not dirty when no <%= thirdAssociatedName %>s present (empty array)', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: []});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.id});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
});

test('remove_<%= thirdAssociatedName %> - will remove join model and mark model as dirty', (assert) => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.remove_<%= thirdAssociatedName %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 0);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 0);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
});

test('add_<%= thirdAssociatedName %> - will create join model and mark model dirty', (assert) => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s_ids'), [<%= thirdAssociatedModelTitle %>D.idOne]);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.add_<%= thirdAssociatedName %>({id: <%= thirdAssociatedModelTitle %>D.idTwo});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 2);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 2);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s_ids'), [<%= thirdAssociatedModelTitle %>D.idOne, <%= thirdAssociatedModelTitle %>D.idTwo]);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').objectAt(0).get('id'), <%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').objectAt(1).get('id'), <%= thirdAssociatedModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
});

test('savePfs - <%= thirdAssociatedName %>s - will reset the previous <%= thirdAssociatedName %>s with multiple <%= SnakeModuleName %>s', (assert) => {
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idTwo});
  const <%= thirdAssociatedModelSnake %>_unused = {id: <%= thirdAssociatedModelTitle %>D.unusedId};
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idTwo, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idTwo});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne, <%= thirdJoinModelTitle %>D.idTwo]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 2);
  <%= camelizedModuleName %>.remove_<%= thirdAssociatedName %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.savePfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.add_<%= thirdAssociatedName %>(<%= thirdAssociatedModelSnake %>_unused);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.savePfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackPfs - <%= thirdAssociatedName %>s - multiple <%= SnakeModuleName %>s with the same <%= thirdAssociatedName %>s will rollbackPfs correctly', (assert) => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idTwo, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idTwo, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  let <%= SnakeModuleName %>_two = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idTwo, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idTwo]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= SnakeModuleName %>_two.remove_<%= thirdAssociatedName %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>sIsDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isDirtyOrRelatedDirty'));
  <%= SnakeModuleName %>_two.rollbackPfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.remove_<%= thirdAssociatedName %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 0);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.rollbackPfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdAssociatedName %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
});

/* Over Arching Test of saveRelated / rollBack */

test('saveRelated - change <%= secondPropertySnake %> and <%= thirdAssociatedName %>s', assert => {
  // <%= secondPropertySnake %>
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.saveRelated();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  // <%= thirdAssociatedName %>s
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 0);
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %>.add_<%= thirdAssociatedName %>({id: <%= thirdAssociatedModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.saveRelated();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - <%= secondPropertySnake %> and <%= thirdAssociatedName %>s', assert => {
  // <%= secondPropertySnake %>
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  <%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), inactive_<%= secondPropertySnake %>.get('id'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.rollback();
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= secondPropertySnake %>.get('id'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  // <%= thirdAssociatedName %>s
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 0);
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %>.add_<%= thirdAssociatedName %>({id: <%= thirdAssociatedModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.rollback();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdAssociatedName %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});
