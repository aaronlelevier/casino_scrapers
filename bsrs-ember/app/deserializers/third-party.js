import Ember from 'ember';
import { belongs_to_extract } from 'bsrs-components/repository/belongs-to';

var ThirdPartyDeserializer = Ember.Object.extend({
    deserialize(model, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(model);
        } else {
            this.deserialize_single(model, options);
        }
    },
    deserialize_single(model, id) {
        const store = this.get('store');
        let existing_third_party = store.find('third-party', id);
        if (!existing_third_party.get('id') || existing_third_party.get('isNotDirtyOrRelatedNotDirty')) {
            model.detail = true;
            const third_party = store.push('third-party', model);
            belongs_to_extract(model.status_fk, store, third_party, 'status', 'general', 'third_parties');
            third_party.save();
        }
    },
    deserialize_list(response) {
        const store = this.get('store');
        response.results.forEach((model) => {
            const status_json = model.status;
            delete model.status;
            const third_party = store.push('third-party-list', model);
            belongs_to_extract(status_json, store, third_party, 'status', 'general', 'third_parties');
        });
    }
});

export default ThirdPartyDeserializer;




