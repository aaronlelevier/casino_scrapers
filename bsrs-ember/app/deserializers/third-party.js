import Ember from 'ember';

var ThirdPartyDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let existing_third_party = store.find('third_party', id);
        if (!existing_third_party.get('id') || existing_third_party.get('isNotDirtyOrRelatedNotDirty')) {
            let third_party = store.push('third-party', response);
            third_party.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            let existing_third_party = store.find('third-party', model.id);
            if (!existing_third_party.get('id') || existing_third_party.get('isNotDirtyOrRelatedNotDirty')) {
                let third_party = store.push('third-party', model);
                third_party.save();
            }
        });
    }
});

export default ThirdPartyDeserializer;




