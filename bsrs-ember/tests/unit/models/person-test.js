import Ember from 'ember';
import {test, module} from 'qunit';
import CurrencyDefaults from 'bsrs-ember/vendor/defaults/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import PHONE_NUMBER_FIXTURES from 'bsrs-ember/vendor/phone_number_fixtures';
import PHONE_NUMBER_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';
import ADDRESS_FIXTURES from 'bsrs-ember/vendor/address_fixtures';
import ADDRESS_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import ADDRESS_DEFAULTS from 'bsrs-ember/vendor/defaults/address';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var container, registry, store;

module('unit: person test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:person', 'model:role', 'model:currency', 'model:phonenumber', 'model:address', 'model:location', 'model:person-location', 'service:currency']);
        store.push('currency', CurrencyDefaults);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('full_name property is a computed of first and last', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, first_name: PEOPLE_DEFAULTS.first_name, last_name: PEOPLE_DEFAULTS.last_name});
    assert.equal(person.get('full_name'), PEOPLE_DEFAULTS.first_name + ' ' + PEOPLE_DEFAULTS.last_name);
    person.set('first_name', 'wat');
    assert.equal(person.get('full_name'), 'wat ' + PEOPLE_DEFAULTS.last_name);
    person.set('last_name', 'man');
    assert.equal(person.get('full_name'), 'wat man');
});

test('related phone numbers are not dirty when no phone numbers present', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.unusedId});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related addresses are not dirty when no addresses present', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.unusedId});
    assert.ok(person.get('addressesIsNotDirty'));
});

test('related role should return first role or undefined', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.id]});
    var role = person.get('role');
    assert.equal(role.get('name'), ROLE_DEFAULTS.nameOne);
    role.set('people', [PEOPLE_DEFAULTS.unused]);
    assert.equal(person.get('role'), undefined);
});

test('related role is not dirty when no role present', (assert) => {
    store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.unusedId]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('roleIsNotDirty'));
    assert.equal(person.get('role'), undefined);
});

test('related role is not dirty with original role model', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('roleIsNotDirty'));
    role.set('name', ROLE_DEFAULTS.namePut);
    assert.ok(role.get('isDirty'));
    assert.ok(person.get('roleIsDirty'));
    var related = person.get('role');
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.namePut);
});

test('related role only returns the single matching item even when multiple roles exist', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.unusedId]});
    store.push('role', {id: ROLE_DEFAULTS.idTwo, people: ['123-abc-defg']});
    var role = person.get('role');
    assert.equal(role.get('id'), ROLE_DEFAULTS.idOne);
});

test('related role will update when the roles people array suddenly has the person pk', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.unusedId]});
    assert.equal(person.get('role'), undefined);
    role.set('people', [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.ok(person.get('role'));
    assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
});

test('related role will update when the roles people array suddenly removes the person', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]});
    assert.ok(person.get('role'));
    assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
    role.set('people', [PEOPLE_DEFAULTS.unusedId]);
    assert.equal(person.get('role'), undefined);
});

test('related phone numbers are not dirty with original phone number model', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related addresses are not dirty with original addresses model', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('addressesIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
});

test('related address model is dirty when address is dirty', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(address.get('isNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(address.get('isDirty'));
    assert.ok(person.get('addressesIsDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('person is dirty or related is dirty when model has been updated', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, username: PEOPLE_DEFAULTS.username, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.set('username', 'abc');
    assert.ok(person.get('isDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.set('username', PEOPLE_DEFAULTS.username);
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
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo]});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, number: PHONE_NUMBER_DEFAULTS.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, person_fk: PEOPLE_DEFAULTS.id});
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

test('savePhoneNumbers will remove any phone number model with no (valid) value', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo, PHONE_NUMBER_DEFAULTS.idThree]});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var third_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    third_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    first_phone_number.set('number', PHONE_NUMBER_DEFAULTS.numberOne);
    second_phone_number.set('number', PHONE_NUMBER_DEFAULTS.numberTwo);
    assert.equal(store.find('phonenumber').get('length'), 3);
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 2);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PHONE_NUMBER_DEFAULTS.idOne);
    assert.equal(store.find('phonenumber').objectAt(1).get('id'), PHONE_NUMBER_DEFAULTS.idTwo);
    first_phone_number.set('number', '');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 1);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PHONE_NUMBER_DEFAULTS.idTwo);
    second_phone_number.set('number', ' ');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 0);
});

