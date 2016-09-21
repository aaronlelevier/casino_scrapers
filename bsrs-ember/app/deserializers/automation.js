import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('event', 'automation');
    many_to_many.bind(this)('pf', 'automation');
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
    // extract criteria
    let criteriaMap = {};
    for (let i in response.filters) {
      const f = response.filters[i];
      criteriaMap[f.id] = f.criteria;
      delete response.filters[i].criteria;
    }
    const filters = response.filters;
    delete response.filters;
    const events = response.events;
    delete response.events;
    response.detail = true;
    let automation = store.push('automation', response);
    const [,eventData,] = this.setup_event(events, automation);
    const [,pfs,] = this.setup_pf(filters, automation);
    pfs.forEach((pf) => {
      const criteria = criteriaMap[pf.id];
      pf = store.push('pfilter', pf);
      this.setup_criteria(criteria, pf);
    });
    automation.save();
    return automation;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      store.push('automation-list', model);
    });
  }
});
