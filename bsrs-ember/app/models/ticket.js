import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
//start-non-standard
import computed from 'ember-computed-decorators';
//end-non-standard
import equal from 'bsrs-ember/utilities/equal';
import CategoriesMixin from 'bsrs-ember/mixins/model/category';
import OptConf from 'bsrs-ember/mixins/optconfigure/ticket';
import { belongs_to, change_belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, add_many_to_many, many_to_many_dirty } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import SaveAndRollbackRelatedMixin from 'bsrs-ember/mixins/model/save-and-rollback-related';

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
  }),
  status: validator('presence', {
    presence: true,
  }),
  priority: validator('presence', {
    presence: true,
  }),
  assignee: validator('ticket-status', {
    dependentKeys: ['model.status']
  }),
  categories: validator('ticket-categories'),
});

const { run, set, get } = Ember;

let TicketModel = Model.extend(CategoriesMixin, OptConf, Validations, SaveAndRollbackRelatedMixin, {
  init() {
    this._super(...arguments);
    set(this, 'requestValues', []); //store array of values to be sent in dt post or put request field
    set(this, 'ticket_cc_fks', get(this, 'ticket_cc_fks') || []);
    set(this, 'ticket_wo_fks', get(this, 'ticket_wo_fks') || []);
    set(this, 'model_categories_fks', get(this, 'model_categories_fks') || []);
    set(this, 'generic_attachments_fks', get(this, 'generic_attachments_fks') || []);
    belongs_to.bind(this)('status', 'ticket', {bootstrapped:true});
    belongs_to.bind(this)('priority', 'ticket', {bootstrapped:true});
    belongs_to.bind(this)('assignee', 'ticket');
    belongs_to.bind(this)('location', 'ticket');
    many_to_many.bind(this)('cc', 'ticket');
    many_to_many.bind(this)('wo', 'ticket', {dirty:false});
    many_to_many.bind(this)('attachment', 'generic', {plural: true});
    many_to_many.bind(this)('category', 'model', {plural:true, add_func:false});
  },
  personCurrent: Ember.inject.service('person-current'),
  isReadOnly: Ember.computed.alias('personCurrent.isReadOnlyTicket'),
  simpleStore: Ember.inject.service(),
  //TODO: test this.  Plan on using for delete modal
  displayName: 'modules.tickets.titleShort',
  number: attr(''),
  request: attr(''),
  requester: attr(''),
  comment: attr(''),
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
  woIsDirty: Ember.computed('wo.@each.{isDirtyOrRelatedDirty}', function() {
    const wos = this.get('wo');
    return wos.isAny('isDirtyOrRelatedDirty');
  }).readOnly(),

  woIsNotDirty: Ember.computed.not('woIsDirty').readOnly(),

  isDirtyOrRelatedDirty: Ember.computed.or('isDirty', 'assigneeIsDirty', 'statusIsDirty', 'priorityIsDirty', 'ccIsDirty', 'categoriesIsDirty', 'locationIsDirty', 'attachmentsIsDirty', 'woIsDirty').readOnly(),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty').readOnly(),

  /**
   * @method saveAttachmentsContainer
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
    };
    if (this.get('comment')) {
      payload.comment = get(this, 'comment');
      run(() => {
        simpleStore.push('ticket', {id: id, comment: ''});
      });
    }
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
    };
    dirtyFields.forEach((field) => {
      payload[field] = get(this, field);
    });
    return payload;
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
    this.rollbackRelatedContainer('wo');
    this.rollbackWo();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveStatus();
    this.savePriority();
    this.saveCc();
    this.saveWo();
    this.saveAssignee();
    this.saveAttachmentsContainer();
    this.saveAttachments();
    this.saveCategories();
    this.saveLocation();
  }
});

export default TicketModel;
