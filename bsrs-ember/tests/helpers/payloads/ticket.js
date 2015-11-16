import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';

var ticket_payload = {
    id: UUID.value,
    status: TICKET_DEFAULTS.statusOneId,
    priority: TICKET_DEFAULTS.priorityOneId,
    cc: [],
    categories: [CATEGORY_DEFAULTS.idTwo, CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.idChild],
    assignee: PEOPLE_DEFAULTS.idSearch,
    location: LOCATION_DEFAULTS.idTwo
};

var ticket_payload_detail = {
    id: TICKET_DEFAULTS.idOne,
    request: TICKET_DEFAULTS.requestOne,
    status: TICKET_DEFAULTS.statusOneId,
    priority: TICKET_DEFAULTS.priorityOneId,
    cc: [PEOPLE_DEFAULTS.idOne],
    categories: [CATEGORY_DEFAULTS.idPlumbing, CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.idPlumbingChild],
    requester: PEOPLE_DEFAULTS.idOne,
    assignee: PEOPLE_DEFAULTS.idOne,
    location: LOCATION_DEFAULTS.idOne,
};

var ticket_payload_detail_one_category = {
    id: TICKET_DEFAULTS.idOne,
    request: TICKET_DEFAULTS.requestOneGrid,
    status: TICKET_DEFAULTS.statusTwoId,
    priority: TICKET_DEFAULTS.priorityTwoId,
    cc: [PEOPLE_DEFAULTS.idOne],
    categories: [CATEGORY_DEFAULTS.idThree],
    requester: PEOPLE_DEFAULTS.idOne,
    assignee: PEOPLE_DEFAULTS.idOne,
    location: LOCATION_DEFAULTS.idOne,
};

var required_ticket_payload = Ember.$.extend(true, {}, ticket_payload);
delete required_ticket_payload.subject;

export {ticket_payload, required_ticket_payload, ticket_payload_detail, ticket_payload_detail_one_category};
