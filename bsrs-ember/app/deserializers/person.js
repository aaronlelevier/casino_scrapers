import Ember from 'ember';

export default (response, store, id) => {
    response.phone_numbers.forEach((phone_number) => {
        store.push('phone-number-type', phone_number.type);
        phone_number.type = phone_number.type.id;
        phone_number.person_id = id;
        store.push('phonenumber', phone_number);
    });
    response.addresses.forEach((address) => {
        store.push('address-type', address.type);
        // store.push('state', address.state);
        // store.push('country', address.country);
        address.type = address.type.id;
        address.person_id = id;
        store.push('address', address);
    });
    //discuss dirty attr for prop not included in the list
    //meaning ... if the user is dirty NOW what should do?
    delete response.phone_numbers;
    delete response.addresses;
    var originalPerson = store.push('person', response);
    originalPerson.save();
};
