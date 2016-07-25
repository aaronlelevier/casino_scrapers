import Ember from 'ember';
const { run } = Ember;
import { belongs_to_extract, belongs_to_extract_contacts } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OPT_CONF from 'dummy/mixins/user_config';

var Deserializer = Ember.Object.extend(OPT_CONF, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('shoe', 'user', {'plural':true});
  },
  simpleStore: Ember.inject.service(),
  deserialize(response){
    const store = this.get('simpleStore');
    const user = store.push('user', response);
    belongs_to_extract(response.hat_fk, store, user, 'hat', 'user', user.change_hat, 'users');
  },
  deserialize_three(response){
    const store = this.get('simpleStore');
    response.email_fks = belongs_to_extract_contacts(response, store, 'email', 'emails');
    store.push('user', response);
  },
  deserialize_four(response){
    const store = this.get('simpleStore');
    const user = store.push('user', response);
    const shoes_json = response.shoes;
    delete response.shoes;
    this.setup_m2m(shoes_json, user);
  }
});

export default Deserializer;
