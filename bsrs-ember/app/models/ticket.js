import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
//start-non-standard
import computed from 'ember-computed-decorators';
//end-non-standard
import equal from 'bsrs-ember/utilities/equal';
import CategoriesMixin from 'bsrs-ember/mixins/model/ticket/category';
import TicketLocationMixin from 'bsrs-ember/mixins/model/ticket/location';
import NewMixin from 'bsrs-ember/mixins/model/new';
import OptConf from 'bsrs-ember/mixins/optconfigure/ticket';
import { belongs_to, change_belongs_to_fk } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';

const { run } = Ember;

var TicketModel = Model.extend(NewMixin, CategoriesMixin, TicketLocationMixin, OptConf, {
  init() {
    belongs_to.bind(this)('status', 'ticket');
    belongs_to.bind(this)('priority', 'ticket');
    belongs_to.bind(this)('assignee', 'ticket', {'change_func':true, 'rollback':true});
    belongs_to.bind(this)('location', 'ticket', {'bootstrapped':false,'change_func':true});
    many_to_many.bind(this)('cc', 'ticket');
    many_to_many.bind(this)('category', 'ticket', {plural:true, add_func:true});
    this._super(...arguments);
  },
  store: inject('main'),
  //TODO: test this.  Plan on using for delete modal
  displayName: 'modules.tickets.titleShort',
  number: attr(''),
  request: attr(''),
  requester: attr(''),
  comment: attr(''),
  //TODO: these need to be in an init function
  ticket_cc_fks: [],
  ticket_categories_fks: [],
  previous_attachments_fks: [],
  ticket_attachments_fks: [],
  status_fk: undefined,
  priority_fk: undefined,
  location_fk: undefined,
  assignee_fk: undefined,
  // categoriesIsDirty: many_to_many_dirty('ticket_categories_ids', 'ticket_categories_fks'),
  // categoriesIsNotDirty: Ember.computed.not('categoriesIsDirty'),
  // ccIsDirty: many_to_many_dirty('ticket_cc_ids', 'ticket_cc_fks'),
  // ccIsNotDirty: Ember.computed.not('ccIsDirty'),
  /*start-non-standard*/ @computed('status') /*end-non-standard*/
  status_class(status){
    const name = this.get('status.name');
    return name ? name.replace(/\./g, '-') : '';
  },
  priority_class: Ember.computed('priority', function(){
    const name = this.get('priority.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  rollbackAssignee() {
    const assignee = this.get('assignee');
    const assignee_fk = this.get('assignee_fk');
    if(assignee && assignee.get('id') !== assignee_fk) {
      const assignee_object = {id: assignee_fk};
      this.change_assignee(assignee_object);
    }
  },
  rollbackAttachments() {
    const ticket_attachments_fks = this.get('ticket_attachments_fks');
    const previous_attachments_fks = this.get('previous_attachments_fks');
    ticket_attachments_fks.forEach((id) => {
      this.remove_attachment(id);
    });
    previous_attachments_fks.forEach((id) => {
      this.add_attachment(id);
    });
  },
  saveAttachments() {
    const store = this.get('store');
    const ticket_pk = this.get('id');
    const fks = this.get('ticket_attachments_fks');
    run(function() {
      store.push('ticket', {id: ticket_pk, previous_attachments_fks: fks});
    });
    this.get('attachments').forEach((attachment) => {
      attachment.save();
    });
  },
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'statusIsDirty', 'priorityIsDirty', 'ccIsDirty', 'categoriesIsDirty', 'locationIsDirty', 'attachmentsIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('statusIsDirty') || this.get('priorityIsDirty') || this.get('ccIsDirty') || this.get('categoriesIsDirty') || this.get('locationIsDirty') || this.get('attachmentsIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  remove_assignee: function() {
    const ticket_id = this.get('id');
    const store = this.get('store');
    const old_assignee = this.get('assignee');
    if(old_assignee) {
      const old_assignee_tickets = old_assignee.get('assigned_tickets') || [];
      const updated_old_assignee_tickets = old_assignee_tickets.filter((id) => {
        return id !== ticket_id;
      });
      run(() => {
        store.push('person', {id: old_assignee.get('id'), assigned_tickets: updated_old_assignee_tickets});
      });
    }
  },
  person_status_role_setup(person_json) {
    const store = this.get('store');
    const role = store.find('role', person_json.role);
    delete person_json.role;
    person_json.role_fk = role.get('id');
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
  change_assignee_container: change_belongs_to_fk('assignee'),
  change_assignee(new_assignee) {
    this.person_status_role_setup(new_assignee);
    this.change_assignee_container(new_assignee.id);
  },
  attachmentsIsNotDirty: Ember.computed.not('attachmentsIsDirty'),
  attachmentsIsDirty: Ember.computed('attachment_ids.[]', 'previous_attachments_fks.[]', function() {
    const attachment_ids = this.get('attachment_ids') || [];
    const previous_attachments_fks = this.get('previous_attachments_fks') || [];
    if(attachment_ids.get('length') !== previous_attachments_fks.get('length')) {
      return true;
    }
    return equal(attachment_ids, previous_attachments_fks) ? false : true;
  }),
  attachments: Ember.computed('ticket_attachments_fks.[]', function() {
    const related_fks = this.get('ticket_attachments_fks');
    const filter = function(attachment) {
      return Ember.$.inArray(attachment.get('id'), related_fks) > -1;
    };
    return this.get('store').find('attachment', filter);
  }),
  attachment_ids: Ember.computed('attachments.[]', function() {
    return this.get('attachments').mapBy('id');
  }),
  remove_attachment(attachment_id) {
    const store = this.get('store');
    const attachment = store.find('attachment', attachment_id);
    attachment.set('rollback', true);
    const ticket_id = this.get('id');
    const current_fks = this.get('ticket_attachments_fks') || [];
    const updated_fks = current_fks.filter(function(id) {
      return id !== attachment_id;
    });
    run(function() {
      store.push('ticket', {id: ticket_id, ticket_attachments_fks: updated_fks});
    });
  },
  add_attachment(attachment_id) {
    const store = this.get('store');
    const attachment = store.find('attachment', attachment_id);
    attachment.set('rollback', undefined);
    const ticket_id = this.get('id');
    const current_fks = this.get('ticket_attachments_fks') || [];
    run(function() {
      store.push('ticket', {id: ticket_id, ticket_attachments_fks: current_fks.concat(attachment_id).uniq()});
    });
  },
  serialize() {
    const ticket_pk = this.get('id');
    const store = this.get('store');
    let payload = {
      id: ticket_pk,
      request: this.get('request'),
      status: this.get('status.id'),
      priority: this.get('priority.id'),
      cc: this.get('cc_ids'),
      categories: this.get('sorted_categories').mapBy('id'),
      requester: this.get('requester'),
      assignee: this.get('assignee.id'),
      location: this.get('location.id'),
      attachments: this.get('attachment_ids'),
    };
    if (this.get('comment')) {
      payload.comment = this.get('comment');
      run(function() {
        store.push('ticket', {id: ticket_pk, comment: ''});
      });
    }
    if(!this.get('created')) { this.createdAt(); }
    return payload;
  },
  createdAt() {
    const date = new Date();
    const iso = date.toISOString();
    run(() => {
      this.get('store').push('ticket', {id: this.get('id'), created: iso});
    });
  },
  removeRecord() {
    run(() => {
      this.get('store').remove('ticket', this.get('id'));
    });
  },
  rollback() {
    this.rollbackStatus();
    this.rollbackPriority();
    this.rollbackLocation();
    this.rollbackCc();
    this.rollbackCategories();
    this.rollbackAssignee();
    this.rollbackAttachments();
    this._super();
  },
  saveRelated() {
    this.saveStatus();
    this.savePriority();
    this.saveCc();
    this.saveAssignee();
    this.saveAttachments();
    this.saveCategories();
    this.saveLocation();
  },
});

export default TicketModel;
