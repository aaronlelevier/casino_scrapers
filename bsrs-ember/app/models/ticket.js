import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import CcMixin from 'bsrs-ember/mixins/model/ticket/cc';
import CategoriesMixin from 'bsrs-ember/mixins/model/ticket/category';
import TicketLocationMixin from 'bsrs-ember/mixins/model/ticket/location';
import NewMixin from 'bsrs-ember/mixins/model/new';
import DateFormatMixin from 'bsrs-ember/mixins/model/date-format';

var run = Ember.run;

var TicketModel = Model.extend(NewMixin, CcMixin, CategoriesMixin, TicketLocationMixin, DateFormatMixin, {
    store: inject('main'),
    uuid: injectUUID('uuid'),
    number: attr(''),
    request: attr(''),
    requester: attr(''),
    ticket_people_fks: [],
    ticket_categories_fks: [],
    previous_attachments_fks: [],
    ticket_attachments_fks: [],
    status_fk: undefined,
    priority_fk: undefined,
    location_fk: undefined,
    assignee_fk: undefined,
    categoriesIsDirty: Ember.computed('categories.[]', 'categories_ids.[]', 'ticket_categories_fks.[]', function() {
        const categories = this.get('categories');
        const ticket_categories_ids = this.get('ticket_categories_ids');
        const previous_m2m_fks = this.get('ticket_categories_fks') || [];
        if(categories.get('length') !== previous_m2m_fks.length) {
            return equal(ticket_categories_ids, previous_m2m_fks) ? false : true;
        }
        return equal(ticket_categories_ids, previous_m2m_fks) ? false : true;
    }),
    categoriesIsNotDirty: Ember.computed.not('categoriesIsDirty'),
    ccIsDirty: Ember.computed('cc.[]', 'cc_ids.[]', 'ticket_people_fks.[]', function() {
        const cc = this.get('cc');
        const ticket_cc_ids = this.get('ticket_cc_ids');
        const previous_m2m_fks = this.get('ticket_people_fks') || [];
        if(cc.get('length') !== previous_m2m_fks.length) {
            return equal(ticket_cc_ids, previous_m2m_fks) ? false : true;
        }
        return equal(ticket_cc_ids, previous_m2m_fks) ? false : true;
    }),
    ccIsNotDirty: Ember.computed.not('ccIsDirty'),
    assignee: Ember.computed.alias('belongs_to_assignee.firstObject'),
    belongs_to_assignee: Ember.computed(function() {
        const ticket_id = this.get('id');
        const filter = function(assignee) {
            const tickets = assignee.get('assigned_tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('person', filter);
    }),
    priority: Ember.computed.alias('belongs_to_priority.firstObject'),
    belongs_to_priority: Ember.computed(function() {
        const ticket_id = this.get('id');
        const filter = function(status) {
            const tickets = status.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('ticket-priority', filter);
    }),
    status: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: Ember.computed(function() {
        const ticket_id = this.get('id');
        const filter = function(status) {
            const tickets = status.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('ticket-status', filter);
    }),
    status_class: Ember.computed('status', function(){
        const name = this.get('status.name');
        return name ? name.replace(/\./g, '-') : '';
    }),
    priority_class: Ember.computed('priority', function(){
        const name = this.get('priority.name');
        return name ? name.replace(/\./g, '-') : '';
    }),
    rollbackStatus() {
        const status = this.get('status');
        const status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
    rollbackAssignee() {
        const assignee = this.get('assignee');
        const assignee_fk = this.get('assignee_fk');
        if(assignee && assignee.get('id') !== assignee_fk) {
            this.change_assignee(assignee_fk);
        }
    },
    rollbackPriority() {
        const priority = this.get('priority');
        const priority_fk = this.get('priority_fk');
        if(priority && priority.get('id') !== priority_fk) {
            this.change_priority(priority_fk);
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
    saveStatus() {
        const store = this.get('store');
        const ticket_pk = this.get('id');
        const status = this.get('status');
        if (status) {
            run(function() {
                store.push('ticket', {id: ticket_pk, status_fk: status.get('id')});
            });
        }
    },
    saveAssignee() {
        let store = this.get('store');
        let ticket_pk = this.get('id');
        let assignee = this.get('assignee');
        if (assignee) {
            run(function() {
                store.push('ticket', {id: ticket_pk, assignee_fk: assignee.get('id')});
            });
        }
    },
    saveAttachments() {
        const store = this.get('store');
        const ticket_pk = this.get('id');
        const fks = this.get('ticket_attachments_fks');
        run(function() {
            store.push('ticket', {id: ticket_pk, previous_attachments_fks: fks});
        });
        this.get('attachments').forEach(function(attachment) {
            attachment.save();
        });
    },
    savePriority() {
        const store = this.get('store');
        const ticket_pk = this.get('id');
        const priority = this.get('priority');
        if (priority) {
            run(function() {
                store.push('ticket', {id: ticket_pk, priority_fk: priority.get('id')});
            });
        }
    },
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        const status = this.get('status');
        const status_fk = this.get('status_fk');
        if (status) {
            return status.get('id') === status_fk ? false : true;
        }
        if(!status && status_fk) {
            return true;
        }
    }),
    assigneeIsDirty: Ember.computed('assignee', 'assignee_fk', function() {
        const assignee = this.get('assignee');
        const assignee_fk = this.get('assignee_fk');
        if(assignee) {
            return assignee.get('id') === assignee_fk ? false : true;
        }
        if(!assignee && assignee_fk) {
            return true;
        }
    }),
    priorityIsDirty: Ember.computed('priority', 'priority_fk', function() {
        const priority = this.get('priority');
        const priority_fk = this.get('priority_fk');
        if (priority) {
            return priority.get('id') === priority_fk ? false : true;
        }
        //need if else rather than ternary b/c if neither priority or priority fk, then not dirty (new template)
        if(!priority && priority_fk) {
            return true;
        }
    }),
    locationIsDirty: Ember.computed('location', 'location_fk', function() {
        const location = this.get('location');
        const location_fk = this.get('location_fk');
        if (location) {
            return location.get('id') === location_fk ? false : true;
        }
        //needed when cleared out, esp if not there
        if(!location && location_fk) {
            return true;
        }
    }),
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
            const updated_old_assignee_tickets = old_assignee_tickets.filter(function(id) {
                return id !== ticket_id;
            });
            run(function() {
                store.push('person', {id: old_assignee.get('id'), assigned_tickets: updated_old_assignee_tickets});
            });
        }
    },
    change_assignee: function(new_assignee_id) {
        const ticket_id = this.get('id');
        const store = this.get('store');
        this.remove_assignee();
        const new_assignee = store.find('person', new_assignee_id);
        const new_assignee_tickets = new_assignee.get('assigned_tickets') || [];
        run(function() {
            store.push('person', {id: new_assignee.get('id'), assigned_tickets: new_assignee_tickets.concat(ticket_id)});
        });
    },
    change_priority(new_priority_id) {
        const ticket_id = this.get('id');
        const store = this.get('store');
        const old_priority = this.get('priority');
        if(old_priority) {
            const old_priority_tickets = old_priority.get('tickets') || [];
            const updated_old_priority_tickets = old_priority_tickets.filter((id) => {
                return id !== ticket_id;
            });
            run(function() {
                store.push('ticket-priority', {id: old_priority.get('id'), tickets: updated_old_priority_tickets});
            });
        }
        const new_priority = store.find('ticket-priority', new_priority_id);
        const new_priority_tickets = new_priority.get('tickets') || [];
        run(function() {
            store.push('ticket-priority', {id: new_priority.get('id'), tickets: new_priority_tickets.concat(ticket_id)});
        });
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
    change_status(new_status_id) {
        const ticket_id = this.get('id');
        const store = this.get('store');
        const old_status = this.get('status');
        if(old_status) {
            const old_status_tickets = old_status.get('tickets') || [];
            const updated_old_status_tickets = old_status_tickets.filter((id) => {
                return id !== ticket_id;
            });
            run(function() {
                store.push('ticket-status', {id: old_status.get('id'), tickets: updated_old_status_tickets});
            });
        }
        const new_status = store.find('ticket-status', new_status_id);
        const new_status_tickets = new_status.get('tickets') || [];
        if (new_status_tickets) {
            run(function() {
                store.push('ticket-status', {id: new_status.get('id'), tickets: new_status_tickets.concat(ticket_id)});
            });
        }
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
            categories: this.get('categories_ids'),
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
        return payload;
    },
    removeRecord() {
        run(() => {
            this.get('store').remove('ticket', this.get('id'));
        });
    },
    rollbackRelated() {
        this.rollbackStatus();
        this.rollbackPriority();
        this.rollbackLocation();
        this.rollbackCC();
        this.rollbackCategories();
        this.rollbackAssignee();
        this.rollbackAttachments();
    },
    saveRelated() {
        this.saveStatus();
        this.savePriority();
        this.saveLocation();
        this.saveCC();
        this.saveCategories();
        this.saveAssignee();
        this.saveAttachments();
    }
});

export default TicketModel;
