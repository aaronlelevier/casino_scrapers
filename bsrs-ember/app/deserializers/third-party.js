import Ember from 'ember';

var extract_status = function(model, store) {
    const status = store.find('status', model.status);
    let existing_people = status.get('people') || [];
    existing_people = existing_people.indexOf(model.id) > -1 ? existing_people : existing_people.concat(model.id);
    store.push('status', {id: status.get('id'), people: existing_people});
    // status.set('people', existing_people);
    model.status_fk = status.get('id');
    delete model.status;
};

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
            extract_status(model, store);
            let third_party = store.push('third-party', model);
            third_party.save();
        }
    },
    deserialize_list(model) {
        const store = this.get('store');
        model.results.forEach((model) => {
            let existing_third_party = store.find('third-party', model.id);
            if (!existing_third_party.get('id') || existing_third_party.get('isNotDirtyOrRelatedNotDirty')) {
                extract_status(model, store);
                let third_party = store.push('third-party', model);
                third_party.save();
            }
        });
    }
});

export default ThirdPartyDeserializer;




