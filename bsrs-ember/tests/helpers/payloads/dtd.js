import Ember from 'ember';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PD from 'bsrs-ember/vendor/defaults/person';
import DTD from 'bsrs-ember/vendor/defaults/dtd';

var dtd_payload = {
    id: DTD.idOne,
    key: DTD.keyOne,
    description: DTD.descriptionOne,
    prompt: DTD.promptOne,
    note: DTD.noteOne,
    note_type: DTD.noteTypeOne,
    link_type: DTD.linkTypeOne,
};

var dtd_new_payload = {
    id: 1,
    key: DTD.keyOne,
    description: DTD.descriptionOne,
};

export { dtd_payload, dtd_new_payload };
