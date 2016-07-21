import Ember from 'ember';
const { run } = Ember;
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';

export default Ember.Object.extend({
  deserialize(response, id) {
    const store = this.get('simpleStore');
    if (id) {
      return this._deserializeSingle(store, response, id);
    }
    else {
      return this._deserializeList(store, response);
    }
  },
  _deserializeSingle(store, model, id) {
    const existingModel = store.find('profile', id);
    let profile = existingModel;
    model.assignee_fk = model.assignee.id;
    const assignee = model.assignee;
    delete model.assignee;
    const pfilters = model.filters;
    delete model.filters;
    profile = store.push('profile', model);
    profile.change_assignee(assignee);
    let [m2m_pfs, pfs, pf_server_sum] = many_to_many_extract(pfilters, store, profile, 'profile_pfs', 'profile_pk', 'pfilter', 'pfilter_pk');
    pfs.forEach((pf) => {
      if (pf.criteria) {
        const criteriaIds = pf.criteria;
        delete pf.criteria;
        pf.criteria_fks = criteriaIds
      }
      store.push('pfilter', pf);
    });
    m2m_pfs.forEach((m2m) => {
      store.push('profile-join-pfilter', m2m);
    });
    let pfsIds = pfilters.map((obj) => {
      return obj.id;
    });
    run(() => {
      profile = store.push('profile', {
        id: model.id,
        profile_pfs_fks: pf_server_sum
      });
      profile.save();
    });
    return profile;
  },
  _deserializeList(store, response) {
    response.results.forEach((model) => {
      store.push('profile-list', model);
    });
  }
});