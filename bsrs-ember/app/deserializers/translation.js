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
        if (!trans_check.get('id') || trans_check.get('isNotDirtyOrRelatedNotDirty')) {
            extract_locale_translation(model, store);
            let trans = store.push('translation', model);
            trans.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((json) => {
            let trans = store.push('translation', {id: json});
            trans.save();
        });
    }
});

export default TranslationDeserializer;
