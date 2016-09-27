import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('event', 'automation');
    many_to_many.bind(this)('action', 'automation');
    belongs_to.bind(this)('type');
    belongs_to.bind(this)('assignee');
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
    const events = response.events;
    const actions = response.actions;
    delete response.filters;
    delete response.events;
    delete response.actions;
    response.detail = true;
    let automation = store.push('automation', response);
    const [,eventData,] = this.setup_event(events, automation);

    let actionTypes = [];
    let assignees = [];
    actions.forEach((a) => {
      // type
      const type = a.type;
      delete a.type;
      actionTypes.push(type);
      a.type_fk = type.id;
      // assignee
      if (a.assignee) {
        const assignee = a.assignee;
        delete a.assignee;
        assignees.push(assignee);
        a.assignee_fk = assignee.id;
      }
      // must set as "detail" b/c this is a detail payload
      a.detail = true;
    });
    const [actionA, actionData, actionB] = this.setup_action(actions, automation);
    actionData.forEach((ad) => {
      const action = store.find('automation-action', ad.id);
      // type
      let type;
      actionTypes.forEach((at) => {
        if (at.id === action.get('type_fk')) { type = at; }
      });
      this.setup_type(type, action);
      // assignee
      let assignee;
      assignees.forEach((a) => {
        if (a.id === action.get('assignee_fk')) { assignee = a; }
      });
      this.setup_assignee(assignee, action);
    });

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
