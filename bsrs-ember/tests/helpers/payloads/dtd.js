import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PD from 'bsrs-ember/vendor/defaults/person';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';

var dtd_payload = {
    id: DTD.idOne,
    key: DTD.keyOne,
    description: DTD.descriptionOne,
    prompt: DTD.promptOne,
    note: DTD.noteOne,
    note_type: DTD.noteTypeOne,
    link_type: DTD.linkTypeOne,
    links: [{
        order: LINK.orderOne,
        action_button: LINK.action_buttonOne,
        is_header: LINK.is_headerOne,
        request: LINK.requestOne,
        priority: TP.priorityOneId
    }]
};

var dtd_payload_no_priority = {
    id: DTD.idOne,
    key: DTD.keyOne,
    description: DTD.descriptionOne,
    prompt: DTD.promptOne,
    note: DTD.noteOne,
    note_type: DTD.noteTypeOne,
    link_type: DTD.linkTypeOne,
    links: [{
        order: LINK.orderOne,
        action_button: LINK.action_buttonOne,
        is_header: LINK.is_headerOne,
        request: LINK.requestOne
    }]
};

var dtd_payload_two = {
    id: DTD.idOne,
    key: DTD.keyTwo,
    description: DTD.descriptionTwo,
    prompt: DTD.promptTwo,
    note: DTD.noteTwo,
    note_type: DTD.noteTypeOne,
    link_type: DTD.linkTypeOne,
    links: [{
        order: LINK.orderOne,
        action_button: LINK.action_buttonTwo,
        is_header: LINK.is_headerTwo,
        request: LINK.requestTwo,
        priority: TP.priorityTwoId
    }]
};

var dtd_new_payload = {
    id: 1,
    key: DTD.keyOne,
    description: DTD.descriptionOne,
    links: []
};

export { dtd_payload, dtd_payload_no_priority, dtd_new_payload, dtd_payload_two };
