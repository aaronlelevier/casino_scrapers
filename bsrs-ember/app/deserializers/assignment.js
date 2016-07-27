import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/assignment';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('assignee', 'assignment', 'person');
    many_to_many.bind(this)('pf', 'assignment');
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
    const filters = response.filters;
    delete response.assignee;
    delete response.filters;
    response.detail = true;
    let assignment = store.push('assignment', response);
    this.setup_assignee(assignee, assignment);
    const [,pfs,] = this.setup_pf(filters, assignment);
    pfs.forEach((pf) => {
      if (pf.criteria) {
        const criteriaIds = pf.criteria;
        delete pf.criteria;
        pf.criteria_fks = criteriaIds
      }
      store.push('assignmentfilter', pf);
    });
    // let pfsIds = pfilters.map(obj => obj.id);
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
