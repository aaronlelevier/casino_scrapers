import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';

var ticket_payload = {
    id: UUID.value,
    request: TD.requestOne,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [],
    categories: [CD.idOne, CD.idTwo, CD.idChild],
    requester: TD.requesterOne,
    assignee: PD.idSearch,
    location: LD.idTwo,
    attachments: [],
};

var ticket_payload_detail_with_assignee = {
    id: TD.idOne,
    request: TD.requestOne,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [PD.idOne],
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
    assignee: PD.idBoy,
    location: LD.idOne,
    attachments: [],
};

var ticket_payload_detail = {
    id: TD.idOne,
    request: TD.requestOne,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [PD.idOne],
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
    requester: PD.nameMel,
    assignee: PD.idOne,
    location: LD.idOne,
    attachments: [],
};

var ticket_payload_with_comment = {
    id: TD.idOne,
    request: TD.requestOne,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [PD.idOne],
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
    requester: PD.nameMel,
    assignee: PD.idOne,
    location: LD.idOne,
    comment: TD.commentOne,
    attachments: [],
};

var ticket_payload_with_attachment = {
    id: TD.idOne,
    request: TD.requestOne,
    status: TD.statusOneId,
    priority: TD.priorityOneId,
    cc: [PD.idOne],
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
    requester: PD.nameMel,
    assignee: PD.idOne,
    location: LD.idOne,
    attachments: [UUID.value]
};

var ticket_payload_with_attachments = Ember.$.extend(true, {}, ticket_payload_with_attachment);
ticket_payload_with_attachments.attachments = ['abc123', 'def456'];

var ticket_payload_detail_one_category = {
    id: TD.idOne,
    request: TD.requestOneGrid,
    status: TD.statusTwoId,
    priority: TD.priorityTwoId,
    cc: [PD.idOne],
    categories: [CD.idThree],
    requester: PD.nameMel,
    assignee: PD.idOne,
    location: LD.idOne,
    attachments: [],
};

var ticket_dt_new_payload = {
    id: 1,
    status: TD.statusZeroId,
    priority: TD.priorityZeroId,
    cc: [],
    categories: [],
    requester: TD.requesterOne,
    location: LD.idThree,
    attachments: []
};

var ticket_dt_new_payload_PATCH = Ember.$.extend(true, {}, ticket_dt_new_payload);
ticket_dt_new_payload_PATCH.status = TD.statusOneId;

var required_ticket_payload = Ember.$.extend(true, {}, ticket_payload);
delete required_ticket_payload.subject;

export {ticket_payload, ticket_payload_with_comment, required_ticket_payload, ticket_payload_detail_with_assignee, ticket_payload_detail, ticket_payload_detail_one_category, ticket_payload_with_attachment, ticket_payload_with_attachments, ticket_dt_new_payload, ticket_dt_new_payload_PATCH};
