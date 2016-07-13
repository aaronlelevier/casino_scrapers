import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import { DTD_URL, DT_URL } from 'bsrs-ember/utilities/urls';

var DTDRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'dtd',
  typeGrid: 'dtd-list',
  garbage_collection: Ember.computed(function() { return ['dtd-list']; }),
  url: DTD_URL,
  errorUrl: 'dtds.dtd-error',
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
        return response.results;
      });
    }
  },
  /*
   * @method getStart
   * called from dt/new/controller
   */
  getStart() {
    return PromiseMixin.xhr(`${DT_URL}dt-start/`, 'GET');
  },
  /*
   * @method deepLinkDT
   * when click continue from ticket route or get link to continue DT
   * if deep link, ticket needs to be full object and deserialized to setup relationships in order for dt-munge to work
   */
  deepLinkDT(dt_id, ticket_id) {
    return PromiseMixin.xhr(`${DT_URL}${dt_id}/ticket/?ticket=${ticket_id}`, 'GET').then((response) => {
      const { dtd: model, ticket } = response;
      this.get('simpleStore').push('ticket', {id: ticket_id});
      return {
        model: this.get('deserializer').deserialize(model, dt_id),
        ticket: this.get('ticketDeserializer').deserialize(ticket, ticket.id),
      };
    }, (xhr) => {
      //TODO: need to test this and extract error handling to util function
      if(xhr.status === 400 || xhr.status === 404){
        const err = xhr.responseJSON;
        const key = Object.keys(err);
        return Ember.RSVP.Promise.reject(err[key[0]]);
      }
    });
  }
});

export default DTDRepo;
