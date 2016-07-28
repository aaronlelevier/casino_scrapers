import Ember from 'ember';
const { run } = Ember;
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: '<%= dasherizedModuleName %>',
  typeGrid: '<%= dasherizedModuleName %>-list',
  garbage_collection: ['<%= dasherizedModuleName %>-list'],
  uuid: injectUUID('uuid'),
  <%= FirstCharacterModuleName %>Deserializer: injectDeserializer('<%= dasherizedModuleName %>'),
  url: <%= CapitalizeModule %>_URL,
  deserializer: Ember.computed.alias('<%= FirstCharacterModuleName %>Deserializer'),
});
