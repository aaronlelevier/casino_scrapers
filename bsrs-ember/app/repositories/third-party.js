import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var THIRD_PARTY_URL = PREFIX + '/admin/third-parties/';

var ThirdPartyRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'third-party'; }),
    typeGrid: Ember.computed(function() { return 'third-party-list'; }),
    garbage_collection: Ember.computed(function() { return ['third-party-list']; }),
    uuid: injectUUID('uuid'),
    url: Ember.computed(function() { return THIRD_PARTY_URL; }),
    ThirdPartyDeserializer: inject('third-party'),
    deserializer: Ember.computed.alias('ThirdPartyDeserializer'),
    update(model) {
        return PromiseMixin.xhr(THIRD_PARTY_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    fetch(id) {
        return this.get('store').find('third-party', id);
    },
    findById(id) {
        let model = this.get('store').find('third-party', id);
        model.id = id;
        PromiseMixin.xhr(THIRD_PARTY_URL + id + '/', 'GET').then((response) => {
            this.get('ThirdPartyDeserializer').deserialize(response, id);
        });
        return model;
    },
});

export default ThirdPartyRepo;

