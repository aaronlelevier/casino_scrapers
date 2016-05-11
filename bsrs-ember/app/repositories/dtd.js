import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';

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
  ticketDeserializer: inject('ticket'),
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
    return this.get('simpleStore').find('dtd', id);
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
  },
  getStart() {
    return PromiseMixin.xhr(`${PREFIX}/dt/dt-start/`, 'GET');
  },
  deepLinkDT(dt_id, ticket_id) {
    return PromiseMixin.xhr(`${PREFIX}/dt/${dt_id}/ticket/?ticket=${ticket_id}`, 'GET').then((response) => {
      const { dtd: model, ticket } = response;
      return {
        model: this.get('deserializer').deserialize(model, dt_id),
        ticket: this.get('simpleStore').push('ticket', {id: ticket_id, dt_path: ticket.dt_path})
      };
    }, (xhr) => {
      if(xhr.status === 400 || xhr.status === 404){
        const err = xhr.responseJSON;
        const key = Object.keys(err);
        return Ember.RSVP.Promise.reject(err[key[0]]);
      } 
    });
  }
});

export default DTDRepo;
