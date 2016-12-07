import Ember from 'ember';


var extract_locale_translation = function(model, store) {
  model.locales.forEach((obj) => {
    var data = {
      'id': obj.locale + ':' + model.key,
      'locale': obj.locale,
      'locale_name': store.find('locale', obj.locale).get('name'),
      'translation': obj.translation
    };
    let locale_trans = store.push('locale-translation', data);
  });
  delete model['locales'];
};

var TranslationDeserializer = Ember.Object.extend({
  deserialize(response, id) {
    if (id) {
      this._deserializeSingle(response, id);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(model, id) {
    let store = this.get('simpleStore');
    let trans_check = store.find('translation', id);
    if (!trans_check.get('id') || trans_check.get('isNotDirtyOrRelatedNotDirty')) {
      extract_locale_translation(model, store);
      model.detail = true;
      let trans = store.push('translation', model);
      trans.save();
    }
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    const results = [];
    response.results.forEach((json) => {
      const translation = store.push('translation-list', {id: json});
      results.push(translation);
    });
    return results;
  }
});

export default TranslationDeserializer;
