import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

var ticket_payload = {
    id: UUID.value,
    subject: TICKET_DEFAULTS.subjectOne,
    status: TICKET_DEFAULTS.statusOneId,
    cc: []
};

var required_ticket_payload = Ember.$.extend(true, {}, ticket_payload);
delete required_ticket_payload.subject;

export {ticket_payload, required_ticket_payload};
