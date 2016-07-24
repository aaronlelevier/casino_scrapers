import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= camelizedModuleName %>Deserializer from 'bsrs-ember/deserializers/<%= dasherizedModuleName %>';

var store, <%= camelizedModuleName %>, deserializer;

module('unit: <%= dasherizedModuleName %> deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:<%= dasherizedModuleName %>', 'model:<%= dasherizedModuleName %>-list', 'model:<%= secondModel %>', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = <%= camelizedModuleName %>Deserializer.create({
      simpleStore: store
    });
    run(() => {
      <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {
        id: <%= camelizedModuleName %>D.idOne
      });
    });
  }
});

test('deserialize single', assert => {
  let json = <%= camelizedModuleName %>F.detail();
  run(() => {
    deserializer.deserialize(json, <%= camelizedModuleName %>D.idOne);
  });
  assert.equal(<%= camelizedModuleName %>.get('id'), <%= camelizedModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= firstProperty %>'), <%= camelizedModuleName %>D.<%= firstPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= camelizedModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= camelizedModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('<%= secondModelDisplaySnake %>'), <%= camelizedModuleName %>D.<%= secondModelDisplaySnake %>);
});

test('deserialize single should update <%= secondProperty %> if server returns different <%= secondProperty %>', assert => {
  <%= camelizedModuleName %>.change_<%= secondProperty %>({id: <%= camelizedModuleName %>D.<%= secondProperty %>Two});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= camelizedModuleName %>D.<%= secondProperty %>Two);
  let json = <%= camelizedModuleName %>F.detail();
  run(() => {
    deserializer.deserialize(json, <%= camelizedModuleName %>D.idOne);
  });
  assert.equal(<%= camelizedModuleName %>.get('id'), <%= camelizedModuleName %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= firstProperty %>'), <%= camelizedModuleName %>D.<%= firstPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= camelizedModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= camelizedModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('<%= secondModelDisplaySnake %>'), <%= camelizedModuleName %>D.<%= secondModelDisplaySnake %>);
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
