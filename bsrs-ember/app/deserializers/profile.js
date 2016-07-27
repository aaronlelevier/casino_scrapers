import Ember from 'ember';
const { run } = Ember;
import OptConf from 'bsrs-ember/mixins/optconfigure/profile';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('assignee', 'profile', 'person');
    many_to_many.bind(this)('pf', 'profile', {plural:true});
  },
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
    model.detail = true;
    profile = store.push('profile', model);
    this.setup_assignee(assignee, profile);
    const [,pfs,] = this.setup_pfs(pfilters, profile);
    pfs.forEach((pf) => {
      if (pf.criteria) {
        const criteriaIds = pf.criteria;
        delete pf.criteria;
        pf.criteria_fks = criteriaIds
      }
      store.push('pfilter', pf);
    });
    let pfsIds = pfilters.map(obj => obj.id);
    profile.save();
    return profile;
  },
  _deserializeList(store, response) {
    response.results.forEach((model) => {
      store.push('profile-list', model);
    });
  }
});
