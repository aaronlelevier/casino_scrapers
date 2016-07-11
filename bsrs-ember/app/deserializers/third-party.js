import Ember from 'ember';
import { belongs_to_extract } from 'bsrs-components/repository/belongs-to';

var ThirdPartyDeserializer = Ember.Object.extend({
  deserialize(model, options) {
    if (typeof options === 'undefined') {
      this._deserializeList(model);
    } else {
      return this._deserializeSingle(model, options);
    }
  },
  _deserializeSingle(model, id) {
    const store = this.get('simpleStore');
    let existing = store.find('third-party', id);
    let third_party = existing;
    model.detail = true;
    third_party = store.push('third-party', model);
    belongs_to_extract(model.status_fk, store, third_party, 'status', 'general', 'third_parties');
    third_party.save();
    return third_party;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      const status_json = model.status;
      delete model.status;
      const third_party = store.push('third-party-list', model);
      belongs_to_extract(status_json, store, third_party, 'status', 'general', 'third_parties');
    });
  }
});

export default ThirdPartyDeserializer;
