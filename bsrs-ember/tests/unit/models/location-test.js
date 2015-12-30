import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LD from 'bsrs-ember/vendor/defaults/location';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PHONE_NUMBER_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import AF from 'bsrs-ember/vendor/address_fixtures';
import ADDRESS_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import AD from 'bsrs-ember/vendor/defaults/address';

var store, location, run = Ember.run;

module('toran unit: location test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level', 'model:location-status', 'model:address', 'model:phonenumber', 'service:i18n']);
    }
});

test('related location-level should return first location-level or undefined', (assert) => {
    run(function() {
        location = store.push('location', {id: LD.idOne});
        store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
    });
    var location_level = location.get('location_level');
    assert.equal(location_level.get('name'), LLD.nameCompany);
    run(function() {
        store.push('location-level', {id: location_level.get('id'), locations: [LD.unused]});
    });
    assert.equal(location.get('location_level'), undefined);
});

test('related location-level is not dirty when no location-level present', (assert) => {
    run(function() {
        store.push('location-level', {id: LLD.idOne, locations: [LD.unusedId]});
        location = store.push('location', {id: LD.idOne});
    });
    assert.ok(location.get('locationLevelIsNotDirty'));
    assert.equal(location.get('location-level'), undefined);
});

test('related location-level is not dirty with original location-level model and changing location level will not affect location isDirty', (assert) => {
    let location_level;
    run(function() {
        location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
        location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idOne});
    });
    assert.ok(location.get('locationLevelIsNotDirty'));
    location_level.set('name', LLD.nameDepartment);
    assert.ok(location_level.get('isDirty'));
    assert.ok(location.get('locationLevelIsNotDirty'));
    assert.equal(location.get('location_level.name'), LLD.nameDepartment);
});

test('related location-level only returns the single matching item even when multiple location-levels exist', (assert) => {
    run(function() {
        location = store.push('location', {id: LD.idOne});
        store.push('location-level', {id: LLD.idOne, locations: [LD.idOne, LD.unusedId]});
        store.push('location-level', {id: LLD.idTwo, locations: ['123-abc-defg']});
    });
    var location_level = location.get('location_level');
    assert.equal(location_level.get('id'), LLD.idOne);
});

test('related location-level will update when the location-levels locations array suddenly has the location pk', (assert) => {
    let location_level;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.unusedId]});
    });
    assert.equal(location.get('location_level'), undefined);
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('location_level'));
    assert.equal(location.get('location_level.id'), LLD.idOne);
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting undefined)', (assert) => {
    let location_level;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: undefined});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting empty array)', (assert) => {
    let location_level;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: []});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting with legit value)', (assert) => {
    let location_level;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: [LD.unusedId]});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('rollback location-level will reset the previously used location-level when switching from one location-level to another', (assert) => {
    let guest_location_level, admin_location_level, another_location_level;
    run(function() {
        location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idTwo});
        guest_location_level = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDistrict, locations: [LD.unusedId, LD.idOne]});
        admin_location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.unusedId]});
        another_location_level = store.push('location-level', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e12c4', name: 'another', locations: [LD.unusedId]});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('location_level.name'), LLD.nameDistrict);
    location.change_location_level(admin_location_level.get('id'));
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.save();
    location.saveRelated();
    location.change_location_level(another_location_level.get('id'));
    assert.equal(location.get('location_level.name'), 'another');
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackRelated();
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_location_level.get('locations'), [LD.unusedId]);
    assert.deepEqual(admin_location_level.get('locations'), [LD.unusedId, LD.idOne]);
    assert.ok(another_location_level.get('isNotDirty'));
    assert.ok(admin_location_level.get('isNotDirty'));
    location.change_location_level(another_location_level.get('id'));
    assert.equal(location.get('location_level.name'), 'another');
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackRelated();
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_location_level.get('locations'), [LD.unusedId]);
    assert.deepEqual(admin_location_level.get('locations'), [LD.unusedId, LD.idOne]);
    assert.ok(another_location_level.get('isNotDirty'));
    assert.ok(admin_location_level.get('isNotDirty'));
});

