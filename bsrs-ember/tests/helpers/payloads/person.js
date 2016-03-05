import PD from 'bsrs-ember/vendor/defaults/person';

var multi_new_put_payload = {
    id: 'abc123',
    username: PD.username,
    status: PD.status,
    role: PD.role,
    locations: [],
    emails: [],
    phone_numbers: [],
    addresses: [],
    locale: PD.locale_id
};

export {multi_new_put_payload};
