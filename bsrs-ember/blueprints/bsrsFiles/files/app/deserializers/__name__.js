import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/<%= dasherizedModuleName %>';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)(<%= secondPropertySnake %>, <%= dasherizedModuleName %>, <%= secondModel %>);
    many_to_many.bind(this)('pf', <%= dasherizedModuleName %>, {plural:true});
  },
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    response.<%= secondPropertySnake %>_fk = response.<%= secondPropertySnake %>.id;
    const <%= secondPropertySnake %> = response.<%= secondPropertySnake %>;
    const <%= thirdPropertySnake %> = response.<%= thirdPropertySnake %>;
    delete response.<%= secondPropertySnake %>;
    delete response.<%= thirdPropertySnake %>;
    response.detail = true;
    let <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', response);
    // if (<%= secondPropertySnake %>) {
      this.setup_<%= secondPropertySnake %>(<%= secondPropertySnake %>, <%= camelizedModuleName %>);
    // }
    // if (<%= thirdPropertSnake %>s) {
      this.setup_<%= thirdPropertySnake %>(<%= thirdPropertySnake %>, <%= camelizedModuleName %>);
    // }
    <%= camelizedModuleName %>.save();
    return <%= camelizedModuleName %>;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      store.push('<%= dasherizedModuleName %>-list', model);
    });
  }
});
