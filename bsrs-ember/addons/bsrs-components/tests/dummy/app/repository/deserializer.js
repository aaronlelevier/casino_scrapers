import Ember from 'ember';
const { run } = Ember;
import { belongs_to_extract, belongs_to_extract_nodetail, belongs_to_extract_contacts } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';

var Deserializer = Ember.Object.extend({
  simpleStore: Ember.inject.service(),
  deserialize(response){
    const store = this.get('simpleStore');
    const user = store.push('user', response);
    belongs_to_extract(response.hat_fk, store, user, 'hat', 'user', user.change_hat, 'users');
  },
  deserialize_two(response){
    const store = this.get('simpleStore');
    const hats_json = response.hats;
    delete response.hats;
    const user = store.push('user', response);
    belongs_to_extract_nodetail(hats_json, store, user, 'user-hat', 'users');
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
    let [m2ms, shoes_arr, server_sum] = many_to_many_extract(shoes_json, store, user, 'user_shoes', 'user_pk', 'shoe', 'shoe_pk');
    run(() => {
      store.push('shoe', shoes_arr[0]); 
      store.push('user-shoe', m2ms[0]); 
      store.push('user', {id: response.id, user_shoes_fks: server_sum}); 
    });
  }
});

export default Deserializer;
