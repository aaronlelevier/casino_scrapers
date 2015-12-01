import Ember from 'ember';

var TranslationDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(model, id) {
        let store = this.get('store');
        let trans_check = store.find('translation', id);
        if (!trans_check.get('id') || trans_check.get('isNotDirty')) {
            let trans = store.push('translation', model);
            trans.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            // debugger;
            let trans_check = store.find('translation', model);
            //prevent updating if dirty
            if (!trans_check.get('id') || trans_check.get('isNotDirty')) {
                let trans = store.push('translation', {id: model});
                trans.save();
            }
        });
    }
});

export default TranslationDeserializer;
