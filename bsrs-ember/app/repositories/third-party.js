import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var THIRD_PARTY_URL = PREFIX + '/admin/third-parties/';

var ThirdPartyRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'third-party'; }),
    url: Ember.computed(function() { return THIRD_PARTY_URL; }),
    ThirdPartyDeserializer: inject('third-party'),
    deserializer: Ember.computed.alias('ThirdPartyDeserializer'),
    insert(model) {
        return PromiseMixin.xhr(THIRD_PARTY_URL, 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    update(model) {
        return PromiseMixin.xhr(THIRD_PARTY_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    // peek(filter, computed_keys) {
    //     return this.get('store').find('third-party', filter, computed_keys);
    // },
    find() {
        PromiseMixin.xhr(THIRD_PARTY_URL, 'GET').then((response) => {
            this.get('ThirdPartyDeserializer').deserialize(response);
        });
        return this.get('store').find('third-party');
    },
    findById(id) {
        let model = this.get('store').find('third-party', id);
        model.id = id;
        PromiseMixin.xhr(THIRD_PARTY_URL + id + '/', 'GET').then((response) => {
            this.get('ThirdPartyDeserializer').deserialize(response, id);
        });
        return model;
    },
    delete(id) {
        PromiseMixin.xhr(THIRD_PARTY_URL + id + '/', 'DELETE');
        this.get('store').remove('third-party', id);
    }
});

export default ThirdPartyRepo;