/*LOCATION TO STATUS*/
test('location is dirty or related is dirty when existing status is altered', (assert) => {
    run(function() {
        location = store.push('location', {id: LD.idOne, status_fk: LDS.openId});
        store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
        store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
    });
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_status(LDS.closedId);
    assert.equal(location.get('status.id'), LDS.closedId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('location is dirty or related is dirty when existing status is altered (starting w/ nothing)', (assert) => {
    run(function() {
        location = store.push('location', {id: LD.idOne, status_fk: undefined});
        store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: []});
    });
    assert.equal(location.get('status'), undefined);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_status(LDS.openId);
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('rollback status will revert and reboot the dirty status to clean', (assert) => {
    run(function() {
        location = store.push('location', {id: LD.idOne, status_fk: LDS.openId});
        store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
        store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
    });
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_status(LDS.closedId);
    assert.equal(location.get('status.id'), LDS.closedId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollbackRelated();
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_status(LDS.closedId);
    assert.equal(location.get('status.id'), LDS.closedId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.saveRelated();
    assert.equal(location.get('status.id'), LDS.closedId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('status property returns associated object or undefined', (assert) => {
    run(function() {
        location = store.push('location', {id: LD.idOne});
        store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
    });
    let status = location.get('status');
    assert.equal(status.get('id'), LDS.openId);
    assert.equal(status.get('name'), LDS.openName);
    run(function() {
        store.push('location-status', {id: status.get('id'), locations: []});
    });
    status = location.get('status');
    assert.equal(status, undefined);
});

test('change_status will append the location id to the new status locations array', function(assert) {
    let status;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        status = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [9]});
    });
    location.change_status(LDS.openId);
    assert.deepEqual(status.get('locations'), [9, LD.idOne]);
});

test('change_status will remove the location id from the prev status locations array', function(assert) {
    let status;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        status = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [9, LD.idOne]});
        store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
    });
    assert.deepEqual(status.get('locations'), [9, LD.idOne]);
    assert.deepEqual(location.get('status.id'), LDS.openId);
    location.change_status(LDS.closedId);
    assert.deepEqual(status.get('locations'), [9]);
});

test('status will save correctly as undefined', (assert) => {
    run(function() {
        location = store.push('location', {id: LD.idOne, status_fk: undefined});
        store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: []});
    });
    location.saveRelated();
    let status = location.get('status');
    assert.equal(location.get('status_fk'), undefined);
});

/* PHONE NUMBERS AND ADDRESSES */
test('related phone numbers are not dirty with original phone number model', (assert) => {
    let phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('phoneNumbersIsNotDirty'));
});

test('related addresses are not dirty with original addresses model', (assert) => {
    let address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('addressesIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', (assert) => {
    let phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(location.get('phoneNumbersIsDirty'));
});

test('related address model is dirty when address is dirty (and address is not newly added)', (assert) => {
    let address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('addressesIsNotDirty'));
    assert.ok(address.get('isNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(address.get('isDirty'));
    assert.ok(location.get('addressesIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('location is dirty or related is dirty when model has been updated', (assert) => {
    let phone_number, address;
    run(function() {
        store.clear('location');
        location = store.push('location', {id: LD.idOne, name: LD.name, phone_number_fks: [PND.idOne], address_fks: [AD.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    assert.ok(location.get('addressesIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', 'abc');
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.set('name', LD.nameOne);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(location.get('phoneNumbersIsDirty'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(!location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(address.get('isDirty'));
    assert.ok(location.get('addressesIsDirty'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('addressesIsNotDirty'));
    assert.ok(address.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(!location.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('save related will iterate over each phone number and save that model', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: LD.idOne});
    });
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(location.get('phoneNumbersIsDirty'));
    location.savePhoneNumbers();
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('phoneNumbersIsDirty'));
    location.savePhoneNumbers();
    assert.ok(location.get('phoneNumbersIsNotDirty'));
});

test('save related will iterate over each address and save that model', (assert) => {
    let first_address, second_address;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
    });
    assert.ok(location.get('addressesIsNotDirty'));
    first_address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(location.get('addressesIsDirty'));
    location.saveAddresses();
    assert.ok(location.get('addressesIsNotDirty'));
    second_address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('addressesIsDirty'));
    location.saveAddresses();
    assert.ok(location.get('addressesIsNotDirty'));
});

test('savePhoneNumbers will remove any phone number model with no (valid) value', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    third_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    first_phone_number.set('number', PND.numberOne);
    second_phone_number.set('number', PND.numberTwo);
    assert.equal(store.find('phonenumber').get('length'), 3);
    location.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 2);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idOne);
    assert.equal(store.find('phonenumber').objectAt(1).get('id'), PND.idTwo);
    first_phone_number.set('number', '');
    location.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 1);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idTwo);
    second_phone_number.set('number', ' ');
    location.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 0);
});

test('saveAddresses will remove any address model with no (valid) value', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    third_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    first_phone_number.set('number', PND.numberOne);
    second_phone_number.set('number', PND.numberTwo);
    assert.equal(store.find('phonenumber').get('length'), 3);
    location.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 2);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idOne);
    assert.equal(store.find('phonenumber').objectAt(1).get('id'), PND.idTwo);
    first_phone_number.set('number', '');
    location.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 1);
    assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idTwo);
    second_phone_number.set('number', ' ');
    location.savePhoneNumbers();
    assert.equal(store.find('phonenumber').get('length'), 0);
});

