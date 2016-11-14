import Ember from 'ember';
const { run } = Ember;
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { PEOPLE_URL, AUTOMATION_URL, AUTOMATION_AVAILABLE_FILTERS_URL, AUTOMATION_EVENTS_URL, AUTOMATION_ACTION_TYPES_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'automation',
  typeGrid: 'automation-list',
  garbage_collection: ['automation-list'],
  uuid: injectUUID('uuid'),
  automationDeserializer: injectDeserializer('automation'),
  url: AUTOMATION_URL,
  deserializer: Ember.computed.alias('automationDeserializer'),
  /* @method getFilters
  * fetch from custom endpoint to retrieve available filters (backend will filter down existing filters assigned to automation)
  */
  getFilters() {
    return PromiseMixin.xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET').then(response => response);
  },
  getActionTypes() {
    return PromiseMixin.xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET').then(response => response);
  },
  getEvents() {
    return PromiseMixin.xhr(AUTOMATION_EVENTS_URL, 'GET').then(response => response);
  },
  getSmsRecipients(search) {
    return PromiseMixin.xhr(`${PEOPLE_URL}sms-recipients/?search=${search}`, 'GET').then(response => response.results);
  },
  getEmailRecipients(search) {
    return PromiseMixin.xhr(`${PEOPLE_URL}email-recipients/?search=${search}`, 'GET').then(response => response.results);
  }
});
