import Ember from 'ember';
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';

export default Ember.Object.extend({
  deserialize(response, id) {
    const store = this.get('simpleStore');
    if (id) {
      return this._deserializeSingle(store, response);
    }
    else {
      return this._deserializeList(store, response);
    }
  },
  _deserializeSingle(store, model) {
    model.assignee_fk = model.assignee.id;
    const assignee = model.assignee;
    delete model.assignee;
    const pfilters = model.filters;
    delete model.filters;
    let profile = store.push('profile', model);
    profile.change_assignee(assignee);
    let [m2m_pfs, pfs, pf_server_sum] = many_to_many_extract(pfilters, store, profile, 'pfs', 'profile_pk', 'pfilter', 'pfilter_pk');
    pfs.forEach((pf) => {
      const criteriaIds = pf.criteria;
      delete pf.criteria;
      pf.criteria_fks = criteriaIds
      store.push('pfilter', pf);
    });
    m2m_pfs.forEach((m2m) => {
      store.push('profile-join-pfilter', m2m);
    });
    let pfsIds = pfilters.map((obj) => { return obj.id; });
    profile = store.push('profile', {id: model.id, profile_pfs_fks: pfsIds});
    return profile;
  },
  _deserializeList(store, response) {
    response.results.forEach((model) => {
      store.push('profile-list', model);
    });
  }
});
