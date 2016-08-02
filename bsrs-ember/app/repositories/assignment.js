import Ember from 'ember';
const { run } = Ember;
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { ASSIGNMENT_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'assignment',
  typeGrid: 'assignment-list',
  garbage_collection: ['assignment-list'],
  uuid: injectUUID('uuid'),
  assignmentDeserializer: injectDeserializer('assignment'),
  url: ASSIGNMENT_URL,
  deserializer: Ember.computed.alias('assignmentDeserializer'),
  /* @method getFilters
  * fetch from custom endpoint to retrieve available filters (backend will filter down existing filters assigned to assignment)
  * TODO: make a custom endpoint
  */
  getFilters() {
    return PromiseMixin.xhr(`${ASSIGNMENT_URL}available_filters/`, 'GET').then(response => response);
  },
});
