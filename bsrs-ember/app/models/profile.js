import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConfMixin from 'bsrs-ember/mixins/optconfigure/profile';
import { validator, buildValidations } from 'ember-cp-validations';
import { many_to_many } from 'bsrs-components/attr/many-to-many';

const Validations = buildValidations({
  description: [
    validator('presence', {
      presence: true,
      message: 'errors.profile.description'
    }),
    validator('length', {
      min: 5,
      max: 500,
      message: 'errors.profile.description.min_max'
    })
  ],
  assignee: [
    validator('presence', {
      presence: true,
      message: 'errors.profile.assignee'
    }),
  ],
});

export default Model.extend(OptConfMixin, Validations, {
  init() {
    belongs_to.bind(this)('assignee', 'profile');
    many_to_many.bind(this)('pf', 'profile', {plural:true});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  description: attr(''),
  defaultPfilter: {
    key: 'admin.placeholder.ticket_priority',
    context: 'ticket.ticket',
    field: 'priority'
  },
  availablePfilters: [{
    key: 'admin.placeholder.ticket_priority',
    context: 'ticket.ticket',
    field: 'priority'
  },{
    key: 'admin.placeholder.location_store',
    context: 'ticket.ticket',
    field: 'location'
  }],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'pfsIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('pfsIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackAssignee();
    this.rollbackPfs();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveAssignee();
    this.savePfs();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('profile', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      description: this.get('description'),
      assignee: this.get('assignee').get('id'),
      filters: this.get('pfs').map((obj) => { return obj.serialize(); })
    };
  },
});
