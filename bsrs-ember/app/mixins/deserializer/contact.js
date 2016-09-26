import Ember from 'ember';

export default Ember.Mixin.create({
  extract_single_phonenumber(a) {
    const store = this.get('simpleStore');
    const type_id = a.type;
    delete a.type;
    a.phone_number_type_fk = type_id;
    a.detail = true;
    const phonenumber = store.push('phonenumber', a);
    // setup related models
    const type = store.find('phone-number-type', type_id);
    const obj_type = { id: type_id, name: type.get('name') };
    this.setup_phone_number_type(obj_type, phonenumber);
    phonenumber.save();
  },
  extract_phonenumbers(response) {
    // phonenumbers may come back as undefined
    let phonenumbers = response.phone_numbers || [];
    phonenumbers.forEach((a) => {
      this.extract_single_phonenumber(a);
    });
    delete response.phone_numbers;
  },
  extract_single_email(a) {
    const store = this.get('simpleStore');
    const type_id = a.type;
    delete a.type;
    a.email_type_fk = type_id;
    a.detail = true;
    const email = store.push('email', a);
    // setup related models
    const type = store.find('email-type', type_id);
    const obj_type = { id: type_id, name: type.get('name') };
    this.setup_email_type(obj_type, email);
    email.save();
  },
  extract_emails(response) {
    let emails = response.emails || [];
    emails.forEach((a) => {
      this.extract_single_email(a);
    });
    delete response.emails;
  },
  extract_single_address(a) {
    const store = this.get('simpleStore');
    // related models
    const country = a.country;
    delete a.country;
    const state = a.state;
    delete a.state;
    const type_id = a.type;
    delete a.type;
    if (state) {
      a.state_fk = state.id;
    }
    if (country) {
      a.country_fk = country.id;
    }
    a.address_type_fk = type_id;
    a.detail = true;
    const address = store.push('address', a);
    // setup related models
    this.setup_country(country, address);
    this.setup_state(state, address);
    const type = store.find('address-type', type_id);
    const obj_type = { id: type_id, name: type.get('name') };
    this.setup_address_type(obj_type, address);
    address.save();
  },
  extract_addresses(response) {
    let addresses = response.addresses || [];
    addresses.forEach((a) => {
      this.extract_single_address(a);
    });
    delete response.addresses;
  }
});
