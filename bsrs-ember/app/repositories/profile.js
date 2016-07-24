import Ember from 'ember';
const { run } = Ember;
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import { PROFILE_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'profile',
  typeGrid: 'profile-list',
  garbage_collection: ['profile-list'],
  uuid: injectUUID('uuid'),
  profileDeserializer: injectDeserializer('profile'),
  url: PROFILE_URL,
  deserializer: Ember.computed.alias('profileDeserializer'),
  update(model) {
    let id = model.get('id');
    return PromiseMixin.xhr(`${PROFILE_URL}${id}/`, 'PUT', { data: JSON.stringify(model.serialize()) }).then(() => {
      model.save();
      model.saveRelated();
    });
  },
});
