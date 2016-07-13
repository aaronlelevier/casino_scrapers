import Ember from 'ember';

export default Ember.Object.extend({
  deserialize(response, id) {
    const store = this.get('simpleStore');
    if (id) {
      return this._deserializeSingle(store, response);
    }
    else {
      return this._deserializeList(store, response);
    }
  },
  _deserializeSingle(store, model) {
    model.<%= secondPropertySnake %>_fk = model.<%= secondPropertySnake %>.id;
    const <%= secondPropertySnake %> = model.<%= secondPropertySnake %>;
    delete model.<%= secondPropertySnake %>;
    let <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', model);
    <%= camelizedModuleName %>.change_<%= secondPropertySnake %>(<%= secondPropertySnake %>);
    return <%= camelizedModuleName %>;
  },
  _deserializeList(store, response) {
    response.results.forEach((model) => {
      store.push('<%= dasherizedModuleName %>-list', model);
    });
  }
});
