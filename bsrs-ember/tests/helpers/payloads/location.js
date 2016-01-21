import LD from 'bsrs-ember/vendor/defaults/location';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import AD from 'bsrs-ember/vendor/defaults/address';
import AF from 'bsrs-ember/vendor/address_fixtures';
import ATD from 'bsrs-ember/vendor/defaults/address-type';

var new_put_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    location_level: LD.location_level.id, 
    children: [], 
    parents: [], 
    emails: [], 
    phone_numbers: [], 
    addresses: []
};

var addresses = {id: UUID.value, type: ATD.shippingId, address: '34 2nd St' };
var address_put_payload = {
    id: UUID.value, 
    name: LD.storeName, 
    number: LD.storeNumber, 
    location_level: LD.location_level.id, 
    children: [], 
    parents: [], 
    emails: [], 
    phone_numbers: [], 
    addresses: [addresses]
};

export {address_put_payload, new_put_payload};