test('phoneNumbersDirty behaves correctly for phone numbers (newly) added', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.equal(location.get('phone_numbers').get('length'), 3);
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('number', PND.numberOne);
    assert.ok(location.get('phoneNumbersIsDirty'));
    first_phone_number.set('number', '');
    assert.ok(location.get('phoneNumbersIsNotDirty'));
});

test('addressesIsDirty behaves correctly for addresses (newly) added', (assert) => {
    let first_address, second_address, third_address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
        first_address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
        third_address = store.push('address', {id: AD.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
    });
    assert.equal(location.get('addresses').get('length'), 3);
    assert.ok(location.get('addressesIsNotDirty'));
    first_address.set('address', AD.streetOne);
    assert.ok(location.get('addressesIsDirty'));
    first_address.set('address', '');
    assert.ok(location.get('addressesIsNotDirty'));
});

test('phoneNumbersDirty behaves correctly for existing phone numbers', (assert) => {
    let first_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.equal(location.get('phone_numbers').get('length'), 1);
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('number', PND.numberTwo);
    assert.ok(location.get('phoneNumbersIsDirty'));
    first_phone_number.set('number', '');
    assert.ok(location.get('phoneNumbersIsDirty'));
});

test('addressesDirty behaves correctly for existing addresses', (assert) => {
    let first_address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.equal(location.get('addresses').get('length'), 1);
    assert.ok(location.get('addressesIsNotDirty'));
    first_address.set('address', AD.streetTwo);
    assert.ok(location.get('addressesIsDirty'));
    first_address.set('address', '');
    assert.ok(location.get('addressesIsDirty'));
});

test('phoneNumbersIsDirty is false when a phone number is added but does not have a (valid) number', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.equal(store.find('phonenumber').get('length'), 3);
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    assert.equal(store.find('phonenumber').get('length'), 3);
});

test('addressesIsDirty is false when an address is added but does not have a (valid) address', (assert) => {
    let first_address, second_address, third_address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
        first_address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
        third_address = store.push('address', {id: AD.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
    });
    assert.equal(store.find('address').get('length'), 3);
    assert.ok(location.get('addressesIsNotDirty'));
    assert.equal(store.find('address').get('length'), 3);
});

test('phoneNumbersIsDirty is false when a phone number is added but does not have a (valid) number without phone_number_fks', (assert) => {
    let first_phone_number, second_phone_number, third_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: []});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.equal(store.find('phonenumber').get('length'), 3);
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    assert.equal(store.find('phonenumber').get('length'), 3);
});

test('addressesIsDirty is false when an address is added but does not have a (valid) address without address_fks', (assert) => {
    let first_address, second_address, third_address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: []});
        first_address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
        third_address = store.push('address', {id: AD.idThree, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
    });
    assert.equal(store.find('address').get('length'), 3);
    assert.ok(location.get('addressesIsNotDirty'));
    assert.equal(store.find('address').get('length'), 3);
});

test('rollback related will iterate over each phone number and rollback that model', (assert) => {
    let first_phone_number, second_phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId, model_fk: LD.idOne});
    });
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(location.get('phoneNumbersIsDirty'));
    location.rollbackRelated();
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('phoneNumbersIsDirty'));
    location.rollbackRelated();
    assert.ok(location.get('phoneNumbersIsNotDirty'));
});

test('rollback related will iterate over each address and rollback that model', (assert) => {
    let first_address, second_address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo]});
        first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ADDRESS_TYPES_DEFAULTS.shippingId, model_fk: LD.idOne});
    });
    assert.ok(location.get('addressesIsNotDirty'));
    first_address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(location.get('addressesIsDirty'));
    assert.ok(first_address.get('isDirty'));
    location.rollbackRelated();
    assert.ok(location.get('addressesIsNotDirty'));
    second_address.set('type', ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(second_address.get('isDirty'));
    location.rollbackRelated();
    assert.ok(location.get('addressesIsNotDirty'));
});

