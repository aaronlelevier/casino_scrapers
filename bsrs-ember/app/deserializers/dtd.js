import Ember from 'ember';

const { run } = Ember;

var DTDDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            return this.deserialize_list(response);
        } else {
            return this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        const store = this.get('store');
        let existing = store.find('dtd', id);
        let return_dtd = existing;
        if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
            const dtd = store.push('dtd', response);
            dtd.save();
            return_dtd = dtd;
        }
    },
    deserialize_list(response) {
        const store = this.get('store');
        const return_array = [];
        response.results.forEach((model) => {
            const dtd = store.push('dtd-list', model);
            return_array.push(dtd);
        });
        return return_array;
    }
});

export default DTDDeserializer;






