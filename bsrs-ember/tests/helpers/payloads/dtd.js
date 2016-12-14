import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
//import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';

//const PD = PERSON_DEFAULTS.defaults();

let dtd_payload = {
  id: DTD.idOne,
  key: DTD.keyOne,
  description: DTD.descriptionOne,
  prompt: DTD.promptOne,
  note: DTD.noteOne,
  note_type: DTD.noteTypeOne,
  link_type: DTD.linkTypeOne,
  fields: [{
    id: FD.idOne,
    label: FD.labelOne,
    type: FD.typeSix,
    required: FD.requiredTwo,
    order: FD.orderOne,
    options: [{
      id: OD.idOne,
      text: OD.textOne,
      order: OD.orderOne
    }]
  }],
  links: [{
    id: LINK.idOne,
    order: LINK.orderOne,
    action_button: LINK.action_buttonOne,
    is_header: LINK.is_headerOne,
    request: LINK.requestOne,
    text: LINK.textOne,
    priority: TP.priorityOneId,
    status: TD.statusOneId,
    destination: DTD.idTwo,
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
  }],
  attachments: []
};

let dtd_payload_two = {
  id: DTD.idOne,
  key: DTD.keyTwo,
  description: DTD.descriptionTwo,
  prompt: DTD.promptTwo,
  note: DTD.noteTwo,
  note_type: DTD.noteTypeTwo,
  link_type: DTD.linkTypeTwo,
  fields: [{
    id: FD.idOne,
    label: FD.labelOne,
    type: FD.typeSix,
    required: FD.requiredTwo,
    order: FD.orderOne,
    options: [{
      id: OD.idOne,
      text: OD.textOne,
      order: OD.orderOne
    }]
  }],
  links: [{
    id: LINK.idOne,
    order: LINK.orderOne,
    action_button: LINK.action_buttonTwo,
    is_header: LINK.is_headerOne,
    request: LINK.requestTwo,
    text: LINK.textTwo,
    priority: TP.priorityTwoId,
    status: TD.statusTwoId,
    destination: DTD.idTwo,
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
  }],
  attachments: []
};

let dtd_payload_link_two_put = Ember.$.extend(true, {}, dtd_payload);
let links = [{
    id: LINK.idOne,
    order: LINK.orderOne,
    action_button: LINK.action_buttonOne,
    is_header: LINK.is_headerOne,
    request: LINK.requestOne,
    text: LINK.textOne,
    priority: TP.priorityOneId,
    status: TD.statusOneId,
    destination: DTD.idOne,
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
  }, {
    id: 1,
    order: LINK.orderTwo,
    action_button: LINK.action_buttonOne,
    is_header: LINK.is_headerTwo,
    request: LINK.requestTwo,
    text: LINK.textTwo,
    priority: undefined,
    status: undefined,
    destination: undefined,
    categories: []
  }];
dtd_payload_link_two_put['links'] = links;

let dtd_payload_update_priority = Ember.$.extend(true, {}, dtd_payload);
dtd_payload_update_priority['links'][0]['priority'] = TP.priorityTwoId;

let dtd_payload_no_status = Ember.$.extend(true, {}, dtd_payload);
dtd_payload_no_status['links'][0]['status'] = undefined;

let dtd_payload_no_priority = Ember.$.extend(true, {}, dtd_payload);
dtd_payload_no_priority['links'][0]['priority'] = undefined;

let dtd_new_payload = {
  id: 1,
  key: DTD.keyOne,
  description: DTD.descriptionOne,
  link_type: DTD.linkTypeOne,
  fields: [{
    id: 1,
    label: FD.labelOne,
    type: FD.typeFour,
    required: FD.requiredTwo,
    order: FD.orderOne,
    options: [{
      id: 1,
      text: OD.textOne,
      order: OD.orderOne
    }]
  }],
  links: [{
    id: 1,
    order: LINK.orderOne,
    action_button: LINK.action_buttonOne,
    is_header: LINK.is_headerTwo,
    request: LINK.requestOne,
    text: LINK.textOne,
    priority: TP.priorityOneId,
    status: TD.statusOneId,
    destination: DTD.idOne,
    categories: [],
  }],
  attachments: []
};

let dtd_payload_with_attachment = Ember.$.extend(true, {}, dtd_payload);
dtd_payload_with_attachment['attachments'] = [UUID.value];

let dtd_payload_with_categories = Ember.$.extend(true, {}, dtd_payload);
dtd_payload_with_categories.links[0].categories = [CD.idOne, CD.idTwo];

let dtd_payload_change_categories = Ember.$.extend(true, {}, dtd_payload);
dtd_payload_change_categories.links[0].categories = [CD.idThree, CD.idLossPreventionChild];

let dtd_payload_with_attachments = Ember.$.extend(true, {}, dtd_payload_with_attachment);
dtd_payload_with_attachments.attachments = ['abc123', 'def456'];

export { dtd_payload, dtd_payload_two, dtd_payload_link_two_put, dtd_payload_update_priority, dtd_payload_no_priority, dtd_new_payload, dtd_payload_with_attachment, dtd_payload_with_attachments, 
  dtd_payload_with_categories, dtd_payload_change_categories, dtd_payload_no_status };
