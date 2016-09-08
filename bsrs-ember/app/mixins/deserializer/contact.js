import Ember from 'ember';

export default Ember.Mixin.create({
  extract_phonenumbers(response) {
    const store = this.get('simpleStore');
    // let phonenumber_fks = [];
    let phonenumbers = response.phone_numbers || [];
    phonenumbers.forEach((a) => {
      // phonenumber_fks.push(a.id);
      // related models
      const type = a.type;
      delete a.type;
      a.model_fk = response.id; // main model - this is b/c using old attrs, not related attrs
      a.phone_number_type_fk = type.id;
      a.detail = true;
      const phonenumber = store.push('phonenumber', a);
      // setup related models
      this.setup_phone_number_type(type, phonenumber);
      phonenumber.save();
    });
    delete response.phone_numbers;
  },
  extract_emails(response) {
    const store = this.get('simpleStore');
    // let email_fks = [];
    let emails = response.emails || [];
    emails.forEach((a) => {
      // email_fks.push(a.id);
      // related models
      const type = a.type;
      delete a.type;
      a.model_fk = response.id; // main model - this is b/c using old attrs, not related attrs
      a.email_type_fk = type.id;
      a.detail = true;
      const email = store.push('email', a);
      // setup related models
      this.setup_email_type(type, email);
      email.save();
    });
    delete response.emails;
  },
  extract_addresses(response) {
    const store = this.get('simpleStore');
    // let address_fks = [];
    let addresses = response.addresses || [];
    addresses.forEach((a) => {
      // address_fks.push(a.id);
      // related models
      const country = a.country;
      delete a.country;
      const state = a.state;
      delete a.state;
      const type = a.type;
      delete a.type;
      // a.model_fk = response.id; // main model - this is b/c using old attrs, not related attrs
      if (state) {
        a.state_fk = state.id;
      }
      if (country) {
        a.country_fk = country.id;
      }
      a.address_type_fk = type.id;
      a.detail = true;
      const address = store.push('address', a);
      // setup related models
      this.setup_country(country, address);
      this.setup_state(state, address);
      this.setup_address_type(type, address);
      address.save();
    });
    delete response.addresses;
  }
});
