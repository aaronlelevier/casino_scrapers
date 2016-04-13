import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById2';

var PREFIX = config.APP.NAMESPACE;
var DTD_URL = `${PREFIX}/dtds/`;

var DTDRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, {
  type: Ember.computed(function() { return 'dtd'; }),
  typeGrid: Ember.computed(function() { return 'dtd-list'; }),
  garbage_collection: Ember.computed(function() { return ['dtd-list']; }),
  url: Ember.computed(function() { return DTD_URL; }),
  errorUrl: Ember.computed(function() { return 'dtds.dtd-error'; }),
  uuid: injectUUID('uuid'),
  DTDDeserializer: inject('dtd'),
  deserializer: Ember.computed.alias('DTDDeserializer'),
  update(model) {
    return PromiseMixin.xhr(`${DTD_URL}${model.get('id')}/`, 'PUT', {data: JSON.stringify(model.serialize())}).then((response) => {
      model.save();
      // model.saveRelated();
      this.get('deserializer').deserialize(response, response.id);
    }, (xhr) => {
      this.get('error').transToError(this.get('errorUrl'));
    });
  },
  fetch(id) {
    return this.get('store').find('dtd', id);
  },
  findDTD(search) {
    let url = DTD_URL;
    search = search ? search.trim() : search;
    if (search) {
      url += `?search=${search}`;
      return PromiseMixin.xhr(url, 'GET').then((response) => {
        return response.results.filter((dtd) => {
          return dtd.key.toLowerCase().indexOf(search.toLowerCase()) > -1;
        });
      });
    }
  }
});

export default DTDRepo;
