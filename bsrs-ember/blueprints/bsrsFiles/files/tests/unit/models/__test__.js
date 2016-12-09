import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= secondModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= secondModel %>';
import <%= thirdAssociatedModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdAssociatedModel %>';
import <%= thirdJoinModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdJoinModel %>';

var store, <%= camelizedModuleName %>, inactive_<%= secondPropertySnake %>;

moduleFor('model:<%= camelizedModuleName %>', 'Unit | Model | <%= camelizedModuleName %>', {
  needs: ['model:<%= thirdJoinModel %>', 'model:<%= thirdAssociatedModel %>', 'model:<%= secondModel %>', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 
    'service:i18n', 'validator:presence', 'validator:length', 'validator:format', 'validator:unique-username'],
  beforeEach() {
    store = module_registry(this.container, this.registry);
    run(() => {
      <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne});
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
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= firstProperty %>: <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
    store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= FirstCharacterModuleName %>D.idOne]});
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  });
  let ret = <%= camelizedModuleName %>.serialize();
  assert.equal(ret.id, <%= FirstCharacterModuleName %>D.idOne);
  assert.equal(ret.<%= firstProperty %>, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
  assert.equal(ret.<%= secondPropertySnake %>, <%= FirstCharacterModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(ret.<%= thirdPropertySnake %>.length, 1);
});

/* <%= secondProperty %> */
test('related <%= secondModel %> should return one <%= secondModel %> for a <%= SnakeModuleName %>', (assert) => {
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
    store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= FirstCharacterModuleName %>D.idOne]});
  });
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= secondModelTitle %>D.idOne);
});

test('change_<%= secondPropertySnake %> - will update the <%= secondModel %>s <%= secondPropertySnake %> and dirty the model', (assert) => {
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= secondPropertySnake %>_fk: undefined});
    store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: []});
    inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  });
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
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
    store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= FirstCharacterModuleName %>D.idOne]});
    inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  });
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
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
    store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= FirstCharacterModuleName %>D.idOne]});
    inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  });
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
test('<%= thirdPropertySnake %> property should return all associated <%= thirdPropertySnake %>. also confirm related and join model attr values', (assert) => {
  let <%= thirdPropertySnake %>;
  run(() => {
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
    <%= thirdPropertySnake %> = <%= camelizedModuleName %>.get('<%= thirdPropertySnake %>');
  });
  assert.equal(<%= thirdPropertySnake %>.get('length'), 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>_ids'), [<%= thirdAssociatedModelTitle %>D.idOne]);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>'), [<%= thirdJoinModelTitle %>D.idOne]);
  assert.equal(<%= thirdPropertySnake %>.objectAt(0).get('id'), <%= thirdAssociatedModelTitle %>D.idOne);
});

test('<%= thirdPropertySnake %> property is not dirty when no <%= thirdPropertySnake %> present (undefined)', (assert) => {
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: undefined});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.id});
  });
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
});

test('<%= thirdPropertySnake %> property is not dirty when no <%= thirdPropertySnake %> present (empty array)', (assert) => {
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: []});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.id});
  });
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
});

test('remove_<%= thirdProperty %> - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  });
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 0);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
});

test('add_<%= thirdProperty %> - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  });
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>_ids'), [<%= thirdAssociatedModelTitle %>D.idOne]);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.add_<%= thirdProperty %>({id: <%= thirdAssociatedModelTitle %>D.idTwo});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 2);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 2);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>_ids'), [<%= thirdAssociatedModelTitle %>D.idOne, <%= thirdAssociatedModelTitle %>D.idTwo]);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').objectAt(0).get('id'), <%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').objectAt(1).get('id'), <%= thirdAssociatedModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
});

test('save<%= thirdPropertyTitle %> - <%= thirdPropertySnake %> - will reset the previous <%= thirdPropertySnake %> with multiple <%= SnakeModuleName %>s', (assert) => {
  let <%= thirdAssociatedModelSnake %>_unused = {id: <%= thirdAssociatedModelTitle %>D.unusedId};
  run(() => {
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idTwo});
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idTwo, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idTwo});
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne, <%= thirdJoinModelTitle %>D.idTwo]});
  });
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 2);
  <%= camelizedModuleName %>.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.save<%= thirdPropertyTitle %>();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.add_<%= thirdProperty %>(<%= thirdAssociatedModelSnake %>_unused);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.save<%= thirdPropertyTitle %>();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback<%= thirdPropertyTitle %> - <%= thirdPropertySnake %> - multiple <%= SnakeModuleName %>s with the same <%= thirdPropertySnake %> will rollback<%= thirdPropertyTitle %> correctly', (assert) => {
  let <%= SnakeModuleName %>_two;
  run(() => {
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
    store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idTwo, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idTwo, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
    <%= SnakeModuleName %>_two = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idTwo, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idTwo]});
  });
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= SnakeModuleName %>_two.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>IsDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isDirtyOrRelatedDirty'));
  <%= SnakeModuleName %>_two.rollback<%= thirdPropertyTitle %>();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.rollback<%= thirdPropertyTitle %>();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdPropertySnake %>IsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
});

/* Over Arching Test of saveRelated / rollBack */

test('saveRelated - change <%= secondPropertySnake %> and <%= thirdPropertySnake %>', assert => {
  // <%= secondPropertySnake %>
  run(() => {
    inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  });
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.saveRelated();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  // <%= thirdPropertySnake %>
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  run(() => {
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  });
  <%= camelizedModuleName %>.add_<%= thirdProperty %>({id: <%= thirdAssociatedModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.saveRelated();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - <%= secondPropertySnake %> and <%= thirdPropertySnake %>', assert => {
  // <%= secondPropertySnake %>
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
    <%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= FirstCharacterModuleName %>D.idOne]});
    inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  });
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), inactive_<%= secondPropertySnake %>.get('id'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.rollback();
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= secondPropertySnake %>.get('id'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  // <%= thirdPropertySnake %>
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  run(() => {
    store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  });
  <%= camelizedModuleName %>.add_<%= thirdProperty %>({id: <%= thirdAssociatedModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.rollback();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('<%= dasherizedModuleName%> validations', assert => {
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  });
  const attrs = <%= camelizedModuleName %>.get('validations').get('attrs');
  assert.ok(attrs.get('<%= firstPropertySnake %>'));
  assert.equal(<%= camelizedModuleName %>.get('validations').get('_validators').<%= firstPropertySnake %>[0].get('_type'), 'presence');
  assert.equal(<%= camelizedModuleName %>.get('validations').get('_validators').<%= firstPropertySnake %>[1].get('_type'), 'length');
  assert.deepEqual(attrs.get('<%= firstPropertySnake %>').get('messages'), ['errors.<%= camelizedModuleName %>.<%= firstPropertySnake %>']);
  assert.ok(attrs.get('<%= secondPropertySnake %>'));
  assert.deepEqual(attrs.get('<%= secondPropertySnake %>').get('messages'), ['errors.<%= camelizedModuleName %>.<%= secondPropertySnake %>']);
});
