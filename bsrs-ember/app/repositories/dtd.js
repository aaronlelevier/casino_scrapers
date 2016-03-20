import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var DTD_URL = `${PREFIX}/dtds/`;

var DTDRepo = Ember.Object.extend(GridRepositoryMixin, {
  type: Ember.computed(function() { return 'dtd'; }),
  typeGrid: Ember.computed(function() { return 'dtd-list'; }),
  garbage_collection: Ember.computed(function() { return ['dtd-list']; }),
  url: Ember.computed(function() { return DTD_URL; }),
  uuid: injectUUID('uuid'),
  DTDDeserializer: inject('dtd'),
  deserializer: Ember.computed.alias('DTDDeserializer'),
  update(model) {
    return PromiseMixin.xhr(`${DTD_URL}${model.get('id')}/`, 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
      model.saveRelated();
    });
  },
  fetch(id) {
    return this.get('store').find('dtd', id);
  },
  findById(id) {
    let model = this.get('store').find('dtd', id);
    model.id = id;
    PromiseMixin.xhr(`${DTD_URL}${id}/`, 'GET').then((response) => {
      this.get('DTDDeserializer').deserialize(response, id);
    });
    return model;
  }
});

export default DTDRepo;