test('when new phone number is added, the location model is not dirty unless number is altered', (assert) => {
    let phone_number, phone_number_two;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    assert.ok(location.get('isNotDirty'));
    run(function() {
        phone_number_two = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number_two.set('number', '888-888-8888');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    phone_number_two.rollback();
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '999-999-9999');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when new address is added, the location model is not dirty unless address is altered', (assert) => {
    let address, address_two;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('addressesIsNotDirty'));
    assert.ok(location.get('isNotDirty'));
    run(function() {
        address_two = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address_two.set('address', '123 Mexico');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    address_two.rollback();
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', 'Big Sky Parkway');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when new phone number is added, the location model is dirty when the type or number attrs are modified', (assert) => {
    let phone_number, phone_number_two;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('phoneNumbersIsNotDirty'));
    assert.ok(location.get('isNotDirty'));
    run(function() {
        phone_number_two = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number_two.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    phone_number_two.rollback();
    assert.equal(phone_number_two.get('type'), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '5');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(phone_number.get('number'), '5');
});

test('when new address is added, the location model is not dirty when the type or address attrs are modified', (assert) => {
    let address, address_two;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('addressesIsNotDirty'));
    assert.ok(location.get('isNotDirty'));
    run(function() {
        address_two = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address_two.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    address_two.rollback();
    assert.equal(address_two.get('type'), ADDRESS_TYPES_DEFAULTS.officeId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', 'Big Sky Parkway');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.ok(address.get('address'),'Big Sky Parkway');
});

test('when new phone number is added after render, the location model is not dirty when a new phone number is appended to the array of phone numbers', (assert) => {
    let added_phone_num;
    run(function() {
        location = store.push('location', {id: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('isNotDirty'));
    let phonenumbers = location.get('phone_numbers');
    run(function() {
        added_phone_num = phonenumbers.push({id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('when new address is added after render, the location model is not dirty when new address is appended to the array of addresses', (assert) => {
    let added_address;
    run(function() {
        location = store.push('location', {id: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('isNotDirty'));
    let addresses = location.get('addresses');
    run(function() {
        added_address = addresses.push({id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('when phone number is removed after render, the location model is dirty (two phone numbers)', (assert) => {
    let phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
        phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('isNotDirty'));
    let phonenumbers = location.get('phone_numbers');
    run(function() {
        phonenumbers.remove(PND.idOne);
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when address is removed after render, the location model is dirty (two addresses)', (assert) => {
    let address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo]});
        address = store.push('address', {id: AD.idOne, address: AD.streetOne, city: AD.cityOne, state: AD.stateOne, postal_code: AD.zipOne,
                                 type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
        store.push('address', {id: AD.idTwo, address: AD.streetTwo, city: AD.cityTwo, state: AD.stateTwo, postal_code: AD.zipOne,
                                 type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('isNotDirty'));
    let addresses = location.get('addresses');
    run(function() {
        addresses.remove(AD.idOne);
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when no phone number and new phone number is added and updated, expect related isDirty to be true', (assert) => {
    let phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne]});
        store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    run(function() {
        phone_number = store.push('phonenumber', {id: PND.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    phone_number.rollback();
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '888-888-8888');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when no address and new address is added and updated, expect related isDirty to be true', (assert) => {
    let address;
    run(function() {
        location = store.push('location', {id: LD.idOne});
        store.push('address', {id: AD.idOne, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    run(function() {
        address = store.push('address', {id: AD.idTwo, type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address.set('type', ADDRESS_TYPES_DEFAULTS.shippingId);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    address.rollback();
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    address.set('address', '123 Baja');
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when phone number is removed after render, the location model is dirty', (assert) => {
    let phone_number;
    run(function() {
        location = store.push('location', {id: LD.idOne, phone_number_fks: [PND.idOne]});
        phone_number = store.push('phonenumber', {id: PND.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('isNotDirty'));
    run(function() {
        store.push('phonenumber', {id: phone_number.get('id'), removed: true});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when address is removed after render, the location model is dirty', (assert) => {
    let address;
    run(function() {
        location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
        address = store.push('address', {id: AD.idOne, address: AD.streetOne, city: AD.cityOne, state: AD.stateOne, postal_code: AD.zipOne,
                                 type: ADDRESS_TYPES_DEFAULTS.officeId, model_fk: LD.idOne});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('isNotDirty'));
    run(function() {
        store.push('address', {id: address.get('id'), removed: true});
    });
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});
