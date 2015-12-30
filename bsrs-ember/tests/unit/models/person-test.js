import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import CurrencyDefaults from 'bsrs-ember/vendor/defaults/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PHONE_NUMBER_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import AF from 'bsrs-ember/vendor/address_fixtures';
import ADDRESS_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import AD from 'bsrs-ember/vendor/defaults/address';
import LD from 'bsrs-ember/vendor/defaults/location';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, uuid, person, role, run = Ember.run;

module('unit: person test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency', 'model:phonenumber', 'model:address', 'model:location', 'model:person-location', 'service:currency','service:person-current','service:translations-fetcher','service:i18n', 'model:uuid', 'model:status']);
        run(function() {
            person = store.push('person', {id: PD.idOne, first_name: PD.first_name, last_name: PD.last_name, role_fk: RD.idOne, status_fk: SD.activeId});
            role = store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.idOne]});
        });
    }
});

test('fullname property is a computed of first and last', (assert) => {
    assert.equal(person.get('fullname'), PD.first_name + ' ' + PD.last_name);
    person.set('first_name', 'wat');
    assert.equal(person.get('fullname'), 'wat ' + PD.last_name);
    person.set('last_name', 'man');
    assert.equal(person.get('fullname'), 'wat man');
});

test('related phone numbers are not dirty when no phone numbers present', (assert) => {
    let phone_number;
    run(function() {
        phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.unusedId});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related addresses are not dirty when no addresses present', (assert) => {
    let address;
    run(function() {
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.unusedId});
    });
    assert.ok(person.get('addressesIsNotDirty'));
});

/* STATUS */
test('related status should return one status for a person', (assert) => {
    let status;
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName}); 
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('statusIsNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
});

test('change_status will update the persons status and dirty the model', (assert) => {
    let status, inactive_status;
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]}); 
        inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []}); 
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('status_fk'), SD.activeId); 
    assert.equal(person.get('status.id'), SD.activeId); 
    person.change_status(inactive_status.get('id'));
    assert.equal(person.get('status_fk'), SD.activeId); 
    assert.equal(person.get('status.id'), SD.inactiveId); 
    assert.ok(person.get('isDirtyOrRelatedDirty')); 
    assert.ok(person.get('statusIsDirty')); 
});

test('save person will set status_fk to current status id', (assert) => {
    let status, inactive_status;
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
        inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('status_fk'), SD.activeId); 
    assert.equal(person.get('status.id'), SD.activeId); 
    person.change_status(inactive_status.get('id'));
    assert.equal(person.get('status_fk'), SD.activeId); 
    assert.equal(person.get('status.id'), SD.inactiveId); 
    assert.ok(person.get('isDirtyOrRelatedDirty')); 
    assert.ok(person.get('statusIsDirty')); 
    person.saveRelated();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty')); 
    assert.ok(!person.get('statusIsDirty')); 
    assert.equal(person.get('status_fk'), SD.inactiveId); 
    assert.equal(person.get('status.id'), SD.inactiveId); 
});

test('rollback person will set status to current status_fk', (assert) => {
    let status, inactive_status;
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]}); 
        inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []}); 
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('status_fk'), SD.activeId); 
    assert.equal(person.get('status.id'), SD.activeId); 
    person.change_status(inactive_status.get('id'));
    assert.equal(person.get('status_fk'), SD.activeId); 
    assert.equal(person.get('status.id'), SD.inactiveId); 
    assert.ok(person.get('isDirtyOrRelatedDirty')); 
    assert.ok(person.get('statusIsDirty')); 
    person.rollbackRelated();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty')); 
    assert.ok(!person.get('statusIsDirty')); 
    assert.equal(person.get('status.id'), SD.activeId); 
    assert.equal(person.get('status_fk'), SD.activeId); 
});

// /* ROLE */
test('related role is not dirty with original role model', (assert) => {
    assert.ok(person.get('roleIsNotDirty'));
});

