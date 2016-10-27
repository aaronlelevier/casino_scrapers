import Ember from 'ember';
const { run } = Ember;
import { belongs_to_extract, belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OPT_CONF from 'dummy/mixins/user_config';

var Deserializer = Ember.Object.extend(OPT_CONF, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('hat', 'user');//, {bootstrapped:true});
    many_to_many.bind(this)('shoe', 'user', {'plural':true});
    many_to_many.bind(this)('finger', 'user', {'plural':true});
  },
  simpleStore: Ember.inject.service(),
  deserialize(response){
    const store = this.get('simpleStore');
    const user = store.push('user', response);
    this.setup_hat(response.hat_fk, user);
  },
  deserialize_four(response){
    const store = this.get('simpleStore');
    const user = store.push('user', response);
    const shoes_json = response.shoes;
    delete response.shoes;
    this.setup_shoes(shoes_json, user);
  },
  deserialize_five(response){
    const store = this.get('simpleStore');
    const user = store.push('user', response);
    const finger_json = response.fingers;
    delete response.fingers;
    this.setup_fingers(finger_json, user);
  }
});

export default Deserializer;
