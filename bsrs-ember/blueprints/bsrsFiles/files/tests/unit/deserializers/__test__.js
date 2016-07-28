import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= FirstCharacterModuleName %>Deserializer from 'bsrs-ember/deserializers/<%= dasherizedModuleName %>';
import <%= thirdAssociatedModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdAssociatedModel %>';
import <%= thirdJoinModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdJoinModel %>';

var store, <%= camelizedModuleName %>, deserializer;

module('unit: <%= dasherizedModuleName %> deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:<%= dasherizedModuleName %>', 'model:<%= dasherizedModuleName %>-list', 'model:<%= secondModel %>', 'model:<%= thirdJoinModel %>', 'model:<%= thirdAssociatedModel %>', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = <%= FirstCharacterModuleName %>Deserializer.create({
      simpleStore: store
    });
    run(() => {
      <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', { id: <%= FirstCharacterModuleName %>D.idOne });
    });
  }
});

test('deserialize single', assert => {
  const json = <%= FirstCharacterModuleName %>F.detail();
  run(() => {
    deserializer.deserialize(json, <%= FirstCharacterModuleName %>D.idOne);
  });
  assert.equal(<%= camelizedModuleName %>.get('id'), <%= FirstCharacterModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= firstProperty %>'), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= FirstCharacterModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= FirstCharacterModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('<%= secondModelDisplaySnake %>'), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>);
});

test('existing <%= camelizedModuleName %> w/ <%= thirdPropertySnake %>, and server returns no <%= thirdPropertySnake %> - want no <%= thirdPropertySnake %> b/c that is the most recent', assert => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, joinModel_associatedModelFks: [<%= thirdJoinModelTitle %>D.idOne]});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  const <%= thirdPropertySnake %> = <%= camelizedModuleName %>.get('<%= thirdPropertySnake %>');
  assert.equal(<%= thirdPropertySnake %>.get('length'), 1);
  let json = <%= FirstCharacterModuleName %>F.detail();
  json.<%= thirdPropertySnake %> = [];
  run(() => {
    deserializer.deserialize(json, <%= FirstCharacterModuleName %>D.idOne);
  });
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>', <%= FirstCharacterModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing <%= camelizedModuleName %> w/ <%= thirdPropertySnake %>, and server returns w/ 1 extra <%= thirdPropertySnake %>', assert => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, joinModel_associatedModelFks: [<%= thirdJoinModelTitle %>D.idOne]});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  let json = <%= FirstCharacterModuleName %>F.detail();
  json.<%= thirdPropertySnake %>.push({id: <%= thirdAssociatedModelTitle %>D.unusedId});
  run(() => {
    deserializer.deserialize(json, <%= FirstCharacterModuleName %>D.idOne);
  });
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>', <%= FirstCharacterModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing <%= camelizedModuleName %> w/ <%= thirdPropertySnake %> and get same <%= thirdPropertySnake %>', assert => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= FirstCharacterModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= dasherizedModuleName %>', {id: <%= FirstCharacterModuleName %>D.idOne, joinModel_associatedModelFks: [<%= thirdJoinModelTitle %>D.idOne]});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  const json = <%= FirstCharacterModuleName %>F.detail();
  run(() => {
    deserializer.deserialize(json, <%= FirstCharacterModuleName %>D.idOne);
  });
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>', <%= FirstCharacterModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdPropertySnake %>').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize list', assert => {
  let json = <%= FirstCharacterModuleName %>F.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 20);
  const i = 0;
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>-list').objectAt(i);
  assert.equal(<%= camelizedModuleName %>.get('id'), `${<%= FirstCharacterModuleName %>D.idOne.slice(0,-1)}${i}`);
  assert.equal(<%= camelizedModuleName %>.get('<%= firstProperty %>'), `${<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One}${i}`);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').id, `${<%= FirstCharacterModuleName %>D.<%= secondPropertyCamel %>One.slice(0,-1)}${i}`);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').<%= secondModelDisplaySnake %>, `${<%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>}${i}`);
});
