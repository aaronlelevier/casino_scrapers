import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
const TRANSLATION_URL = PREFIX + '/admin/translations/';

export default Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'translation'; }),
    url: Ember.computed(function() { return TRANSLATION_URL; }),
    TranslationDeserializer: inject('translation'),
    deserializer: Ember.computed.alias('TranslationDeserializer'),
    insert(model) {
        return PromiseMixin.xhr(TRANSLATION_URL, 'POST', {data: JSON.stringify(model.createSerialize())}).then(() => {
            model.save();
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
        return this.get('store').find('translation');
    },
    findById(id) {
        let model = this.get('store').find('translation', id);
        model.id = id;
        PromiseMixin.xhr(TRANSLATION_URL + id + '/', 'GET').then((response) => {
            this.get('TranslationDeserializer').deserialize(response, id);
        });
        return model;
    },
    delete(id) {
        PromiseMixin.xhr(TRANSLATION_URL + id + '/', 'DELETE');
        this.get('store').remove('translation', id);
    }
});
