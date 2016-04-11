import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PD from 'bsrs-ember/vendor/defaults/person';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';

var dtd_payload = {
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
    required: FD.requiredOne,
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

var dtd_payload_two = {
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
    required: FD.requiredOne,
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

var dtd_payload_link_two_put = {
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
    required: FD.requiredOne,
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
    destination: DTD.idOne,
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
  },
  {
    id: 1,
    // order: LINK.orderOne,  // needs to be set on model based upon order in `dtd-links` array
    action_button: LINK.action_buttonOne,
    is_header: LINK.is_headerTwo,
    request: LINK.requestTwo,
    text: LINK.textTwo,
    priority: null,
    status: null,
    destination: null,
    categories: []
  }],
  attachments: []
};

var dtd_payload_update_priority = {
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
    required: FD.requiredOne,
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
    priority: TP.priorityTwoId,
    status: TD.statusOneId,
    destination: DTD.idTwo,
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
  }],
  attachments: []
};

var dtd_payload_no_priority = {
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
    required: FD.requiredOne,
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
    priority: null,
    status: null,
    destination: DTD.idTwo,
    categories: [CD.idOne, CD.idPlumbing, CD.idPlumbingChild],
  }],
  attachments: []
};

var dtd_new_payload = {
  id: 1,
  key: DTD.keyOne,
  description: DTD.descriptionOne,
  fields: [],
  links: [],
  attachments: []
};

var dtd_payload_with_attachment = {
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
    required: FD.requiredOne,
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
  attachments: [UUID.value]
};

var dtd_payload_with_categories = Ember.$.extend(true, {}, dtd_payload);
dtd_payload_with_categories.links[0].categories = [CD.idOne, CD.idTwo];

var dtd_payload_with_attachments = Ember.$.extend(true, {}, dtd_payload_with_attachment);
dtd_payload_with_attachments.attachments = ['abc123', 'def456'];

export { dtd_payload, dtd_payload_two, dtd_payload_link_two_put, dtd_payload_update_priority, dtd_payload_no_priority, dtd_new_payload, dtd_payload_with_attachment, dtd_payload_with_attachments, dtd_payload_with_categories };
