import PD from 'bsrs-ember/vendor/defaults/person';

var multi_new_put_payload = {
  id: 'abc123',
  username: PD.username,
  first_name: PD.first_name,
  middle_initial: PD.middle_initial,
  last_name: PD.last_name,
  auth_amount: null,
  status: PD.status,
  role: PD.role,
  locations: [],
  emails: [],
  phone_numbers: [],
  // addresses: [],
  locale: PD.locale_id,
};

export {
  multi_new_put_payload
};
