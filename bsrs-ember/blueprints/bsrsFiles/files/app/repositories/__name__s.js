import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: '<%= dasherizedModuleName %>',
  typeGrid: '<%= dasherizedModuleName %>-list',
  garbage_collection: Ember.computed(function() {
    return ['<%= dasherizedModuleName %>-list'];
  }),
  uuid: injectUUID('uuid'),
  <%= camelizedModuleName %>Deserializer: injectDeserializer('<%= dasherizedModuleName %>'),
  url: <%= CapitalizeModule %>_URL,
  deserializer: Ember.computed.alias('<%= camelizedModuleName %>Deserializer'),
  update(model) {
    let id = model.get('id');
    return PromiseMixin.xhr(`${<%= CapitalizeModule %>_URL}${id}/`, 'PUT', { data: JSON.stringify(model.serialize()) }).then(() => {
      model.save();
      model.saveRelated();
    });
  },
});
