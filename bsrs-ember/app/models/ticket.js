import Ember from 'ember';
const { get } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
//start-non-standard
import computed from 'ember-computed-decorators';
//end-non-standard
import equal from 'bsrs-ember/utilities/equal';
import CategoriesMixin from 'bsrs-ember/mixins/model/category';
import TicketLocationMixin from 'bsrs-ember/mixins/model/ticket/location';
import OptConf from 'bsrs-ember/mixins/optconfigure/ticket';
import { belongs_to, change_belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  request: [
    validator('presence', {
      presence: true,
      message: 'errors.ticket.request'
    }),
    validator('length', {
      min: 5,
      message: 'errors.ticket.request.length',
    }),
  ],
  requester: validator('presence', {
    presence: true,
    message: 'errors.ticket.requester'
  }),
  location: validator('presence', {
    presence: true,
    message: 'errors.ticket.location'
  }),
  status: validator('presence', {
    presence: true,
    message: 'errors.ticket.status'
  }),
  priority: validator('presence', {
    presence: true,
    message: 'errors.ticket.priority'
  }),
  assignee: validator('ticket-status', {
    dependentKeys: ['model.status']
  }),
  categories: validator('ticket-categories'),
});

const { run } = Ember;

var TicketModel = Model.extend(CategoriesMixin, TicketLocationMixin, OptConf, Validations, {
  init() {
    this.requestValues = []; //store array of values to be sent in dt post or put request field
    belongs_to.bind(this)('status', 'ticket', {bootstrapped:true});
    belongs_to.bind(this)('priority', 'ticket', {bootstrapped:true});
    belongs_to.bind(this)('assignee', 'ticket', {change_func:false, rollback:false});//change_assignee_container (below): change_belongs_to
    belongs_to.bind(this)('location', 'ticket', {change_func:false});
    many_to_many.bind(this)('cc', 'ticket');
    many_to_many.bind(this)('attachment', 'generic', {plural: true});
    many_to_many.bind(this)('category', 'model', {plural:true, add_func:false});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  //TODO: test this.  Plan on using for delete modal
  displayName: 'modules.tickets.titleShort',
  number: attr(''),
  request: attr(''),
  requester: attr(''),
  comment: attr(''),
  //TODO: these need to be in an init function
  ticket_cc_fks: [],
  model_categories_fks: [],
  generic_attachments_fks: [],
  status_fk: undefined,
  priority_fk: undefined,
  location_fk: undefined,
  assignee_fk: undefined,
  dtd_fk: undefined,
  /*start-non-standard*/ @computed('status') /*end-non-standard*/
  status_class(status){
    const name = get(this, 'status.name');
    return name ? name.replace(/\./g, '-') : '';
  },
  priority_class: Ember.computed('priority', function(){
    const name = get(this, 'priority.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  rollbackAssignee() {
    const { assignee, assignee_fk } = this.getProperties('assignee', 'assignee_fk');
    if(assignee && get(assignee, 'id') !== assignee_fk) {
      const assignee_object = {id: assignee_fk};
      this.change_assignee(assignee_object);
    }
  },
  isDirtyOrRelatedDirty: Ember.computed.or('isDirty', 'assigneeIsDirty', 'statusIsDirty', 'priorityIsDirty', 'ccIsDirty', 'categoriesIsDirty', 'locationIsDirty', 'attachmentsIsDirty').readOnly(), 
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty').readOnly(),
  remove_assignee: function() {
    const ticket_id = get(this, 'id');
    const store = get(this, 'simpleStore');
    const old_assignee = get(this, 'assignee');
    if(old_assignee) {
      const old_assignee_tickets = get(old_assignee, 'assigned_tickets') || [];
      const updated_old_assignee_tickets = old_assignee_tickets.filter((id) => {
        return id !== ticket_id;
      });
      run(() => {
        store.push('person', {id: get(old_assignee, 'id'), assigned_tickets: updated_old_assignee_tickets});
      });
    }
  },
  person_status_role_setup(person_json) {
    const store = get(this, 'simpleStore');
    const role = store.find('role', person_json.role);
    delete person_json.role;
    person_json.role_fk = get(role, 'id');
    person_json.status_fk = person_json.status;
    delete person_json.status;
    let pushed_person;
    run(() => {
      pushed_person = store.push('person', person_json);
    });
    pushed_person.change_role(role);
    pushed_person.change_status(person_json.status_fk);
    return pushed_person;
  },
  change_assignee_container: change_belongs_to('assignee'),
  change_assignee(new_assignee) {
    this.person_status_role_setup(new_assignee);
    this.change_assignee_container(new_assignee.id);
  },
  /* @method saveAttachmentsContainer
   * sets new flag so template can render differently for the attachment
   */
  saveAttachmentsContainer() {
    this.get('attachments').forEach((att) => {
      att.save();
    });
  },
  serialize() {
    const { id, simpleStore } = this.getProperties('id', 'simpleStore');
    let payload = {
      id: id,
      request: get(this, 'request'),
      status: get(this, 'status.id'),
      priority: this.get('priority.id'),
      cc: get(this, 'cc_ids'),
      categories: get(this, 'sorted_categories').mapBy('id'),
      requester: get(this, 'requester'),
      assignee: get(this, 'assignee.id'),
      location: get(this, 'location.id'),
      attachments: get(this, 'attachments_ids'),
      dt_path: get(this, 'dt_path'),
    };
    if (this.get('comment')) {
      payload.comment = get(this, 'comment');
      run(() => {
        simpleStore.push('ticket', {id: id, comment: ''});
      });
    }
    if(!get(this, 'created')) { this.createdAt(); }
    return payload;
  },
  patchFields: ['request'],
  patchSerialize(link) {
    const dirtyFields = get(this, 'patchFields').map((field) => {
      const state = get(this, '_oldState');
      if(field in state) {
        return field;
      }
    });
    let payload = {
      id: get(this, 'id'),
      priority: link && get(link, 'priority.id'),
      status: link && get(link, 'status.id'),
      categories: link && get(link, 'sorted_categories').mapBy('id'),
      dt_path: get(this, 'dt_path')
    };
    dirtyFields.forEach((field) => {
      payload[field] = get(this, field);
    });
    return payload;
  },
  createdAt() {
    const date = new Date();
    const iso = date.toISOString();
    run(() => {
      get(this, 'simpleStore').push('ticket', {id: get(this, 'id'), created: iso});
    });
  },
  removeRecord() {
    run(() => {
      get(this, 'simpleStore').remove('ticket', get(this, 'id'));
    });
  },
  /* @method rollbackAttachmentsContainer
   * sets attachment fks to be removed in transitionCB from route
   */ 
  rollbackAttachmentsContainer() {
    const store = this.get('simpleStore');
    const attachment_ids = this.get('attachments_ids');
    const previous_attachment_fks = this.get('generic_attachments_fks').map((m2m_fk) => {
      const m2m = store.find('generic-join-attachment', m2m_fk);
      return m2m.get('attachment_pk');
    });
    const remove_attachment_ids = attachment_ids.filter(id => !previous_attachment_fks.includes(id));
    remove_attachment_ids.forEach((attachment_id) => store.remove('attachment', attachment_id));
    store.push('ticket', {id: this.get('id'), remove_attachment_ids: remove_attachment_ids});
  },
  rollback() {
    this.rollbackStatus();
    this.rollbackPriority();
    this.rollbackLocation();
    this.rollbackCc();
    this.rollbackCategories();
    this.rollbackAssignee();
    this.rollbackAttachmentsContainer();
    this.rollbackAttachments();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveStatus();
    this.savePriority();
    this.saveCc();
    this.saveAssignee();
    this.saveAttachmentsContainer();
    this.saveAttachments();
    this.saveCategories();
    this.saveLocation();
  },
});

export default TicketModel;
