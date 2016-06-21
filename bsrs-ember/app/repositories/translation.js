import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';

var PREFIX = config.APP.NAMESPACE;
const TRANSLATION_URL = PREFIX + '/admin/translations/';

export default Ember.Object.extend(GridRepositoryMixin, {
  type: Ember.computed(function() { return 'translation'; }),
  typeGrid: Ember.computed(function() { return 'translation-list'; }),
  url: Ember.computed(function() { return TRANSLATION_URL; }),
  TranslationDeserializer: inject('translation'),
  deserializer: Ember.computed.alias('TranslationDeserializer'),
  insert(model) {
    return PromiseMixin.xhr(TRANSLATION_URL, 'POST', {data: JSON.stringify(model.createSerialize())}).then(() => {
      model.save();
      //TODO: insert should also call saveRelated (tdd please)
      //NOTE: (ayl) Since the List Endpoint only contains the Translation keys, we're
      //  never going to save related on the initial "insert"
      //  - wait for Toran to confirm this??
    });
  },
  update(model) {
    return PromiseMixin.xhr(TRANSLATION_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
      model.saveRelated();
    });
  },
  find() {
    PromiseMixin.xhr(TRANSLATION_URL, 'GET').then((response) => {
      this.get('TranslationDeserializer').deserialize(response);
    });
    return this.get('simpleStore').find('translation');
  },
  findById(id) {
    let model = this.get('simpleStore').find('translation', id);
    model.id = id;
    PromiseMixin.xhr(TRANSLATION_URL + id + '/', 'GET').then((response) => {
      this.get('TranslationDeserializer').deserialize(response, id);
    });
    return model;
  },
});
