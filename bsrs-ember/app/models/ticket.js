import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';

var TicketModel = Model.extend({
    store: inject('main'),
    number: attr(''),
    subject: attr(),
    status_fk: undefined,
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
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'statusIsDirty', function() {
        return this.get('isDirty') || this.get('statusIsDirty');
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
    serialize() {
        return {
            id: this.get('id'),
            subject: this.get('subject'),
            request: this.get('request'),
            status: this.get('status.id'),
            priority: this.get('priority')
        };
    },
    removeRecord() {
        this.get('store').remove('ticket', this.get('id'));
    },
    rollbackRelated() {
        this.rollbackStatus();
    },
    saveRelated() {
        this.saveStatus();
    }
});

export default TicketModel;
