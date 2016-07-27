import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= camelizedModuleName %>Deserializer from 'bsrs-ember/deserializers/<%= dasherizedModuleName %>';
import <%= thirdAssociatedModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdAssociatedModel %>';
import <%= thirdJoinModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdJoinModel %>';

var store, <%= camelizedModuleName %>, deserializer;

module('unit: <%= dasherizedModuleName %> deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:<%= dasherizedModuleName %>', 'model:<%= dasherizedModuleName %>-list', 'model:<%= secondModel %>', 'model:<%= thirdJoinModel %>', 'model:<%= thirdAssociatedModel %>', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = <%= camelizedModuleName %>Deserializer.create({
      simpleStore: store
    });
    run(() => {
      <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', { id: <%= camelizedModuleName %>D.idOne });
    });
  }
});

test('deserialize single', assert => {
  const json = <%= camelizedModuleName %>F.detail();
  run(() => {
    deserializer.deserialize(json, <%= camelizedModuleName %>D.idOne);
  });
  assert.equal(<%= camelizedModuleName %>.get('id'), <%= camelizedModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= firstProperty %>'), <%= camelizedModuleName %>D.<%= firstPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= camelizedModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= camelizedModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('<%= secondModelDisplaySnake %>'), <%= camelizedModuleName %>D.<%= secondModelDisplaySnake %>);
});

test('existing <%= camelizedModuleName %> w/ filters, and server returns no filters - want no filters b/c that is the most recent', assert => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, joinModel_associatedModelFks: [<%= thirdJoinModelTitle %>D.idOne]});
  store.push('pfilter', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  const <%= thirdProperty %>s = <%= camelizedModuleName %>.get('<%= thirdProperty %>s');
  assert.equal(<%= thirdProperty %>s.get('length'), 1);
  let json = PF.detail();
  json.filters = [];
  run(() => {
    deserializer.deserialize(json, <%= camelizedModuleName %>D.idOne);
  });
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>', <%= camelizedModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing <%= camelizedModuleName %> w/ filters, and server returns w/ 1 extra filter', assert => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, joinModel_associatedModelFks: [<%= thirdJoinModelTitle %>D.idOne]});
  store.push('pfilter', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  let json = PF.detail();
  json.filters.push({id: <%= thirdAssociatedModelTitle %>D.unusedId});
  run(() => {
    deserializer.deserialize(json, <%= camelizedModuleName %>D.idOne);
  });
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>', <%= camelizedModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing <%= camelizedModuleName %> w/ filter and get same filter', assert => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, joinModel_associatedModelFks: [<%= thirdJoinModelTitle %>D.idOne]});
  store.push('pfilter', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  const json = PF.detail();
  run(() => {
    deserializer.deserialize(json, <%= camelizedModuleName %>D.idOne);
  });
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>', <%= camelizedModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize list', assert => {
  let json = <%= camelizedModuleName %>F.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 20);
  const i = 0;
  <%= camelizedModuleName %> = store.find('<%= dasherizedModuleName %>-list').objectAt(i);
  assert.equal(<%= camelizedModuleName %>.get('id'), `${<%= camelizedModuleName %>D.idOne.slice(0,-1)}${i}`);
  assert.equal(<%= camelizedModuleName %>.get('<%= firstProperty %>'), `${<%= camelizedModuleName %>D.<%= firstPropertyCamel %>One}${i}`);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').idOne, `${<%= camelizedModuleName %>D.<%= secondPropertyCamel %>One.slice(0,-1)}${i}`);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').<%= secondModelDisplaySnake %>, `${<%= camelizedModuleName %>D.<%= secondModelDisplaySnake %>}${i}`);
});
