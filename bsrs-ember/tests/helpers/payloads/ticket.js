import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';

const PD = PERSON_DEFAULTS.defaults();

let ticket_payload_base = {
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
    dt_path: [{
      ticket: {
        id: TD.idOne,
        requester: '',
        location: TD.locationOneId,
        status: TD.statusOneId,
        priority: TD.priorityOneId,
        request: ["label: wat", "label: foo"],
        categories: [CD.idOne, CD.idTwo],
        cc: [],
        attachments: [],
      },
      dtd: {
        id: DTD.idOne,
        description: DTD.descriptionOne,
        prompt: DTD.promptOne,
        note: DTD.noteOne,
      }
    }, {
      ticket: {
        id: TD.idTwo,
        requester: '',
        location: TD.locationOneId,
        status: TD.statusOneId,
        priority: TD.priorityOneId,
        request: ["label: wat", "label: foo"],
        categories: [CD.idOne, CD.idTwo],
        cc: [],
        attachments: [],
      },
      dtd: {
        id: DTD.idTwo,
        description: DTD.descriptionTwo,
        prompt: DTD.promptOne,
        note: DTD.noteOne,
      }
    }],
};

let ticket_payload = Ember.$.extend(true, {}, ticket_payload_base);

let ticket_payload_detail_with_assignee = Ember.$.extend(true, {}, ticket_payload);
ticket_payload_detail_with_assignee.id = TD.idOne;
ticket_payload_detail_with_assignee.cc = [PD.idOne];
ticket_payload_detail_with_assignee.categories = [CD.idOne, CD.idPlumbing, CD.idPlumbingChild];
ticket_payload_detail_with_assignee.assignee = PD.idBoy;
ticket_payload_detail_with_assignee.location = LD.idOne;

let ticket_payload_detail = Ember.$.extend(true, {}, ticket_payload_detail_with_assignee);
ticket_payload_detail.assignee = PD.idOne;
ticket_payload_detail.requester = PD.nameMel;

let ticket_payload_with_comment = Ember.$.extend(true, {}, ticket_payload_detail);
ticket_payload_with_comment.comment = TD.commentOne;

let ticket_payload_with_attachment = Ember.$.extend(true, {}, ticket_payload_detail);
ticket_payload_with_attachment.attachments = [UUID.value];

let ticket_payload_with_attachments = Ember.$.extend(true, {}, ticket_payload_with_attachment);
ticket_payload_with_attachments.attachments = ['abc123', 'def456'];

let ticket_payload_detail_one_category = Ember.$.extend(true, {}, ticket_payload_detail);
ticket_payload_detail_one_category.request = TD.requestOneGrid;
ticket_payload_detail_one_category.status = TD.statusTwoId;
ticket_payload_detail_one_category.priority = TD.priorityTwoId;
ticket_payload_detail_one_category.categories = [CD.idThree];

let ticket_dt_new_payload = {
    id: 1,
    request: "name: yes",
    status: TD.statusZeroId,
    priority: TD.priorityZeroId,
    cc: [],
    categories: [],
    requester: TD.requesterOne,
    location: LD.idThree,
    attachments: [],
    dt_path: [{
      ticket: {
        id: 1,
        requester: TD.requesterOne,
        location: LD.idThree,
        status: TD.statusZeroId,
        priority: TD.priorityZeroId,
        request: "name: yes",
        categories: [],
        cc: [],
        attachments: [],
      },
      dtd: {
        id: DTD.idOne,
        description: DTD.descriptionOne,
        prompt: DTD.promptOne,
        note: DTD.noteOne,
      }
    }],
};

let ticket_dt_new_payload_PATCH = Ember.$.extend(true, {}, ticket_dt_new_payload);
ticket_dt_new_payload_PATCH.status = TD.statusOneId;

let required_ticket_payload = Ember.$.extend(true, {}, ticket_payload);
delete required_ticket_payload.subject;
delete required_ticket_payload.dt_path;

export {ticket_payload, ticket_payload_with_comment, required_ticket_payload, ticket_payload_detail_with_assignee, ticket_payload_detail, ticket_payload_detail_one_category, ticket_payload_with_attachment, ticket_payload_with_attachments, ticket_dt_new_payload, ticket_dt_new_payload_PATCH};
