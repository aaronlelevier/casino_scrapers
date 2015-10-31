import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import CcMixin from 'bsrs-ember/mixins/model/ticket/cc';
import CategoriesMixin from 'bsrs-ember/mixins/model/ticket/category';
import RequesterMixin from 'bsrs-ember/mixins/model/ticket/requester';
import TicketLocationMixin from 'bsrs-ember/mixins/model/ticket/location';

var TicketModel = Model.extend(CcMixin, CategoriesMixin, RequesterMixin, TicketLocationMixin, {
    store: inject('main'),
    uuid: injectUUID('uuid'),
    number: attr(''),
    requester_id: attr(),
    ticket_people_fks: [],
    ticket_categories_fks: [],
    status_fk: undefined,
    priority_fk: undefined,
    location_fk: undefined,
    assignee_fk: undefined,
    categoriesIsDirty: Ember.computed('categories.[]', 'categories_ids.[]', 'ticket_categories_fks.[]', function() {
        let categories = this.get('categories');
        let ticket_categories_ids = this.get('ticket_categories_ids');
        let previous_m2m_fks = this.get('ticket_categories_fks') || [];
        if(categories.get('length') !== previous_m2m_fks.length) {
            return equal(ticket_categories_ids, previous_m2m_fks) ? false : true;
        }
        return equal(ticket_categories_ids, previous_m2m_fks) ? false : true;
    }),
    categoriesIsNotDirty: Ember.computed.not('categoriesIsDirty'),
    ccIsDirty: Ember.computed('cc.[]', 'cc_ids.[]', 'ticket_people_fks.[]', function() {
        let cc = this.get('cc');
        let ticket_cc_ids = this.get('ticket_cc_ids');
        let previous_m2m_fks = this.get('ticket_people_fks') || [];
        if(cc.get('length') !== previous_m2m_fks.length) {
            return equal(ticket_cc_ids, previous_m2m_fks) ? false : true;
        }
        return equal(ticket_cc_ids, previous_m2m_fks) ? false : true;
    }),
    ccIsNotDirty: Ember.computed.not('ccIsDirty'),
    assignee: Ember.computed('belongs_to_assignee.[]', function() {
        let belongs_to_assignee = this.get('belongs_to_assignee');
        return belongs_to_assignee.objectAt(0);
    }),
    belongs_to_assignee: Ember.computed(function() {
        let ticket_id = this.get('id');
        let filter = function(assignee) {
            let tickets = assignee.get('assigned_tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('person', filter, ['assigned_tickets']);
    }),
    priority: Ember.computed('belongs_to_priority.[]', function() {
        let belongs_to_priority = this.get('belongs_to_priority');
        return belongs_to_priority.objectAt(0);
    }),
    belongs_to_priority: Ember.computed(function() {
        let ticket_id = this.get('id');
        let filter = function(status) {
            let tickets = status.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('ticket-priority', filter, ['tickets']);
    }),
    status: Ember.computed('belongs_to.[]', function() {
        let belongs_to = this.get('belongs_to');
        return belongs_to.objectAt(0);
    }),
    belongs_to: Ember.computed(function() {
        let ticket_id = this.get('id');
        let filter = function(status) {
            let tickets = status.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('ticket-status', filter, ['tickets']);
    }),
    rollbackStatus() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
    rollbackAssignee() {
        let assignee = this.get('assignee');
        let assignee_fk = this.get('assignee_fk');
        if(assignee && assignee.get('id') !== assignee_fk) {
            this.change_assignee(assignee_fk);
        }else if(!assignee) {
            this.remove_assignee(assignee_fk);
        }
    },
    rollbackPriority() {
        let priority = this.get('priority');
        let priority_fk = this.get('priority_fk');
        if(priority && priority.get('id') !== priority_fk) {
            this.change_priority(priority_fk);
        }else if(!priority){
            this.remove_priority(priority_fk);
        }
    },
    saveStatus() {
        let status = this.get('status');
        if (status) { this.set('status_fk', status.get('id')); }
    },
    saveAssignee() {
        let assignee = this.get('assignee');
        if (assignee) { this.set('assignee_fk', assignee.get('id')); }
    },
    savePriority() {
        let priority = this.get('priority');
        if (priority) { this.set('priority_fk', priority.get('id')); }
    },
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if (status) {
            return status.get('id') === status_fk ? false : true;
        }
        if(!status && status_fk) {
            return true;
        }
        return false;
    }),
    assigneeIsDirty: Ember.computed('assignee', 'assignee_fk', function() {
        let assignee = this.get('assignee');
        let assignee_fk = this.get('assignee_fk');
        if(assignee) {
            return assignee.get('id') === assignee_fk ? false : true;
        }
        if(!assignee && assignee_fk) {
            return true;
        }
        return false;
    }),
    priorityIsDirty: Ember.computed('priority', 'priority_fk', function() {
        let priority = this.get('priority');
        let priority_fk = this.get('priority_fk');
        if (priority) {
            return priority.get('id') === priority_fk ? false : true;
        }
        //need if else rather than ternary b/c if neither priority or priority fk, then not dirty (new template)
        if(!priority && priority_fk) {
            return true;
        }
        return false;
    }),
    locationIsDirty: Ember.computed('location', 'location_fk', function() {
        let location = this.get('location');
        let location_fk = this.get('location_fk');
        if (location) {
            return location.get('id') === location_fk ? false : true;
        }
        //needed when cleared out, esp if not there
        if(!location && location_fk) {
            return true;
        }
        return false;
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'statusIsDirty', 'priorityIsDirty', 'ccIsDirty', 'categoriesIsDirty', 'requesterIsDirty', 'locationIsDirty', function() {
        return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('statusIsDirty') || this.get('priorityIsDirty') || this.get('ccIsDirty') || this.get('categoriesIsDirty') || this.get('requesterIsDirty') || this.get('locationIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    remove_assignee: function() {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_assignee = this.get('assignee');
        if(old_assignee) {
            let old_assignee_tickets = old_assignee.get('assigned_tickets') || [];
            let updated_old_assignee_tickets = old_assignee_tickets.filter(function(id) {
                return id !== ticket_id;
            });
            old_assignee.set('assigned_tickets', updated_old_assignee_tickets);
        }
    },
    change_assignee: function(new_assignee_id) {
        let ticket_id = this.get('id');
        let store = this.get('store');
        this.remove_assignee();
        let new_assignee = store.find('person', new_assignee_id);
        let new_assignee_tickets = new_assignee.get('assigned_tickets') || [];
        new_assignee.set('assigned_tickets', new_assignee_tickets.concat(ticket_id));
    },
    remove_priority() {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_priority = this.get('priority');
        if(old_priority) {
            let old_priority_tickets = old_priority.get('tickets') || [];
            let updated_old_priority_tickets = old_priority_tickets.filter((id) => {
                return id !== ticket_id;
            });
            old_priority.set('tickets', updated_old_priority_tickets);
        }
    },
    change_priority(new_priority_id) {
        let ticket_id = this.get('id');
        let store = this.get('store');
        this.remove_priority();
        let new_priority = store.find('ticket-priority', new_priority_id);
        let new_priority_tickets = new_priority.get('tickets') || [];
        new_priority.set('tickets', new_priority_tickets.concat(ticket_id));
    },
    remove_status() {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_status = this.get('status');
        if(old_status) {
            let old_status_tickets = old_status.get('tickets') || [];
            let updated_old_status_tickets = old_status_tickets.filter((id) => {
                return id !== ticket_id;
            });
            old_status.set('tickets', updated_old_status_tickets);
        }
    },
    change_status(new_status_id) {
        let ticket_id = this.get('id');
        let store = this.get('store');
        this.remove_status();
        let new_status = store.find('ticket-status', new_status_id);
        let new_status_tickets = new_status.get('tickets') || [];
        if (new_status_tickets) {
            new_status.set('tickets', new_status_tickets.concat(ticket_id));
        }
    },
    serialize() {
        return {
            id: this.get('id'),
            request: this.get('request'),
            status: this.get('status.id'),
            priority: this.get('priority.id'),
            cc: this.get('cc_ids'),
            categories: this.get('categories_ids'),
            requester: this.get('requester_id'),
            assignee: this.get('assignee.id'),
            location: this.get('location.id')
        };
    },
    removeRecord() {
        this.get('store').remove('ticket', this.get('id'));
    },
    rollbackRelated() {
        this.rollbackStatus();
        this.rollbackPriority();
        this.rollbackLocation();
        this.rollbackCC();
        this.rollbackCategories();
        this.rollbackAssignee();
    },
    saveRelated() {
        this.saveStatus();
        this.savePriority();
        this.saveLocation();
        this.saveCC();
        this.saveCategories();
        this.saveAssignee();
    }
});

export default TicketModel;
