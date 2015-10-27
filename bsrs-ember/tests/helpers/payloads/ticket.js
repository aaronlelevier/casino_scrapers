import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

var ticket_payload = {
    id: UUID.value,
    subject: TICKET_DEFAULTS.subjectOne,
    status: TICKET_DEFAULTS.statusOneId,
    priority: TICKET_DEFAULTS.priorityOneId,
    cc: [],
    categories: [],
    assignee: PEOPLE_DEFAULTS.idSearch,
    location: LOCATION_DEFAULTS.idTwo
};

var required_ticket_payload = Ember.$.extend(true, {}, ticket_payload);
delete required_ticket_payload.subject;

export {ticket_payload, required_ticket_payload};