test('saveAddresses will remove any address model with no (valid) value', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo, PHONE_NUMBER_DEFAULTS.idThree]});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var third_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    third_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    first_phone_number.set('number', PHONE_NUMBER_DEFAULTS.numberOne);
    second_phone_number.set('number', PHONE_NUMBER_DEFAULTS.numberTwo);
    assert.equal(store.find('phonenumber').get('length'), 3);
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 2);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PHONE_NUMBER_DEFAULTS.idOne);
    assert.equal(store.find('phonenumber').objectAt(1).get('id'), PHONE_NUMBER_DEFAULTS.idTwo);
    first_phone_number.set('number', '');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 1);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PHONE_NUMBER_DEFAULTS.idTwo);
    second_phone_number.set('number', ' ');
    person.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 0);
});

test('phoneNumbersDirty behaves correctly for phone numbers (newly) added', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo, PHONE_NUMBER_DEFAULTS.idThree]});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var third_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.equal(person.get('phone_numbers').get('length'), 3);
    first_phone_number.set('number', PHONE_NUMBER_DEFAULTS.numberOne);
    assert.ok(person.get('phoneNumbersIsDirty'));
    first_phone_number.set('number', '');
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});


test('phoneNumbersDirty behaves correctly for existing phone numbers', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.equal(person.get('phone_numbers').get('length'), 1);
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('number', PHONE_NUMBER_DEFAULTS.numberTwo);
    assert.ok(person.get('phoneNumbersIsDirty'));
    first_phone_number.set('number', '');
    assert.ok(person.get('phoneNumbersIsDirty'));
});

test('phoneNumbersIsDirty is false when a phone number is added but does not have a (valid) number', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    var third_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.equal(store.find('phonenumber').get('length'), 3);
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('addressesIsDirty behaves correctly for addresses(newly) added', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    var second_address = store.push('address', {id: ADDRESS_DEFAULTS.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, person: PEOPLE_DEFAULTS.id});
    var third_address = store.push('address', {id: ADDRESS_DEFAULTS.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, person: PEOPLE_DEFAULTS.id});
    assert.equal(person.get('addresses').get('length'), 3);
    assert.ok(person.get('addressesIsNotDirty'));
    first_address.set('address', ADDRESS_DEFAULTS.streetOne);
    assert.ok(person.get('addressesIsDirty'));
    first_address.set('address', '');
    assert.ok(person.get('addressesIsNotDirty'));
});

test('addressessDirty behaves correctly for existing address', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, address: ADDRESS_DEFAULTS.streetOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.equal(person.get('addresses').get('length'), 1);
    assert.ok(person.get('addressesIsNotDirty'));
    first_address.set('address', ADDRESS_DEFAULTS.streetTwo);
    assert.ok(person.get('addressesIsDirty'));
    first_address.set('address', '');
    assert.ok(person.get('addressesIsDirty'));
});

test('addressesIsDirty is false when an address is added but does not have a (valid) address', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    var second_address = store.push('address', {id: ADDRESS_DEFAULTS.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, person: PEOPLE_DEFAULTS.id});
    var third_address = store.push('address', {id: ADDRESS_DEFAULTS.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, person: PEOPLE_DEFAULTS.id});
    assert.equal(store.find('address').get('length'), 3);
    assert.ok(person.get('addressesIsNotDirty'));
    assert.equal(store.find('address').get('length'), 3);
});

test('save related will iterate over each address and save that model', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, address: ADDRESS_DEFAULTS.streetOne,  type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    var second_address = store.push('address', {id: ADDRESS_DEFAULTS.idTwo, address: ADDRESS_DEFAULTS.streetTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, person: PEOPLE_DEFAULTS.id});
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

test('rollback related will iterate over each phone number and rollback that model', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo]});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, number: PHONE_NUMBER_DEFAULTS.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, person_fk: PEOPLE_DEFAULTS.id});
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
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    var second_address = store.push('address', {id: ADDRESS_DEFAULTS.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, person: PEOPLE_DEFAULTS.id});
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