test('related role only returns the single matching item even when multiple roles exist', (assert) => {
    run(function() {
        person = store.push('person', {id: PD.idOne});
        store.push('role', {id: RD.idOne, people: [PD.idOne, PD.unusedId]});
        store.push('role', {id: RD.idTwo, people: ['123-abc-defg']});
    });
    let role = person.get('role');
    assert.equal(role.get('id'), RD.idOne);
});

test('related role will update when the roles people array suddenly has the person pk (might be initially but person has a default role)', (assert) => {
    run(function() {
        role = store.push('role', {id: RD.idOne, people: [PD.unusedId]});
    });
    assert.equal(person.get('role'), undefined);
    person.change_role(role);
    assert.ok(person.get('role'));
    assert.equal(person.get('role.id'), RD.idOne);
});

test('related role will update when the roles people array changes and is dirty', (assert) => {
    run(function() {
        store.clear('person');
        person = store.push('person', {id: PD.idOne});
        role = store.push('role', {id: RD.idOne, people: [PD.unusedId]});
    });
    assert.equal(person.get('role'), undefined);
    person.change_role(role);
    assert.ok(person.get('role'));
    assert.equal(person.get('role.id'), RD.idOne);
    assert.ok(person.get('roleIsDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('related role is not dirty if changed back to original role', (assert) => {
    let role_change;
    run(function() {
        person = store.push('person', {id: PD.idOne, role_fk: RD.idOne});
        role = store.push('role', {id: RD.idOne, people: [PD.idOne]});
        role_change = store.push('role', {id: RD.idTwo, people: []});
    });
    assert.ok(person.get('role'));
    assert.equal(person.get('role.id'), RD.idOne);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    person.change_role(role_change);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(person.get('roleIsDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    assert.equal(person.get('role').get('id'), RD.idTwo);
    assert.equal(person.get('role_fk'), RD.idOne);
    person.change_role(role);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    assert.equal(person.get('role').get('id'), RD.idOne);
    assert.equal(person.get('role_fk'), RD.idOne);
});

test('related role is not dirty if after rollback and save', (assert) => {
    let role_change;
    run(function() {
        person = store.push('person', {id: PD.idOne, role_fk: RD.idOne});
        role = store.push('role', {id: RD.idOne, people: [PD.idOne]});
        role_change = store.push('role', {id: RD.idTwo, people: []});
    });
    assert.ok(person.get('role'));
    assert.equal(person.get('role.id'), RD.idOne);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    person.change_role(role_change);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(person.get('roleIsDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    assert.equal(person.get('role').get('id'), RD.idTwo);
    assert.equal(person.get('role_fk'), RD.idOne);
    person.rollbackRole();
    assert.equal(person.get('role').get('id'), RD.idOne);
    assert.equal(person.get('role_fk'), RD.idOne);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
    person.change_role(role_change);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(person.get('roleIsDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    assert.equal(person.get('role').get('id'), RD.idTwo);
    assert.equal(person.get('role_fk'), RD.idOne);
    person.saveRole();
    assert.equal(person.get('role').get('id'), RD.idTwo);
    assert.equal(person.get('role_fk'), RD.idTwo);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
});

/* PHONE NUMBERS AND ADDRESSES */
test('related phone numbers are not dirty with original phone number model', (assert) => {
    let phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related addresses are not dirty with original addresses model', (assert) => {
    let address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', (assert) => {
    let phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
});

test('related address model is dirty when address is dirty (and address is not newly added)', (assert) => {
    let address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(address.get('isNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(address.get('isDirty'));
    assert.ok(person.get('addressesIsDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('person is dirty or related is dirty when model has been updated', (assert) => {
    let phone_number, address;
    run(function() {
        store.clear('person');
        person = store.push('person', {id: PD.idOne, username: PD.username, phone_number_fks: [PND.idOne], address_fks: [AD.idOne], role_fk: RD.idOne});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.set('username', 'abc');
    assert.ok(person.get('isDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.set('username', PD.username);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(!person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(address.get('isDirty'));
    assert.ok(person.get('addressesIsDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(address.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(!person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('save related will iterate over each phone number and save that model', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.savePhoneNumbers();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.savePhoneNumbers();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('save related will iterate over each address and save that model', (assert) => {
    let first_address, second_address;
    run(function() {
        person = store.push('person', {id: PD.idOne});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    first_address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(person.get('addressesIsDirty'));
    person.saveAddresses();
    assert.ok(person.get('addressesIsNotDirty'));
    second_address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('addressesIsDirty'));
    person.saveAddresses();
    assert.ok(person.get('addressesIsNotDirty'));
});

test('savePhoneNumbers will remove any phone number model with no (valid) value', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    third_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    first_phone_number.set('number', PND.numberOne);
    second_phone_number.set('number', PND.numberTwo);
    assert.equal(store.find('phonenumber').get('length'), 3);
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 2);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idOne);
    assert.equal(store.find('phonenumber').objectAt(1).get('id'), PND.idTwo);
    first_phone_number.set('number', '');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 1);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idTwo);
    second_phone_number.set('number', ' ');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 0);
});

test('saveAddresses will remove any address model with no (valid) value', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    third_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    first_phone_number.set('number', PND.numberOne);
    second_phone_number.set('number', PND.numberTwo);
    assert.equal(store.find('phonenumber').get('length'), 3);
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 2);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idOne);
    assert.equal(store.find('phonenumber').objectAt(1).get('id'), PND.idTwo);
    first_phone_number.set('number', '');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 1);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idTwo);
    second_phone_number.set('number', ' ');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 0);
});

test('phoneNumbersDirty behaves correctly for phone numbers (newly) added', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.equal(person.get('phone_numbers').get('length'), 3);
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('number', PND.numberOne);
    assert.ok(person.get('phoneNumbersIsDirty'));
    first_phone_number.set('number', '');
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('addressesIsDirty behaves correctly for addresses (newly) added', (assert) => {
    let first_address, second_address, third_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
        first_address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
        third_address = store.push('address', {id: AD.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.equal(person.get('addresses').get('length'), 3);
    assert.ok(person.get('addressesIsNotDirty'));
    first_address.set('address', AD.streetOne);
    assert.ok(person.get('addressesIsDirty'));
    first_address.set('address', '');
    assert.ok(person.get('addressesIsNotDirty'));
});

test('phoneNumbersDirty behaves correctly for existing phone numbers', (assert) => {
    let first_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.equal(person.get('phone_numbers').get('length'), 1);
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('number', PND.numberTwo);
    assert.ok(person.get('phoneNumbersIsDirty'));
    first_phone_number.set('number', '');
    assert.ok(person.get('phoneNumbersIsDirty'));
});

test('addressesDirty behaves correctly for existing addresses', (assert) => {
    let first_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.equal(person.get('addresses').get('length'), 1);
    assert.ok(person.get('addressesIsNotDirty'));
    first_address.set('address', AD.streetTwo);
    assert.ok(person.get('addressesIsDirty'));
    first_address.set('address', '');
    assert.ok(person.get('addressesIsDirty'));
});

test('phoneNumbersIsDirty is false when a phone number is added but does not have a (valid) number', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.equal(store.find('phonenumber').get('length'), 3);
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.equal(store.find('phonenumber').get('length'), 3);
});

test('addressesIsDirty is false when an address is added but does not have a (valid) address', (assert) => {
    let first_address, second_address, third_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
        first_address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
        third_address = store.push('address', {id: AD.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.equal(store.find('address').get('length'), 3);
    assert.ok(person.get('addressesIsNotDirty'));
    assert.equal(store.find('address').get('length'), 3);
});

test('phoneNumbersIsDirty is false when a phone number is added but does not have a (valid) number without phone_number_fks', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: []});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.equal(store.find('phonenumber').get('length'), 3);
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.equal(store.find('phonenumber').get('length'), 3);
});

test('addressesIsDirty is false when an address is added but does not have a (valid) address without address_fks', (assert) => {
    let first_address, second_address, third_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: []});
        first_address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
        third_address = store.push('address', {id: AD.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.equal(store.find('address').get('length'), 3);
    assert.ok(person.get('addressesIsNotDirty'));
    assert.equal(store.find('address').get('length'), 3);
});

test('rollback related will iterate over each phone number and rollback that model', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.rollbackRelated();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.rollbackRelated();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('rollback related will iterate over each address and rollback that model', (assert) => {
    let first_address, second_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    first_address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(person.get('addressesIsDirty'));
    assert.ok(first_address.get('isDirty'));
    person.rollbackRelated();
    assert.ok(person.get('addressesIsNotDirty'));
    second_address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(second_address.get('isDirty'));
    person.rollbackRelated();
    assert.ok(person.get('addressesIsNotDirty'));
});

test('when new phone number is added, the person model is not dirty unless number is altered', (assert) => {
    let phone_number, phone_number_two;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    run(function() {
        phone_number_two = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number_two.set('number', '888-888-8888');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number_two.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '999-999-9999');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when new address is added, the person model is not dirty unless address is altered', (assert) => {
    let address, address_two;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
    });
    run(function() {
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    run(function() {
        address_two = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address_two.set('address', '123 Mexico');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    address_two.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', 'Big Sky Parkway');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when new phone number is added, the person model is dirty when the type or number attrs are modified', (assert) => {
    let phone_number, phone_number_two;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    run(function() {
        phone_number_two = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number_two.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number_two.rollback();
    assert.equal(phone_number_two.get('type'), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '5');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.equal(phone_number.get('number'), '5');
});

test('when new address is added, the person model is not dirty when the type or address attrs are modified', (assert) => {
    let address, address_two;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    run(function() {
        address_two = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address_two.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    address_two.rollback();
    assert.equal(address_two.get('type'), ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', 'Big Sky Parkway');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(address.get('address'),'Big Sky Parkway');
});

test('when new phone number is added after render, the person model is not dirty when a new phone number is appended to the array of phone numbers', (assert) => {
    let added_phone_num;
    run(function() {
        person = store.push('person', {id: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    let phonenumbers = person.get('phone_numbers');
    run(function() {
        added_phone_num = phonenumbers.push({id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when new address is added after render, the person model is not dirty when new address is appended to the array of addresses', (assert) => {
    let added_address;
    run(function() {
        person = store.push('person', {id: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    let addresses = person.get('addresses');
    run(function() {
        added_address = addresses.push({id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when phone number is removed after render, the person model is dirty (two phone numbers)', (assert) => {
    let phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    let phonenumbers = person.get('phone_numbers');
    run(function() {
        phonenumbers.remove(PND.idOne);
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when address is removed after render, the person model is dirty (two addresses)', (assert) => {
    let address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
        address = store.push('address', {id: AD.idOne, address: AD.streetOne, city: AD.cityOne, state: AD.stateOne, postal_code: AD.zipOne,
                                 type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        store.push('address', {id: AD.idTwo, address: AD.streetTwo, city: AD.cityTwo, state: AD.stateTwo, postal_code: AD.zipOne,
                                 type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    let addresses = person.get('addresses');
    run(function() {
        addresses.remove(AD.idOne);
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when no phone number and new phone number is added and updated, expect related isDirty to be true', (assert) => {
    let phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    run(function() {
        phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '888-888-8888');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when no address and new address is added and updated, expect related isDirty to be true', (assert) => {
    let address;
    run(function() {
        person = store.push('person', {id: PD.idOne});
        store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    run(function() {
        address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    address.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', '123 Baja');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when phone number is removed after render, the person model is dirty', (assert) => {
    let phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    run(function() {
        store.push('phonenumber', {id: phone_number.get('id'), removed: true});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when address is removed after render, the person model is dirty', (assert) => {
    let address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, address: AD.streetOne, city: AD.cityOne, state: AD.stateOne, postal_code: AD.zipOne,
                                 type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    run(function() {
        store.push('address', {id: address.get('id'), removed: true});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('rollback role will reset the previously used role when switching from one role to another', (assert) => {
    let guest_role, admin_role, another_role;
    run(function() {
        person = store.push('person', {id: PD.idOne, role_fk: RD.idTwo});
        guest_role = store.push('role', {id: RD.idTwo, name: RD.nameTwo, people: [PD.unusedId, PD.idOne]});
        admin_role = store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.unusedId]});
        another_role = store.push('role', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3', name: 'another', people: [PD.unusedId]});
    });
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
    assert.ok(person.get('statusIsNotDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('addressesIsNotDirty'));
    assert.equal(person.get('role.name'), RD.nameTwo);
    person.change_role(admin_role);
    assert.equal(person.get('role.name'), RD.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.save();
    person.saveRelated();
    person.change_role(another_role);
    assert.equal(person.get('role.name'), 'another');
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackRelated();
    assert.equal(person.get('role.name'), RD.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('role_fk'), RD.idOne);
    assert.deepEqual(another_role.get('people'), [PD.unusedId]);
    assert.deepEqual(admin_role.get('people'), [PD.unusedId, PD.idOne]);
    assert.ok(another_role.get('isNotDirty'));
    assert.ok(admin_role.get('isNotDirty'));
    person.change_role(another_role);
    assert.equal(person.get('role.name'), 'another');
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackRelated();
    assert.equal(person.get('role.name'), RD.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_role.get('people'), [PD.unusedId]);
    assert.deepEqual(admin_role.get('people'), [PD.unusedId, PD.idOne]);
    assert.ok(another_role.get('isNotDirty'));
    assert.ok(admin_role.get('isNotDirty'));
});

/*PERSON LOCATION M2M*/
//TODO: deserializer should create a joining model for each location found on person
//TODO: test drive how this works on location if/when it's required
test('locations property should return all associated locations or empty array', (assert) => {
    let m2m, location;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location = store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idOne]});
    });
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('name'), LD.storeName);
    run(function() {
        store.push('person-location', {id: m2m.get('id'), removed: true});
    });
    assert.equal(person.get('locations').get('length'), 0);
});

test('locations property is not dirty when no location present (undefined)', (assert) => {
    run(function() {
        store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: undefined});
        person = store.push('person', {id: PD.idOne, person_location_fks: undefined});
    });
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty when no location present (empty array)', (assert) => {
    run(function() {
        store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: []});
        person = store.push('person', {id: PD.idOne, person_location_fks: []});
    });
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty with original location model', (assert) => {
    let location;
    run(function() {
        store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        location = store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idOne]});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
    });
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('locationsIsNotDirty'));
    location.set('name', LD.storeNameTwo);
    assert.ok(location.get('isDirty'));
    assert.ok(person.get('locationsIsDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('name'), LD.storeNameTwo);
});

test('locations property only returns the single matching item even when multiple locations exist', (assert) => {
    run(function() {
        store.push('person-location', {id: PERSON_LD.idThree, person_pk: PD.unusedId, location_pk: LD.idOne});
        store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idTwo});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
        store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_location_fks: [PERSON_LD.idOne]});
        store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idThree]});
    });
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('id'), LD.idTwo);
});

test('locations property returns multiple matching items when multiple locations exist', (assert) => {
    run(function() {
        store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idTwo});
        store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idOne});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
        store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idTwo]});
        store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_location_fks: [PERSON_LD.idOne]});
    });
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('id'), LD.idOne);
    assert.equal(locations.objectAt(1).get('id'), LD.idTwo);
});

test('locations property will update when the m2m array suddenly has the person pk (starting w/ empty array)', (assert) => {
    let location;
    run(function() {
        person = store.push('person', {id: PD.idOne, person_location_fks: []});
        location = store.push('location', {id: LD.idOne, person_location_fks: []});
        store.push('location', {id: LD.idTwo, person_location_fks: []});
    });
    assert.equal(person.get('locations').get('length'), 0);
    person.add_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
});

test('locations property will update when the m2m array suddenly has the person pk', (assert) => {
    let location, location_two;
    run(function() {
        store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location_two = store.push('location', {id: LD.idTwo, person_location_fks: []});
    });
    assert.equal(person.get('locations').get('length'), 1);
    person.add_locations(LD.idTwo);
    assert.equal(person.get('locations').get('length'), 2);
    assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
    assert.equal(person.get('locations').objectAt(1).get('id'), LD.idTwo);
});

test('locations property will update when the m2m array suddenly removes the person', (assert) => {
    let m2m, location;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
    });
    assert.equal(person.get('locations').get('length'), 1);
    person.remove_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 0);
});

//TODO: do no want to dirty person model when location name is changed
test('when location is changed dirty tracking works as expected', (assert) => {
    let location;
    run(function() {
        store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
    });
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', LD.storeName);
    assert.ok(location.get('isDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    location.rollback();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', LD.storeNameTwo);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    location.rollback();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting undefined)', (assert) => {
    let location;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: undefined});
        person = store.push('person', {id: PD.idOne, person_location_fks: undefined});
    });
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.add_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting with an empty array)', (assert) => {
    let location;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: []});
        person = store.push('person', {id: PD.idOne, person_location_fks: []});
    });
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.add_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting with legit value)', (assert) => {
    let location, location_two;
    run(function() {
        store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location_two = store.push('location', {id: LD.idTwo, person_location_fks: []});
    });
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('locationsIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.add_locations(LD.idTwo);
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently removed it shows as a dirty relationship', (assert) => {
    let m2m, location;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
    });
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.remove_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
    let m2m, location, location_two;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location_two = store.push('location', {id: LD.idTwo, person_location_fks: [PERSON_LD.idTwo]});
    });
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.remove_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('rollback location will reset the previously used locations when switching from valid locations to nothing', (assert) => {
    let m2m, m2m_two, location, location_two;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location_two = store.push('location', {id: LD.idTwo, person_location_fks: [PERSON_LD.idTwo]});
    });
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.remove_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackLocations();
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.remove_locations(LD.idOne);
    person.remove_locations(LD.idTwo);
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackLocations();
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback location will reset the previous locations when switching from one location to another and saving in between each step', (assert) => {
    let m2m, m2m_two, location, location_two, location_three, location_four;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location_two = store.push('location', {id: LD.idTwo, person_location_fks: [PERSON_LD.idTwo]});
        location_three = store.push('location', {id: LD.unusedId, person_location_fks: [PERSON_LD.idThree]});
        location_four = store.push('location', {id: LD.anotherId, person_location_fks: [PERSON_LD.idFour]});
    });
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', 'watwat');
    person.save();
    person.saveRelated();
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.remove_locations(LD.idOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    person.save();
    person.saveRelated();
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.add_locations(LD.unusedId);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.save();
    person.saveRelated();
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.remove_locations(LD.idTwo);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    person.save();
    person.saveRelated();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    person.add_locations(LD.anotherId);
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackRelated();
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('location_ids computed returns a flat list of ids for each location', (assert) => {
    let m2m, m2m_two, location, location_two, location_three, location_four;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
        person = store.push('person', {id: PD.idOne, person_location_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
        location = store.push('location', {id: LD.idOne, person_location_fks: [PERSON_LD.idOne]});
        location_two = store.push('location', {id: LD.idTwo, person_location_fks: [PERSON_LD.idTwo]});
        location_three = store.push('location', {id: LD.unusedId, person_location_fks: [PERSON_LD.idThree]});
        location_four = store.push('location', {id: LD.anotherId, person_location_fks: [PERSON_LD.idFour]});
    });
    assert.equal(person.get('locations').get('length'), 2);
    assert.deepEqual(person.get('location_ids'), [LD.idOne, LD.idTwo]);
    person.remove_locations(LD.idOne);
    assert.equal(person.get('locations').get('length'), 1);
    assert.deepEqual(person.get('location_ids'), [LD.idTwo]);
});
/*END PERSON LOCATION M2M*/

test('cleanup phone numbers works as expected on removal and save', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: PD.idOne});
    });
    let phone_numbers = store.find('phone-number');
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    run(function() {
        store.push('phonenumber', {id: second_phone_number.get('id'), removed: true});
    });
    assert.ok(person.get('phoneNumbersIsDirty'));
    assert.equal(person.get('phone_numbers').get('length'), 1);
    assert.equal(person.get('phone_numbers_all').get('length'), 2);
    assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
    person.cleanupPhoneNumberFKs();
    assert.deepEqual(person.get('phone_number_fks'), [PND.idOne]);
});

test('cleanup phone numbers works as expected on add and save', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.equal(person.get('phone_numbers').get('length'), 1);
    assert.equal(person.get('phone_numbers_all').get('length'), 1);
    run(function() {
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: PD.idOne});
    });
    second_phone_number.set('number', PND.numberTwo);
    assert.ok(person.get('phoneNumbersIsDirty'));
    assert.equal(person.get('phone_numbers').get('length'), 2);
    assert.equal(person.get('phone_numbers_all').get('length'), 2);
    assert.deepEqual(person.get('phone_number_fks'), [PND.idOne]);
    person.cleanupPhoneNumberFKs();
    assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
});

test('cleanup phone numbers works as expected on removal and rollback', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    run(function() {
        store.push('phonenumber', {id: second_phone_number.get('id'), removed: true});
    });
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.rollbackPhoneNumbers();
    assert.deepEqual(person.get('removed'), undefined);
});

test('cleanup phone numbers works as expected on add and rollback', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.equal(person.get('phone_numbers').get('length'), 1);
    assert.equal(person.get('phone_numbers_all').get('length'), 1);
    run(function() {
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: PD.idOne});
    });
    assert.ok(second_phone_number.get('invalid_number'));
    assert.equal(person.get('phone_numbers').get('length'), 2);
    assert.equal(person.get('phone_numbers_all').get('length'), 2);
    person.rollbackPhoneNumbers();
    assert.equal(person.get('phone_numbers').get('length'), 1);
    assert.equal(person.get('phone_numbers_all').get('length'), 1);
});

