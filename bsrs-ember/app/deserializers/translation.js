import Ember from 'ember';


var extract_locale_translation = function(model, store) {
    model.locales.forEach((obj) => {
        var data = {
            'id': obj.locale + ':' + model.key,
            'locale': obj.locale,
            'translation': obj.translation
        };
        let locale_trans = store.push('locale-translation', data);
    });
    delete model['locales'];
};

// TODO: Write a test to show how this behaves when there's nothing in the store to begin with

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
        // if (!trans_check.get('id') || trans_check.get('isNotDirty')) {
        // locale-translations
        extract_locale_translation(model, store);
        // translation
        let trans = store.push('translation', model);
        trans.save();
        // }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((json) => {
        // TODO: this will also be required eventually (need a test to justify as well)
        // if (!trans_check.get('id') || trans_check.get('isNotDirty')) {
            // locale-translations
            extract_locale_translation(json, store);
            // translation
            let trans = store.push('translation', json);
            trans.save();
        });
    }
});

export default TranslationDeserializer;
