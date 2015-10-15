import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';

var TicketModel = Model.extend({
    store: inject('main'),
    uuid: injectUUID('uuid'),
    number: attr(''),
    subject: attr(''),
    ticket_people_fks: [],
    status_fk: undefined,
    cc_ids: Ember.computed('cc.[]', function() {
        return this.get('cc').map((cc) => {
            return cc.get('id');
        });
    }),
    cc: Ember.computed('ticket_cc.[]', function() {
        let store = this.get('store');
        let ticket_cc = this.get('ticket_cc');
        let filter = function(person) {
            let person_pks = this.map(function(join_model) {
                return join_model.get('person_pk');
            });
            return Ember.$.inArray(person.get('id'), person_pks) > -1;
        };
        return store.find('person', filter.bind(ticket_cc), ['id']);
    }),
    ticket_cc_ids: Ember.computed('ticket_cc.[]', function() {
        return this.get('ticket_cc').map((cc) => {
            return cc.get('id');
        }); 
    }),
    ticket_cc: Ember.computed(function() {
        let store = this.get('store');
        let filter = function(join_model) {
            return join_model.get('ticket_pk') === this.get('id') && !join_model.get('removed');
        };
        return store.find('ticket-person', filter.bind(this), ['removed']);
    }),
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
    add_person(person_pk) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        store.push('ticket-person', {id: uuid.v4(), ticket_pk: this.get('id'), person_pk: person_pk});
    },
    remove_person(person_pk) {
        let store = this.get('store');
        let m2m_pk = this.get('ticket_cc').filter((m2m) => {
            return m2m.get('person_pk') === person_pk;
        }).objectAt(0).get('id');
        store.push('ticket-person', {id: m2m_pk, removed: true});
    },
    priority: Ember.computed('belongs_to_priority.[]', function() {
        let belongs_to_priority = this.get('belongs_to_priority');
        return belongs_to_priority.objectAt(0);
    }),
    belongs_to_priority: Ember.computed(function() {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let filter = function(status) {
            let tickets = status.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return store.find('ticket-priority', filter, ['tickets']);
    }),
    status: Ember.computed('belongs_to.[]', function() {
        let belongs_to = this.get('belongs_to');
        return belongs_to.objectAt(0);
    }),
    belongs_to: Ember.computed(function() {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let filter = function(status) {
            let tickets = status.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return store.find('ticket-status', filter, ['tickets']);
    }),
    rollbackStatus() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
    rollbackCC() {
        let store = this.get('store');
        let previous_m2m_fks = this.get('ticket_people_fks') || [];

        let m2m_to_throw_out = store.find('ticket-person', function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        }, ['removed']);

        m2m_to_throw_out.forEach(function(join_model) {
            join_model.set('removed', true);
        });

        previous_m2m_fks.forEach(function(pk) {
            var m2m_to_keep = store.find('ticket-person', pk);
            if (m2m_to_keep.get('id')) {
                m2m_to_keep.set('removed', undefined);
            }
        });
    },
    saveCC() {
        let ticket_cc = this.get('ticket_cc');
        let ticket_cc_ids = this.get('ticket_cc_ids') || [];
        let previous_m2m_fks = this.get('ticket_people_fks') || [];
        ticket_cc.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        previous_m2m_fks.forEach((fk) => {
            if (Ember.$.inArray(fk, ticket_cc_ids) === -1) {
                previous_m2m_fks.removeObject(fk);
            } 
        });
    },
    saveStatus() {
        let status = this.get('status');
        if (status) { this.set('status_fk', status.get('id')); }
    },
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if (status) {
            return status.get('id') === status_fk ? status.get('isDirty') : true;
        }
        return status_fk ? true : false;
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'statusIsDirty', 'ccIsDirty', function() {
        return this.get('isDirty') || this.get('statusIsDirty') || this.get('ccIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    change_status: function(new_status_id) {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_status = this.get('status');
        if(old_status) {
            let old_status_tickets = old_status.get('tickets') || [];
            let updated_old_status_tickets = old_status_tickets.filter(function(id) {
                return id !== ticket_id;
            });
            old_status.set('tickets', updated_old_status_tickets);
        }
        let new_status = store.find('ticket-status', new_status_id);
        let new_status_tickets = new_status.get('tickets') || [];
        new_status.set('tickets', new_status_tickets.concat(ticket_id));
    },
    change_priority: function(new_priority_id) {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_priority = this.get('priority');
        if(old_priority) {
            let old_priority_tickets = old_priority.get('tickets') || [];
            let updated_old_priority_tickets = old_priority_tickets.filter(function(id) {
                return id !== ticket_id;
            });
            old_priority.set('tickets', updated_old_priority_tickets);
        }
        let new_priority = store.find('ticket-priority', new_priority_id);
        let new_priority_tickets = new_priority.get('tickets') || [];
        new_priority.set('tickets', new_priority_tickets.concat(ticket_id));
    },
    serialize() {
        return {
            id: this.get('id'),
            subject: this.get('subject'),
            request: this.get('request'),
            status: this.get('status.id'),
            priority: this.get('priority.id'),
            cc: this.get('cc_ids')
        };
    },
    removeRecord() {
        this.get('store').remove('ticket', this.get('id'));
    },
    rollbackRelated() {
        this.rollbackStatus();
        this.rollbackCC();
    },
    saveRelated() {
        this.saveStatus();
        this.saveCC();
    }
});

export default TicketModel;
