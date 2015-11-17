import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';

var ticket_payload = {
    id: UUID.value,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [],
    categories: [CD.idTwo, CD.idOne, CD.idChild],
    assignee: PD.idSearch,
    location: LD.idTwo
};

var ticket_payload_detail = {
    id: TD.idOne,
    request: TD.requestOne,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [PD.idOne],
    categories: [CD.idPlumbing, CD.idOne, CD.idPlumbingChild],
    requester: PD.idOne,
    assignee: PD.idOne,
    location: LD.idOne,
};

var ticket_payload_with_comment = {
    id: TD.idOne,
    request: TD.requestOne,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [PD.idOne],
    categories: [CD.idPlumbing, CD.idOne, CD.idPlumbingChild],
    requester: PD.idOne,
    assignee: PD.idOne,
    location: LD.idOne,
    comment: TD.commentOne,
};

var ticket_payload_detail_one_category = {
    id: TD.idOne,
    request: TD.requestOneGrid,
    status: TD.statusTwoId,
    priority: TD.priorityTwoId,
    cc: [PD.idOne],
    categories: [CD.idThree],
    requester: PD.idOne,
    assignee: PD.idOne,
    location: LD.idOne,
};

var required_ticket_payload = Ember.$.extend(true, {}, ticket_payload);
delete required_ticket_payload.subject;

export {ticket_payload, ticket_payload_with_comment, required_ticket_payload, ticket_payload_detail, ticket_payload_detail_one_category};
