import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import { TRANSLATION_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, {
  type: 'translation',
  typeGrid: 'translation-list',
  url: TRANSLATION_URL,
  TranslationDeserializer: inject('translation'),
  deserializer: Ember.computed.alias('TranslationDeserializer'),
  insert(model) {
    return PromiseMixin.xhr(TRANSLATION_URL, 'POST', {data: JSON.stringify(model.createSerialize())}).then(() => {
      model.set('new', undefined);
      model.set('new_pk', undefined);
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
