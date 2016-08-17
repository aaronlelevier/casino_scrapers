import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/assignment';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('assignee', 'assignment', 'person');
    many_to_many.bind(this)('pf', 'assignment');
    many_to_many.bind(this)('criteria', 'pfilter');
  },
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    response.assignee_fk = response.assignee.id;
    const assignee = response.assignee;
    // extract criteria
    let criteriaMap = {};
    for (let i in response.filters) {
      const f = response.filters[i];
      criteriaMap[f.id] = f.criteria;
      delete response.filters[i].criteria;
    }
    const filters = response.filters;
    delete response.assignee;
    delete response.filters;
    response.detail = true;
    let assignment = store.push('assignment', response);
    this.setup_assignee(assignee, assignment);
    const [,pfs,] = this.setup_pf(filters, assignment);
    pfs.forEach((pf) => {
      const criteria = criteriaMap[pf.id];
      pf = store.push('pfilter', pf);
      this.setup_criteria(criteria, pf);
    });
    assignment.save();
    return assignment;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      store.push('assignment-list', model);
    });
  }
});