test('sco when new phone number is added, the person model is not dirty unless number is altered', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    var phone_number_two = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    phone_number_two.set('number', '888-888-8888');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number_two.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '999-999-9999');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when new address is added, the person model is not dirty unless address is altered', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('addressesIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var address_two = store.push('address', {id: ADDRESS_DEFAULTS.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address_two.set('address', '123 Mexico');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    address_two.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', 'Big Sky Parkway');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when new phone number is added, the person model is dirty when the type or number attrs are modified', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var phone_number_two = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
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

test('when new phone number is added after render, the person model is not dirty when a new phone number is appended to the array of phone numbers', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var phonenumbers = person.get('phone_numbers');
    var added_phone_num = phonenumbers.push({id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when new address is added after render, the person model is not dirty when new address is appended to the array of addresses', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var addresses = person.get('addresses');
    var added_address = addresses.push({id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when phone number is removed after render, the person model is dirty (two phone numbers)', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo]});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var phonenumbers = person.get('phone_numbers');
    phonenumbers.remove(PHONE_NUMBER_DEFAULTS.idOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when address is removed after render, the person model is dirty', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var address = store.push('address', {id: ADDRESS_DEFAULTS.idOne, address: ADDRESS_DEFAULTS.streetOne, city: ADDRESS_DEFAULTS.cityOne, state: ADDRESS_DEFAULTS.stateOne, postal_code: ADDRESS_DEFAULTS.zipOne,
                             type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var addresses = person.get('addresses');
    addresses.remove(ADDRESS_DEFAULTS.idOne);
    assert.ok(person.get('isNotDirty'));
    person.set('dirtyModel', true);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when no phone number and new phone number is added and updated, expect isDirty or Related to be true', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '888-888-8888');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when no address and new address is added and updated, expect isDirty or Related to be true', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('address', {id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    var address = store.push('address', {id: ADDRESS_DEFAULTS.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    address.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', '123 Baja');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when person role is changed dirty tracking works as expected', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    role.set('name', ROLE_DEFAULTS.namePut);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    role.rollback();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    role.set('name', ROLE_DEFAULTS.namePut);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    role.rollback();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when person has role suddenly assigned it shows as a dirty relationship (starting undefined)', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.namePut, people: undefined});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    role.set('people', [PEOPLE_DEFAULTS.id]);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when person has role suddently assigned it shows as a dirty relationship (starting empty array)', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.namePut, people: []});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    role.set('people', [PEOPLE_DEFAULTS.id]);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when person has role suddently assigned it shows as a dirty relationship (starting with legit value)', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.namePut, people: [PEOPLE_DEFAULTS.unusedId]});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    role.set('people', [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when person has role suddently removed it shows as a dirty relationship', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.namePut, people: [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    role.set('people', [PEOPLE_DEFAULTS.unusedId]);
    role.save();
    assert.equal(person.get('role'), undefined);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('rollback role will reset the previously used role when switching from valid role to nothing', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idTwo});
    var guest_role = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]});
    var admin_role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.unusedId]});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.nameTwo);
    guest_role.set('people', [PEOPLE_DEFAULTS.unusedId]);
    guest_role.save();
    admin_role.set('people', [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.save();
    person.saveRelated();
    admin_role.set('people', [PEOPLE_DEFAULTS.unusedId]);
    admin_role.save();
    assert.equal(person.get('role'), undefined);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackRole();
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback role will reset the previously used role when switching from one role to another', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idTwo});
    var guest_role = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]});
    var admin_role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.unusedId]});
    var another_role = store.push('role', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3', name: 'another', people: [PEOPLE_DEFAULTS.unusedId]});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.nameTwo);
    guest_role.set('people', [PEOPLE_DEFAULTS.unusedId]);
    guest_role.save();
    admin_role.set('people', [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.save();
    person.saveRelated();
    admin_role.set('people', [PEOPLE_DEFAULTS.unusedId]);
    admin_role.save();
    another_role.set('people', [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.equal(person.get('role.name'), 'another');
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackRelated();
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_role.get('people'), [PEOPLE_DEFAULTS.unusedId]);
    assert.deepEqual(admin_role.get('people'), [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.ok(another_role.get('isNotDirty'));
    assert.ok(admin_role.get('isNotDirty'));
    admin_role.set('people', [PEOPLE_DEFAULTS.unusedId]);
    admin_role.save();
    another_role.set('people', [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.equal(person.get('role.name'), 'another');
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackRelated();
    assert.equal(person.get('role.name'), ROLE_DEFAULTS.nameOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_role.get('people'), [PEOPLE_DEFAULTS.unusedId]);
    assert.deepEqual(admin_role.get('people'), [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.ok(another_role.get('isNotDirty'));
    assert.ok(admin_role.get('isNotDirty'));
});

//TODO: deserializer should create a joining model for each location found on person
//TODO: test drive how this works on location if/when it's required
test('locations property should return all associated locations or empty array', (assert) => {
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    store.push('person-location', {id: m2m.get('id'), removed: true});
    assert.equal(person.get('locations').get('length'), 0);
});

test('locations property is not dirty when no location present (undefined)', (assert) => {
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: undefined});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: undefined});
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty when no location present (empty array)', (assert) => {
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: []});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: []});
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty with original location model', (assert) => {
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('locationsIsNotDirty'));
    location.set('name', LOCATION_DEFAULTS.storeNameTwo);
    assert.ok(location.get('isDirty'));
    assert.ok(person.get('locationsIsDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('name'), LOCATION_DEFAULTS.storeNameTwo);
});

test('locations property only returns the single matching item even when multiple locations exist', (assert) => {
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idThree, person_pk: PEOPLE_DEFAULTS.unusedId, location_pk: LOCATION_DEFAULTS.idOne});
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idThree]});
    var locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('id'), LOCATION_DEFAULTS.idTwo);
});