test('cleanup addresses works as expected on removal and save', (assert) => {
    let first_address, second_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    run(function() {
        store.push('address', {id: second_address.get('id'), removed: true});
    });
    assert.ok(person.get('addressesIsDirty'));
    assert.equal(person.get('addresses').get('length'), 1);
    assert.equal(person.get('addresses_all').get('length'), 2);
    assert.deepEqual(person.get('address_fks'), [AD.idOne, AD.idTwo]);
    person.cleanupAddressFKs();
    assert.deepEqual(person.get('address_fks'), [AD.idOne]);
});

test('cleanup addresses works as expected on add and save', (assert) => {
    let first_address, second_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    assert.equal(person.get('addresses').get('length'), 1);
    assert.equal(person.get('addresses_all').get('length'), 1);
    run(function() {
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    second_address.set('address', AD.streetTwo);
    assert.ok(person.get('addressesIsDirty'));
    assert.equal(person.get('addresses').get('length'), 2);
    assert.equal(person.get('addresses_all').get('length'), 2);
    assert.deepEqual(person.get('address_fks'), [AD.idOne]);
    person.cleanupAddressFKs();
    assert.deepEqual(person.get('address_fks'), [AD.idOne, AD.idTwo]);
});

test('cleanup addresses works as expected on removal and rollback', (assert) => {
    let first_address, second_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
        second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    run(function() {
        store.push('address', {id: second_address.get('id'), removed: true});
    });
    assert.ok(person.get('addressesIsDirty'));
    person.rollbackAddresses();
    assert.deepEqual(person.get('removed'), undefined);
});

test('cleanup addresses works as expected on add and rollback', (assert) => {
    let first_address, second_address;
    run(function() {
        person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: PD.idOne});
    });
    assert.ok(person.get('addressesIsNotDirty'));
    assert.equal(person.get('addresses').get('length'), 1);
    assert.equal(person.get('addresses_all').get('length'), 1);
    run(function() {
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: PD.idOne});
    });
    assert.ok(second_address.get('invalid_address'));
    assert.equal(person.get('addresses').get('length'), 2);
    assert.equal(person.get('addresses_all').get('length'), 2);
    person.rollbackAddresses();
    assert.equal(person.get('addresses').get('length'), 1);
    assert.equal(person.get('addresses_all').get('length'), 1);
});
