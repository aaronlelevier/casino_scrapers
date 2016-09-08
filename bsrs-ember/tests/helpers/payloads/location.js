import LD from 'bsrs-ember/vendor/defaults/location';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number';

var new_put_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    status: LD.status,
    location_level: LD.location_level.id, 
    children: [], 
    parents: [], 
    emails: [], 
    phone_numbers: [], 
    addresses: []
};

var addresses = {id: UUID.value, type: ATD.shippingId, address: '34 2nd St', postal_code: '12345' };
var address_put_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    status: LD.status,
    location_level: LD.location_level.id, 
    children: [], 
    parents: [], 
    emails: [], 
    phone_numbers: [], 
    addresses: [addresses]
};

var phone_numbers = {id: UUID.value, type: PNTD.officeId, number: PND.numberOne };
var phone_number_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    status: LD.status,
    location_level: LD.location_level.id, 
    children: [], 
    parents: [], 
    emails: [], 
    phone_numbers: [phone_numbers], 
    addresses: []
};

var emails = {id: UUID.value, email: ED.emailOne, type: ETD.workId };
var email_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    status: LD.status,
    location_level: LD.location_level.id, 
    children: [], 
    parents: [], 
    emails: [emails], 
    phone_numbers: [], 
    addresses: []
};

var children_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    status: LD.status,
    location_level: LD.location_level.id, 
    children: [LD.unusedId, 'abc123'], 
    parents: [], 
    emails: [], 
    phone_numbers: [], 
    addresses: []
};

var parents_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    status: LD.status,
    location_level: LD.location_level.id, 
    children: [], 
    parents: [LD.unusedId, 'abc123'], 
    emails: [], 
    phone_numbers: [], 
    addresses: []
};

export {parents_payload, children_payload, email_payload, phone_number_payload, address_put_payload, new_put_payload};