test('locations property returns multiple matching items when multiple locations exist', (assert) => {
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]});
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var locations = person.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('id'), LOCATION_DEFAULTS.idOne);
    assert.equal(locations.objectAt(1).get('id'), LOCATION_DEFAULTS.idTwo);
});

test('locations property will update when the m2m array suddenly has the person pk (starting w/ empty array)', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: []});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: []});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, person_location_fks: []});
    assert.equal(person.get('locations').get('length'), 0);
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), LOCATION_DEFAULTS.idOne);
});

test('locations property will update when the m2m array suddenly has the person pk', (assert) => {
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, person_location_fks: []});
    assert.equal(person.get('locations').get('length'), 1);
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    assert.equal(person.get('locations').get('length'), 2);
    assert.equal(person.get('locations').objectAt(0).get('id'), LOCATION_DEFAULTS.idOne);
    assert.equal(person.get('locations').objectAt(1).get('id'), LOCATION_DEFAULTS.idTwo);
});

test('locations property will update when the m2m array suddenly removes the person', (assert) => {
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations').get('length'), 1);
    store.push('person-location', {id: m2m.get('id'), removed: true});
    assert.equal(person.get('locations').get('length'), 0);
});

test('when location is changed dirty tracking works as expected', (assert) => {
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', LOCATION_DEFAULTS.storeName);
    assert.ok(location.get('isDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    location.rollback();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', LOCATION_DEFAULTS.storeNameTwo);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    location.rollback();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting undefined)', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: undefined});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: undefined});
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting with an empty array)', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: []});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: []});
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('locationsIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting with legit value)', (assert) => {
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, person_location_fks: []});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('locationsIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently removed it shows as a dirty relationship', (assert) => {
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: m2m.get('id'), removed: true});
    assert.equal(person.get('locations').get('length'), 0);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: m2m.get('id'), removed: true});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('rollback location will reset the previously used locations when switching from valid locations to nothing', (assert) => {
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var m2m_two = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: m2m.get('id'), removed: true});
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.rollback();
    person.rollbackLocations();
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: m2m.get('id'), removed: true});
    store.push('person-location', {id: m2m_two.get('id'), removed: true});
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
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var m2m_two = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
    var location_three = store.push('location', {id: LOCATION_DEFAULTS.unusedId, person_location_fks: [PERSON_LOCATION_DEFAULTS.idThree]});
    var location_four = store.push('location', {id: LOCATION_DEFAULTS.anotherId, person_location_fks: [PERSON_LOCATION_DEFAULTS.idFour]});
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', 'watwat');
    person.save();
    person.saveRelated();
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: m2m.get('id'), removed: true});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    person.save();
    person.saveRelated();
    assert.equal(person.get('locations').get('length'), 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    var m2m_three = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idThree, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.unusedId});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.save();
    person.saveRelated();
    assert.equal(person.get('locations').get('length'), 2);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    store.push('person-location', {id: m2m_two.get('id'), removed: true});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    person.save();
    person.saveRelated();
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('locations').get('length'), 1);
    var m2m_four = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idFour, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.anotherId});
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
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var m2m_two = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
    var location_three = store.push('location', {id: LOCATION_DEFAULTS.unusedId, person_location_fks: [PERSON_LOCATION_DEFAULTS.idThree]});
    var location_four = store.push('location', {id: LOCATION_DEFAULTS.anotherId, person_location_fks: [PERSON_LOCATION_DEFAULTS.idFour]});
    assert.equal(person.get('locations').get('length'), 2);
    assert.deepEqual(person.get('location_ids'), [LOCATION_DEFAULTS.idOne, LOCATION_DEFAULTS.idTwo]);
    store.push('person-location', {id: m2m.get('id'), removed: true});
    assert.equal(person.get('locations').get('length'), 1);
    assert.deepEqual(person.get('location_ids'), [LOCATION_DEFAULTS.idTwo]);
});
