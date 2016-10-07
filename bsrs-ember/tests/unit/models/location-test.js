import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LCD from 'bsrs-ember/vendor/defaults/location-children';
import LPD from 'bsrs-ember/vendor/defaults/location-parents';
import LD from 'bsrs-ember/vendor/defaults/location';
import LPHD from 'bsrs-ember/vendor/defaults/location-join-phonenumber';
import LEMD from 'bsrs-ember/vendor/defaults/location-join-email';
import LADD from 'bsrs-ember/vendor/defaults/location-join-address';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import ED from 'bsrs-ember/vendor/defaults/email';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import AF from 'bsrs-ember/vendor/address_fixtures';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import AD from 'bsrs-ember/vendor/defaults/address';

var store;

module('unit: location test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:location', 'model:location-level', 'model:location-status', 'model:address', 'model:address-type', 'model:phonenumber', 'model:location-join-phonenumber', 'model:location-join-email', 'model:location-join-address', 'model:phone-number-type', 'service:i18n', 'model:email', 'model:email-type', 'model:location-children', 'model:location-parents']);
  }
});

test('related location-level should return first location-level or undefined', (assert) => {
  let location = store.push('location', {id: LD.idOne});
  store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
  var location_level = location.get('location_level');
  assert.equal(location_level.get('name'), LLD.nameCompany);
  run(() => {
    store.push('location-level', {id: location_level.get('id'), locations: [LD.unused]});
  });
  assert.equal(location.get('location_level'), undefined);
});

test('related location-level is not dirty when no location-level present', (assert) => {
  store.push('location-level', {id: LLD.idOne, locations: [LD.unusedId]});
  let location = store.push('location', {id: LD.idOne});
  assert.ok(location.get('locationLevelIsNotDirty'));
  assert.equal(location.get('location-level'), undefined);
});

test('related location-level is not dirty with original location-level model and changing location level will not affect location isDirty', (assert) => {
  let location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
  let location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idOne});
  assert.ok(location.get('locationLevelIsNotDirty'));
  location_level.set('name', LLD.nameDepartment);
  assert.ok(location_level.get('isDirty'));
  assert.ok(location.get('locationLevelIsNotDirty'));
  assert.equal(location.get('location_level.name'), LLD.nameDepartment);
});

test('related location-level only returns the single matching item even when multiple location-levels exist', (assert) => {
  let location = store.push('location', {id: LD.idOne});
  store.push('location-level', {id: LLD.idOne, locations: [LD.idOne, LD.unusedId]});
  store.push('location-level', {id: LLD.idTwo, locations: ['123-abc-defg']});
  var location_level = location.get('location_level');
  assert.equal(location_level.get('id'), LLD.idOne);
});

test('related location-level will update when the location-levels locations array suddenly has the location pk', (assert) => {
  let location = store.push('location', {id: LD.idOne});
  let location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.unusedId]});
  assert.equal(location.get('location_level'), undefined);
  location.change_location_level(location_level.get('id'));
  assert.ok(location.get('location_level'));
  assert.equal(location.get('location_level.id'), LLD.idOne);
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting undefined)', (assert) => {
  let location = store.push('location', {id: LD.idOne});
  let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: undefined});
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.change_location_level(location_level.get('id'));
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting empty array)', (assert) => {
  let location = store.push('location', {id: LD.idOne});
  let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: []});
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.change_location_level(location_level.get('id'));
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting with legit value)', (assert) => {
  let location = store.push('location', {id: LD.idOne});
  let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: [LD.unusedId]});
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.change_location_level(location_level.get('id'));
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('rollback location-level will reset the previously used location-level when switching from one location-level to another', (assert) => {
  let location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idTwo});
  let guest_location_level = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDistrict, locations: [LD.unusedId, LD.idOne]});
  let admin_location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.unusedId]});
  let another_location_level = store.push('location-level', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e12c4', name: 'another', locations: [LD.unusedId]});
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
  location.rollback();
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
  location.rollback();
  assert.equal(location.get('location_level.name'), LLD.nameCompany);
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.deepEqual(another_location_level.get('locations'), [LD.unusedId]);
  assert.deepEqual(admin_location_level.get('locations'), [LD.unusedId, LD.idOne]);
  assert.ok(another_location_level.get('isNotDirty'));
  assert.ok(admin_location_level.get('isNotDirty'));
});

test('parent and child locations will be removed when change llevel', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne, LCD.idTwo], location_parents_fks: [LPD.idOne]});
  let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: [LD.unusedId]});
  store.push('location', {id: LD.idTwo});
  store.push('location', {id: LD.idThree});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  store.push('location-children', {id: LCD.idTwo, location_pk: LD.idOne, children_pk: LD.idThree});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  assert.equal(location.get('location_children').get('length'), 2);
  assert.equal(location.get('location_children').objectAt(0).get('id'), LCD.idOne);
  assert.equal(location.get('location_children').objectAt(1).get('id'), LCD.idTwo);
  assert.equal(location.get('children_ids').get('length'), 2);
  assert.equal(location.get('children').get('length'), 2);
  assert.equal(location.get('children').objectAt(0).get('id'), LD.idTwo);
  assert.equal(location.get('children').objectAt(1).get('id'), LD.idThree);
  assert.equal(location.get('location_parents').get('length'), 1);
  assert.equal(location.get('location_parents').objectAt(0).get('id'), LPD.idOne);
  assert.equal(location.get('parents').get('length'), 1);
  assert.equal(location.get('parents').objectAt(0).get('id'), LD.idTwo);
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.change_location_level(location_level.get('id'));
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  assert.equal(location.get('children').get('length'), 0);
  assert.equal(location.get('parents').get('length'), 0);
  location.saveRelated();
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

/*LOCATION TO STATUS*/
test('location is dirty or related is dirty when existing status is altered', (assert) => {
  let location = store.push('location', {id: LD.idOne, status_fk: LDS.openId});
  store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
  store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
  assert.equal(location.get('status.id'), LDS.openId);
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.change_status(LDS.closedId);
  assert.equal(location.get('status.id'), LDS.closedId);
  assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('location is dirty or related is dirty when existing status is altered (starting w/ nothing)', (assert) => {
  let location = store.push('location', {id: LD.idOne, status_fk: undefined});
  store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: []});
  assert.equal(location.get('status'), undefined);
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.change_status(LDS.openId);
  assert.equal(location.get('status.id'), LDS.openId);
  assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('rollback status will revert and reboot the dirty status to clean', (assert) => {
  let location = store.push('location', {id: LD.idOne, status_fk: LDS.openId});
  store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
  store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
  assert.equal(location.get('status.id'), LDS.openId);
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.change_status(LDS.closedId);
  assert.equal(location.get('status.id'), LDS.closedId);
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  location.rollback();
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
  let location = store.push('location', {id: LD.idOne});
  store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
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
  let location = store.push('location', {id: LD.idOne});
  let status = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [9]});
  location.change_status(LDS.openId);
  assert.deepEqual(status.get('locations'), [9, LD.idOne]);
});

test('change_status will remove the location id from the prev status locations array', function(assert) {
  let location = store.push('location', {id: LD.idOne});
  let status = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [9, LD.idOne]});
  store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
  assert.deepEqual(status.get('locations'), [9, LD.idOne]);
  assert.deepEqual(location.get('status.id'), LDS.openId);
  location.change_status(LDS.closedId);
  assert.deepEqual(status.get('locations'), [9]);
});

test('status will save correctly as undefined', (assert) => {
  let location = store.push('location', {id: LD.idOne, status_fk: undefined});
  store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: []});
  location.saveRelated();
  let status = location.get('status');
  assert.equal(location.get('status_fk'), undefined);
});

/* PHONE NUMBERS */
test('related phone numbers are not dirty with original phone number model', (assert) => {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne]});
    store.push('phonenumber', { id: PND.idOne, number: PND.numberOne, type: PNTD.officeId });
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
  });
  assert.equal(location.get('phonenumbers').get('length'), 1);
  assert.equal(location.get('location_phonenumbers_ids').get('length'), 1);
  assert.equal(location.get('location_phonenumbers_ids')[0], LPHD.idOne);
  assert.equal(location.get('location_phonenumbers_fks')[0], LPHD.idOne);
  assert.ok(location.get('phonenumbersIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', (assert) => {
  let phone_number, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne]});
    phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.idOne});
    store.push('phone-number-type', {id: PNTD.idOne, phonenumbers: [PND.idOne]});
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
  });
  assert.ok(phone_number.get('isNotDirty'));
  assert.ok(location.get('phonenumbersIsNotDirty'));
  phone_number.change_phone_number_type({id: PNTD.idTwo});
  assert.ok(phone_number.get('phoneNumberTypeIsDirty'));
  assert.ok(location.get('phonenumbersIsDirty'));
});

test('save related will iterate over each phone number and save that model', (assert) => {
  let first_phone_number, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne, LPHD.idTwo]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
    store.push('location-join-phonenumber', {id: LPHD.idTwo, phonenumber_pk: PND.idTwo, location_pk: LD.idOne});
  });
  assert.equal(location.get('phonenumbers').get('length'), 2);
  assert.ok(location.get('phonenumbersIsNotDirty'));
  first_phone_number.change_phone_number_type({id: PNTD.mobileId});
  assert.ok(location.get('phonenumbersIsDirty'));
  location.savePhonenumbers();
  location.savePhonenumbersContainer();
  assert.ok(location.get('phonenumbersIsNotDirty'));
});

test('savePhonenumbers will remove any phone number model with no (valid) value', (assert) => {
  let first_phone_number, second_phone_number, third_phone_number, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne, LPHD.idTwo, LPHD.idThree]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    third_phone_number = store.push('phonenumber', {id: PND.idThree, phone_number_type_fk: PNTD.mobileId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo, PND.idThree]});
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
    store.push('location-join-phonenumber', {id: LPHD.idTwo, phonenumber_pk: PND.idTwo, location_pk: LD.idOne});
    store.push('location-join-phonenumber', {id: LPHD.idThree, phonenumber_pk: PND.idThree, location_pk: LD.idOne});
  });
  assert.equal(location.get('phonenumbers').get('length'), 3);
  assert.equal(store.find('phonenumber').get('length'), 3);
  run(() => {
    location.savePhonenumbers();
    location.savePhonenumbersContainer();
  });
  assert.equal(location.get('phonenumbers').get('length'), 2);
  assert.equal(store.find('phonenumber').get('length'), 3);
  first_phone_number.set('number', '');
  run(() => {
    location.savePhonenumbers();
    location.savePhonenumbersContainer();
  });
  assert.equal(location.get('phonenumbers').get('length'), 1);
  assert.equal(store.find('phonenumber').get('length'), 3);
  second_phone_number.set('number', '');
  run(() => {
    location.savePhonenumbers();
    location.savePhonenumbersContainer();
  });
  assert.equal(location.get('phonenumbers').get('length'), 0);
  assert.equal(store.find('phonenumber').get('length'), 3);
});

test('phonenumbersIsDirty behaves correctly for existing phone numbers', (assert) => {
  let first_phone_number, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: '', phone_number_type_fk: PNTD.officeId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
  });
  assert.equal(location.get('phonenumbers').get('length'), 1);
  assert.ok(location.get('phonenumbersIsNotDirty'));
  run(() => {
    store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
  });
  assert.ok(location.get('phonenumbersIsDirty'));
  first_phone_number.set('number', '');
  assert.ok(location.get('phonenumbersIsNotDirty'));
});

test('phonenumbersIsDirty behaves correctly for newly added phone numbers - not dirty when number is not valid and dirty tracking on number', (assert) => {
  let location, phone_number;
  run(() => {
    location = store.push('location', {id: LD.idOne});
    phone_number = store.push('phonenumber', {id: PND.idOne, number: '', phone_number_type_fk: PNTD.officeId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
  });
  assert.equal(location.get('phonenumbers').get('length'), 0);
  assert.ok(location.get('phonenumbersIsNotDirty'));
  // add
  run(() => {
    location.add_phonenumber({id: PND.idOne, number: ''});
  });
  assert.equal(location.get('phonenumbers').get('length'), 1);
  // not dirty even though added
  assert.ok(location.get('phonenumbersIsNotDirty'));
  phone_number.set('number', PND.numberTwo);
  // dirty
  assert.ok(location.get('phonenumbersIsDirty'));
  phone_number.set('number', '');
  assert.ok(location.get('phonenumbersIsNotDirty'));
});

test('rollback related will iterate over each phone number and rollback that model', (assert) => {
  let first_phone_number, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne, LPHD.idTwo]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
    store.push('location-join-phonenumber', {id: LPHD.idTwo, phonenumber_pk: PND.idTwo, location_pk: LD.idOne});
  });
  assert.ok(location.get('phonenumbersIsNotDirty'));
  first_phone_number.change_phone_number_type({id: PNTD.mobileId});
  assert.ok(location.get('phonenumbersIsDirty'));
  location.rollback();
  assert.ok(location.get('phonenumbersIsNotDirty'));
});

test('when phone number is removed after render, the location model is dirty (two phone numbers)', (assert) => {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_phonenumbers_fks: [LPHD.idOne]});
    store.push('phonenumber', {id: PND.idOne, number: PND.numberTwo, phone_number_type_fk: PNTD.officeId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('location-join-phonenumber', {id: LPHD.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
  });
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('phonenumbers').get('length'), 1);
  run(() => {
    location.remove_phonenumber(PND.idOne);
  });
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('phonenumbers').get('length'), 0);
});

/* EMAIL */

test('related emails are not dirty with original email model', (assert) => {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LEMD.idOne]});
    store.push('email', { id: ED.idOne, email: ED.emailOne, type: ETD.personalId });
    store.push('location-join-email', {id: LEMD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
  });
  assert.equal(location.get('emails').get('length'), 1);
  assert.equal(location.get('location_emails_ids').get('length'), 1);
  assert.equal(location.get('location_emails_ids')[0], LEMD.idOne);
  assert.equal(location.get('location_emails_fks')[0], LEMD.idOne);
  assert.ok(location.get('emailsIsNotDirty'));
});

test('related email model is dirty when email is dirty (and email is not newly added)', (assert) => {
  let email, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LEMD.idOne]});
    email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
    store.push('location-join-email', {id: LEMD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
  });
  assert.ok(email.get('isNotDirty'));
  assert.ok(location.get('emailsIsNotDirty'));
  email.change_email_type({id: ETD.idTwo});
  assert.ok(email.get('emailTypeIsDirty'));
  assert.ok(location.get('emailsIsDirty'));
});

test('save related will iterate over each email and save that model', (assert) => {
  let first_email, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LEMD.idOne, LEMD.idTwo]});
    first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('email-type', {id: ETD.workId, emails: [ED.idTwo]});
    store.push('location-join-email', {id: LEMD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
    store.push('location-join-email', {id: LEMD.idTwo, email_pk: ED.idTwo, location_pk: LD.idOne});
  });
  assert.equal(location.get('emails').get('length'), 2);
  assert.ok(location.get('emailsIsNotDirty'));
  first_email.change_email_type({id: ETD.workId});
  assert.ok(location.get('emailsIsDirty'));
  location.saveEmails();
  location.saveEmailsContainer();
  assert.ok(location.get('emailsIsNotDirty'));
});

test('saveEmails will remove any email model with no (valid) value', (assert) => {
  let first_email, second_email, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LEMD.idOne, LEMD.idTwo, LEMD.idThree]});
    first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    second_email = store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    // no email
    store.push('email', {id: ED.idThree, email_type_fk: ETD.workId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('email-type', {id: ETD.workId, emails: [ED.idTwo, ED.idThree]});
    store.push('location-join-email', {id: LEMD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
    store.push('location-join-email', {id: LEMD.idTwo, email_pk: ED.idTwo, location_pk: LD.idOne});
    store.push('location-join-email', {id: LEMD.idThree, email_pk: ED.idThree, location_pk: LD.idOne});
  });
  assert.equal(location.get('emails').get('length'), 3);
  assert.equal(store.find('email').get('length'), 3);
  run(() => {
    location.saveEmails();
    location.saveEmailsContainer();
  });
  assert.equal(location.get('emails').get('length'), 2);
  assert.equal(store.find('email').get('length'), 3);
  first_email.set('email', '');
  run(() => {
    location.saveEmails();
    location.saveEmailsContainer();
  });
  assert.equal(location.get('emails').get('length'), 1);
  assert.equal(store.find('email').get('length'), 3);
  second_email.set('email', '');
  run(() => {
    location.saveEmails();
    location.saveEmailsContainer();
  });
  assert.equal(location.get('emails').get('length'), 0);
  assert.equal(store.find('email').get('length'), 3);
});

test('emailsIsDirty behaves correctly for existing emails', (assert) => {
  let first_email, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LEMD.idOne]});
    first_email = store.push('email', {id: ED.idOne, email: '', email_type_fk: ETD.personalId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('location-join-email', {id: LEMD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
  });
  assert.equal(location.get('emails').get('length'), 1);
  assert.ok(location.get('emailsIsNotDirty'));
  run(() => {
    store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
  });
  assert.ok(location.get('emailsIsDirty'));
  first_email.set('email', '');
  assert.ok(location.get('emailsIsNotDirty'));
});

test('emailsIsDirty behaves correctly for newly added emails - not dirty when email is not valid and dirty tracking on email', (assert) => {
  let location, email;
  run(() => {
    location = store.push('location', {id: LD.idOne});
    email = store.push('email', {id: ED.idOne, email: '', email_type_fk: ETD.personalId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
  });
  assert.equal(location.get('emails').get('length'), 0);
  assert.ok(location.get('emailsIsNotDirty'));
  // add
  run(() => {
    location.add_email({id: ED.idOne, email: ''});
  });
  assert.equal(location.get('emails').get('length'), 1);
  // not dirty even though added
  assert.ok(location.get('emailsIsNotDirty'));
  email.set('email', ED.emailTwo);
  // dirty
  assert.ok(location.get('emailsIsDirty'));
  email.set('email', '');
  assert.ok(location.get('emailsIsNotDirty'));
});

test('rollback related will iterate over each email and rollback that model', (assert) => {
  let first_email, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LEMD.idOne, LEMD.idTwo]});
    first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('email-type', {id: ETD.workId, emails: [ED.idTwo]});
    store.push('location-join-email', {id: LEMD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
    store.push('location-join-email', {id: LEMD.idTwo, email_pk: ED.idTwo, location_pk: LD.idOne});
  });
  assert.ok(location.get('emailsIsNotDirty'));
  first_email.change_email_type({id: ETD.workId});
  assert.ok(location.get('emailsIsDirty'));
  location.rollback();
  assert.ok(location.get('emailsIsNotDirty'));
});

test('when email is removed after render, the location model is dirty (two emails)', (assert) => {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_emails_fks: [LEMD.idOne]});
    store.push('email', {id: ED.idOne, email: ED.emailTwo, email_type_fk: ETD.personalId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('location-join-email', {id: LEMD.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
  });
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('emails').get('length'), 1);
  run(() => {
    location.remove_email(ED.idOne);
  });
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('emails').get('length'), 0);
});

/* ADDRESS */

test('related addresses are not dirty with original address model', (assert) => {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne]});
    store.push('address', { id: AD.idOne, address: AD.streetOne, type: ATD.officeId });
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
  });
  assert.equal(location.get('addresses').get('length'), 1);
  assert.equal(location.get('location_addresses_ids').get('length'), 1);
  assert.equal(location.get('location_addresses_ids')[0], LADD.idOne);
  assert.equal(location.get('location_addresses_fks')[0], LADD.idOne);
  assert.ok(location.get('addressesIsNotDirty'));
});
test('related address model is dirty when address is dirty (and address is not newly added)', (assert) => {
  let address, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne]});
    address = store.push('address', {id: AD.idOne, address: AD.streetOne, address_type_fk: ATD.idOne});
    store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
  });
  assert.ok(address.get('isNotDirty'));
  assert.ok(location.get('addressesIsNotDirty'));
  address.change_address_type({id: ATD.idTwo});
  assert.ok(address.get('addressTypeIsDirty'));
  assert.ok(location.get('addressesIsDirty'));
});
test('save related will iterate over each address and save that model', (assert) => {
  let first_address, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne, LADD.idTwo]});
    first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, address_type_fk: ATD.officeId});
    store.push('address', {id: AD.idTwo, address: AD.streetTwo, address_type_fk: ATD.workId});
    store.push('address-type', {id: ATD.officeId, addresses: [AD.idOne]});
    store.push('address-type', {id: ATD.workId, addresses: [AD.idTwo]});
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
    store.push('location-join-address', {id: LADD.idTwo, address_pk: AD.idTwo, location_pk: LD.idOne});
  });
  assert.equal(location.get('addresses').get('length'), 2);
  assert.ok(location.get('addressesIsNotDirty'));
  first_address.change_address_type({id: ATD.workId});
  assert.ok(location.get('addressesIsDirty'));
  location.saveAddresses();
  location.saveAddressesContainer();
  assert.ok(location.get('addressesIsNotDirty'));
});
test('saveAddresses will remove any address model with no (valid) value', (assert) => {
  let first_address, second_address, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne, LADD.idTwo, LADD.idThree]});
    first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, address_type_fk: ATD.officeId});
    second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, address_type_fk: ATD.workId});
    // no address
    store.push('address', {id: AD.idThree, address_type_fk: ATD.workId});
    store.push('address-type', {id: ATD.officeId, addresses: [AD.idOne]});
    store.push('address-type', {id: ATD.workId, addresses: [AD.idTwo, AD.idThree]});
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
    store.push('location-join-address', {id: LADD.idTwo, address_pk: AD.idTwo, location_pk: LD.idOne});
    store.push('location-join-address', {id: LADD.idThree, address_pk: AD.idThree, location_pk: LD.idOne});
  });
  assert.equal(location.get('addresses').get('length'), 3);
  run(() => {
    location.saveAddresses();
    location.saveAddressesContainer();
  });
  assert.equal(location.get('addresses').get('length'), 2);
  first_address.set('address', '');
  run(() => {
    location.saveAddresses();
    location.saveAddressesContainer();
  });
  assert.equal(location.get('addresses').get('length'), 1);
  second_address.set('address', '');
  run(() => {
    location.saveAddresses();
    location.saveAddressesContainer();
  });
  assert.equal(location.get('addresses').get('length'), 0);
});
test('addressesIsDirty behaves correctly for existing addresses', (assert) => {
  let first_address, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne]});
    first_address = store.push('address', {id: AD.idOne, address: '', address_type_fk: ATD.officeId});
    store.push('address-type', {id: ATD.officeId, addresses: [AD.idOne]});
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
  });
  assert.equal(location.get('addresses').get('length'), 1);
  assert.ok(location.get('addressesIsNotDirty'));
  run(() => {
    store.push('address', {id: AD.idOne, address: AD.streetOne, address_type_fk: ATD.officeId});
  });
  assert.ok(location.get('addressesIsDirty'));
  first_address.set('address', '');
  assert.ok(location.get('addressesIsNotDirty'));
});
test('addressesIsDirty behaves correctly for newly added addresses - not dirty when address is not valid and dirty tracking on address', (assert) => {
  let location, address;
  run(() => {
    location = store.push('location', {id: LD.idOne});
    address = store.push('address', {id: AD.idOne, address: '', address_type_fk: ATD.officeId});
    store.push('address-type', {id: ATD.officeId, addresses: [AD.idOne]});
  });
  assert.equal(location.get('addresses').get('length'), 0);
  assert.ok(location.get('addressesIsNotDirty'));
  // add
  run(() => {
    location.add_address({id: AD.idOne, address: ''});
  });
  assert.equal(location.get('addresses').get('length'), 1);
  // not dirty even though added
  assert.ok(location.get('addressesIsNotDirty'));
  address.set('address', AD.streetTwo);
  // dirty
  assert.ok(location.get('addressesIsDirty'));
  address.set('address', '');
  assert.ok(location.get('addressesIsNotDirty'));
});
test('rollback related will iterate over each address and rollback that model', (assert) => {
  let first_address, location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne, LADD.idTwo]});
    first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, address_type_fk: ATD.officeId});
    store.push('address', {id: AD.idTwo, address: AD.streetTwo, address_type_fk: ATD.workId});
    store.push('address-type', {id: ATD.officeId, addresses: [AD.idOne]});
    store.push('address-type', {id: ATD.workId, addresses: [AD.idTwo]});
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
    store.push('location-join-address', {id: LADD.idTwo, address_pk: AD.idTwo, location_pk: LD.idOne});
  });
  assert.ok(location.get('addressesIsNotDirty'));
  first_address.change_address_type({id: ATD.workId});
  assert.ok(location.get('addressesIsDirty'));
  location.rollback();
  assert.ok(location.get('addressesIsNotDirty'));
});
test('when address is removed after render, the location model is dirty (two addresses)', (assert) => {
  let location;
  run(() => {
    location = store.push('location', {id: LD.idOne, location_addresses_fks: [LADD.idOne]});
    store.push('address', {id: AD.idOne, address: AD.streetTwo, address_type_fk: ATD.officeId});
    store.push('address-type', {id: ATD.officeId, addresses: [AD.idOne]});
    store.push('location-join-address', {id: LADD.idOne, address_pk: AD.idOne, location_pk: LD.idOne});
  });
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('addresses').get('length'), 1);
  run(() => {
    location.remove_address(AD.idOne);
  });
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('addresses').get('length'), 0);
});

// /*Address*/
// test('related addresses are not dirty with original addresses model', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
//   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   assert.ok(location.get('addressesIsNotDirty'));
// });

// test('related address model is dirty when address is dirty (and address is not newly added)', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
//   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   assert.ok(location.get('addressesIsNotDirty'));
//   assert.ok(address.get('isNotDirty'));
//   address.change_address_type({id: ATD.shippingId});
//   assert.ok(address.get('addressTypeIsDirty'));
//   assert.ok(address.get('isDirtyOrRelatedDirty'));
//   assert.ok(location.get('addressesIsDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// test('location is dirty or related is dirty when model has been updated', (assert) => {
//   let location, phone_number, address, address_type, email;
//   run(() => {
//     store.clear('location');
//     location = store.push('location', {id: LD.idOne, name: LD.name, phone_number_fks: [PND.idOne], address_fks: [AD.idOne]});
//     phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: LD.idOne});
//     store.push('phone-number-type', {id: PNTD.idOne, phonenumbers: [PND.idOne]});
//     address = store.push('address', {id: AD.idOne, model_fk: LD.idOne, address_type_fk: ATD.officeId});
//     address_type = store.push('address-type', {id: ATD.officeId, addresses: [AD.idOne]});
//     store.push('address-type', {id: ATD.shippingId});
//     email = store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: LD.idOne});
//     store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(phone_number.get('isNotDirty'));
//   assert.ok(location.get('phonenumbersIsNotDirty'));
//   assert.ok(location.get('addressesIsNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   location.set('name', 'abc');
//   assert.ok(location.get('isDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   location.set('name', LD.nameOne);
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(phone_number.get('isDirtyOrRelatedDirty'));
//   assert.ok(location.get('phonenumbersIsDirty'));
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   phone_number.change_phone_number_type({id: PNTD.officeId});
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('phonenumbersIsNotDirty'));
//   assert.ok(phone_number.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(!location.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.officeId});
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   address.change_address_type({id: ATD.shippingId});
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('addressesIsDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   address.change_address_type({id: ATD.officeId});
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('addressesIsNotDirty'));
//   assert.ok(address.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(email.get('isDirtyOrRelatedDirty'));
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   email.change_email_type({id: ETD.workId});
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('emailsIsNotDirty'));
//   assert.ok(email.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(!location.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.workId});
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('save related will iterate over each address and save that model', (assert) => {
//   let location = store.push('location', {id: LD.idOne});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: LD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: LD.idOne});
//   assert.ok(location.get('addressesIsNotDirty'));
//   first_address.change_address_type({id: ATD.shippingId});
//   assert.ok(location.get('addressesIsDirty'));
//   location.saveAddresses();
//   assert.ok(location.get('addressesIsNotDirty'));
//   second_address.change_address_type({id: ATD.officeId});
//   assert.ok(location.get('addressesIsDirty'));
//   location.saveAddresses();
//   assert.ok(location.get('addressesIsNotDirty'));
// });

// test('saveAddresses will remove any address model with no (valid) value', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: LD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: LD.idOne});
//   let third_address = store.push('address', {id: AD.idThree, type: ATD.shippingId, model_fk: LD.idOne});
//   first_address.set('type', ATD.officeId);
//   second_address.set('type', ATD.officeId);
//   third_address.set('type', ATD.officeId);
//   first_address.set('street', AD.streetOne);
//   second_address.set('street', AD.streetTwo);
//   assert.equal(store.find('address').get('length'), 3);
//   location.saveAddresses();
//   assert.equal(store.find('address').get('length'), 2);
//   assert.equal(store.find('address').objectAt(0).get('id'), AD.idOne);
//   assert.equal(store.find('address').objectAt(1).get('id'), AD.idTwo);
//   first_address.set('address', '');
//   location.saveAddresses();
//   assert.equal(store.find('address').get('length'), 1);
//   assert.equal(store.find('address').objectAt(0).get('id'), AD.idTwo);
//   second_address.set('address', ' ');
//   location.saveAddresses();
//   assert.equal(store.find('address').get('length'), 0);
// });

// test('addressesIsDirty behaves correctly for addresses (newly) added', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
//   let first_address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: LD.idOne});
//   let third_address = store.push('address', {id: AD.idThree, type: ATD.shippingId, model_fk: LD.idOne});
//   assert.equal(location.get('addresses').get('length'), 3);
//   assert.ok(location.get('addressesIsNotDirty'));
//   first_address.set('address', AD.streetOne);
//   assert.ok(location.get('addressesIsDirty'));
//   first_address.set('address', '');
//   assert.ok(location.get('addressesIsNotDirty'));
// });

// test('addressesDirty behaves correctly for existing addresses', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ATD.officeId, model_fk: LD.idOne});
//   assert.equal(location.get('addresses').get('length'), 1);
//   assert.ok(location.get('addressesIsNotDirty'));
//   first_address.set('address', AD.streetTwo);
//   assert.ok(location.get('addressesIsDirty'));
//   first_address.set('address', '');
//   assert.ok(location.get('addressesIsDirty'));
// });

// test('addressesIsDirty is false when an address is added but does not have a (valid) address', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
//   let first_address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: LD.idOne});
//   let third_address = store.push('address', {id: AD.idThree, type: ATD.shippingId, model_fk: LD.idOne});
//   assert.equal(store.find('address').get('length'), 3);
//   assert.ok(location.get('addressesIsNotDirty'));
//   assert.equal(store.find('address').get('length'), 3);
// });

// test('addressesIsDirty is false when an address is added but does not have a (valid) address without address_fks', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: []});
//   let first_address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: LD.idOne});
//   let third_address = store.push('address', {id: AD.idThree, type: ATD.shippingId, model_fk: LD.idOne});
//   assert.equal(store.find('address').get('length'), 3);
//   assert.ok(location.get('addressesIsNotDirty'));
//   assert.equal(store.find('address').get('length'), 3);
// });

// test('rollback related will iterate over each address and rollback that model', (assert) => {
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne, AD.idTwo]});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ATD.officeId, model_fk: LD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: LD.idOne});
//   assert.ok(location.get('addressesIsNotDirty'));
//   first_address.change_address_type({id: ATD.shippingId});
//   assert.ok(location.get('addressesIsDirty'));
//   location.rollback();
//   assert.ok(location.get('addressesIsNotDirty'));
//   second_address.change_address_type({id: ATD.officeId});
//   location.rollback();
//   assert.ok(location.get('addressesIsNotDirty'));
// });

// test('when new address is added, the location model is not dirty unless address is altered', (assert) => {
//   let address_two;
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
//   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   assert.ok(location.get('addressesIsNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   run(function() {
//     address_two = store.push('address', {id: AD.idTwo, type: ATD.officeId, model_fk: LD.idOne});
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   address_two.set('address', '123 Mexico');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   address_two.rollback();
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   address.set('address', 'Big Sky Parkway');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// test('when new address is added, the location model is not dirty when the type or address attrs are modified', (assert) => {
//   let address_two;
//   let location = store.push('location', {id: LD.idOne, address_fks: [AD.idOne]});
//   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   assert.ok(location.get('addressesIsNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   run(function() {
//     address_two = store.push('address', {id: AD.idTwo, type: ATD.officeId, model_fk: LD.idOne});
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   address_two.change_address_type({id: ATD.shippingId});
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   address_two.rollback();
//   assert.equal(address_two.get('type'), ATD.officeId);
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   address.set('address', 'Big Sky Parkway');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   assert.ok(address.get('address'),'Big Sky Parkway');
// });

// test('when new address is added after render, the location model is not dirty when new address is appended to the array of addresses', (assert) => {
//   let added_address;
//   let location = store.push('location', {id: LD.idOne});
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   let addresses = location.get('addresses');
//   run(function() {
//     added_address = addresses.push({id: AD.idOne, type: ATD.officeId, model_fk: LD.idOne});
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('when address is removed after render, the location model is dirty (two addresses)', (assert) => {
//   let location = store.push('location', {
//     id: LD.idOne,
//     address_fks: [AD.idOne, AD.idTwo]
//   });
//   let address = store.push('address', {
//     id: AD.idOne,
//     address: AD.streetOne,
//     city: AD.cityOne,
//     state: AD.stateOne,
//     postal_code: AD.zipOne,
//     type: ATD.officeId,
//     model_fk: LD.idOne
//   });
//   store.push('address', {
//     id: AD.idTwo,
//     address: AD.streetTwo,
//     city: AD.cityTwo,
//     state: AD.stateTwo,
//     postal_code: AD.zipOne,
//     type: ATD.officeId,
//     model_fk: LD.idOne
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   let addresses = location.get('addresses');
//   run(function() {
//     addresses.remove(AD.idOne);
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// test('when no address and new address is added and updated, expect related isDirty to be true', (assert) => {
//   let address;
//   let location = store.push('location', {
//     id: LD.idOne
//   });
//   store.push('address', {
//     id: AD.idOne,
//     type: ATD.officeId,
//     model_fk: LD.idOne
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   run(function() {
//     address = store.push('address', {
//       id: AD.idTwo,
//       type: ATD.officeId,
//       model_fk: LD.idOne
//     });
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   address.change_address_type({
//     id: ATD.shippingId
//   });
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   address.rollback();
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   address.set('address', '123 Baja');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// test('when address is removed after render, the location model is dirty', (assert) => {
//   let location = store.push('location', {
//     id: LD.idOne,
//     address_fks: [AD.idOne]
//   });
//   let address = store.push('address', {
//     id: AD.idOne,
//     address: AD.streetOne,
//     city: AD.cityOne,
//     state: AD.stateOne,
//     postal_code: AD.zipOne,
//     type: ATD.officeId,
//     model_fk: LD.idOne
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   run(function() {
//     store.push('address', {
//       id: address.get('id'),
//       removed: true
//     });
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// /*Email*/
// test('save related will iterate over each email and save that model', (assert) => {
//   let location = store.push('location', {id: LD.idOne});
//   let first_email = store.push('email', {id: ED.idOne, email: ED.emailOne,  email_type_fk: ETD.workId, model_fk: LD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.personalId, model_fk: LD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   store.push('email-type', {id: ETD.personalId, emails: [ED.idTwo]});
//   assert.ok(location.get('emailsIsNotDirty'));
//   first_email.change_email_type({id: ETD.personalId});
//   assert.ok(location.get('emailsIsDirty'));
//   location.saveEmails();
//   assert.ok(location.get('emailsIsNotDirty'));
//   second_email.change_email_type({id: ETD.workId});
//   assert.ok(location.get('emailsIsDirty'));
//   location.saveEmails();
//   assert.ok(location.get('emailsIsNotDirty'));
// });

// test('saveEmails will remove any email model with no (valid) value', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: LD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: LD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.workId, model_fk: LD.idOne});
//   first_email.set('type', ETD.workId);
//   second_email.set('type', ETD.workId);
//   third_email.set('type', ETD.workId);
//   first_email.set('email', ED.emailOne);
//   second_email.set('email', ED.emailTwo);
//   assert.equal(store.find('email').get('length'), 3);
//   location.saveEmails();
//   assert.equal(store.find('email').get('length'), 2);
//   assert.equal(store.find('email').objectAt(0).get('id'), ED.idOne);
//   assert.equal(store.find('email').objectAt(1).get('id'), ED.idTwo);
//   first_email.set('email', '');
//   location.saveEmails();
//   assert.equal(store.find('email').get('length'), 1);
//   assert.equal(store.find('email').objectAt(0).get('id'), ED.idTwo);
//   second_email.set('email', ' ');
//   location.saveEmails();
//   assert.equal(store.find('email').get('length'), 0);
// });

// test('emailsIsDirty behaves correctly for emails (newly) added', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: LD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.personalId, model_fk: LD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.personalId, model_fk: LD.idOne});
//   assert.equal(location.get('emails').get('length'), 3);
//   assert.ok(location.get('emailsIsNotDirty'));
//   first_email.set('email', ED.emailOne);
//   assert.ok(location.get('emailsIsDirty'));
//   first_email.set('email', '');
//   assert.ok(location.get('emailsIsNotDirty'));
// });

// test('emailsDirty behaves correctly for existing emails', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne]});
//   let first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.workId, model_fk: LD.idOne});
//   assert.equal(location.get('emails').get('length'), 1);
//   assert.ok(location.get('emailsIsNotDirty'));
//   first_email.set('email', ED.emailTwo);
//   assert.ok(location.get('emailsIsDirty'));
//   first_email.set('email', '');
//   assert.ok(location.get('emailsIsDirty'));
// });

// test('emailsIsDirty is false when an email is added but does not have a (valid) email', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: LD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.personalId, model_fk: LD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.personalId, model_fk: LD.idOne});
//   assert.equal(store.find('email').get('length'), 3);
//   assert.ok(location.get('emailsIsNotDirty'));
//   assert.equal(store.find('email').get('length'), 3);
// });

// test('emailsIsDirty is false when an email is added but does not have a (valid) email without email_fks', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: []});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: LD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.personalId, model_fk: LD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.personalId, model_fk: LD.idOne});
//   assert.equal(store.find('email').get('length'), 3);
//   assert.ok(location.get('emailsIsNotDirty'));
//   assert.equal(store.find('email').get('length'), 3);
// });

// test('rollback related will iterate over each email and rollback that model', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne, ED.idTwo]});
//   let first_email = store.push('email', {id: ED.idOne, email: ED.emailOne,  email_type_fk: ETD.workId, model_fk: LD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.personalId, model_fk: LD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   store.push('email-type', {id: ETD.personalId, emails: [ED.idTwo]});
//   assert.ok(location.get('emailsIsNotDirty'));
//   first_email.change_email_type({id: ETD.personalId});
//   assert.ok(location.get('emailsIsDirty'));
//   assert.ok(first_email.get('isDirtyOrRelatedDirty'));
//   location.rollback();
//   assert.ok(location.get('emailsIsNotDirty'));
//   second_email.change_email_type({id: ETD.workId});
//   assert.ok(second_email.get('isDirtyOrRelatedDirty'));
//   location.rollback();
//   assert.ok(location.get('emailsIsNotDirty'));
// });

// test('when new email is added, the location model is not dirty unless email is altered', (assert) => {
//   let email_two;
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: LD.idOne});
//   assert.ok(location.get('emailsIsNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   run(function() {
//     email_two = store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: LD.idOne});
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   email_two.set('email', 'snewcomer@gmail.com');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   email_two.rollback();
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'allever@yahoo.com');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// test('when new email is added, the location model is not dirty when the type or email attrs are modified', (assert) => {
//   let email_two;
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: LD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(location.get('emailsIsNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   run(function() {
//     email_two = store.push('email', {id: ED.idTwo, email_type_fk: ETD.personalId, model_fk: LD.idOne});
//     store.push('email-type', {id: ETD.personalId, emails: [ED.idTwo]});
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   assert.equal(email_two.get('email_type.id'), ETD.personalId);
//   email_two.change_email_type({id: ETD.workId});
//   assert.equal(email_two.get('email_type.id'), ETD.workId);
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   email_two.rollback();
//   assert.equal(email_two.get('email_type.id'), ETD.personalId);
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'snewkie@gmail.com');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   assert.ok(email.get('email'),'wat@wat.com');
// });

// test('when new email is added after render, the location model is not dirty when new email is appended to the array of emails', (assert) => {
//   let added_email;
//   let location = store.push('location', {id: LD.idOne});
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   let emails = location.get('emails');
//   run(function() {
//     added_email = emails.push({id: ED.idOne, type: ETD.workId, model_fk: LD.idOne});
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
// });


// test('when email is removed after render, the location model is dirty (two emails)', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne, ED.idTwo]});
//   let email = store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.workId, model_fk: LD.idOne});
//   store.push('email', {id: ED.idTwo, email: ED.emailTwo, type: ETD.workId, model_fk: LD.idOne}); assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   let emails = location.get('emails');
//   run(function() {
//     emails.remove(ED.idOne);
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// test('when no email and new email is added and updated, expect related isDirty to be true', (assert) => {
//   let email;
//   let location = store.push('location', {id: LD.idOne});
//   store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: LD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   run(function() {
//     email = store.push('email', {id: ED.idTwo, email_type_fk: ETD.workId, model_fk: LD.idOne});
//     store.push('email-type', {id: ETD.workId, emails: [ED.idOne, ED.idTwo]});
//   });
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
//   email.rollback();
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'vatican@gmail.com');
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

// test('when email is removed after render, the location model is dirty', (assert) => {
//   let location = store.push('location', {id: LD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.workId, model_fk: LD.idOne});
//   assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(location.get('isNotDirty'));
//   run(function() {
//     store.push('email', {id: email.get('id'), removed: true});
//   });
//   assert.ok(location.get('isNotDirty'));
//   assert.ok(location.get('isDirtyOrRelatedDirty'));
// });

test('locationLevelIsDirty - when the related location_level and location_level_fk are the same', (assert) => {
  let location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
  let location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idOne, location_level: location_level});
  assert.equal(location.get('locationLevelIsDirty'), false);
});

/*LOCATION CHILDREN PARENTS M2M*/
test('related children is setup correctly', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne]});
  store.push('location', {id: LD.idTwo});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  assert.equal(location.get('location_children').get('length'), 1);
  assert.equal(location.get('location_children').objectAt(0).get('id'), LCD.idOne);
  assert.equal(location.get('children').get('length'), 1);
  assert.equal(location.get('children').objectAt(0).get('id'), LD.idTwo);
});

test('related children can have multiple', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne, LCD.idTwo]});
  store.push('location', {id: LD.idTwo});
  store.push('location', {id: LD.idThree});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  store.push('location-children', {id: LCD.idTwo, location_pk: LD.idOne, children_pk: LD.idThree});
  assert.equal(location.get('location_children').get('length'), 2);
  assert.equal(location.get('location_children').objectAt(0).get('id'), LCD.idOne);
  assert.equal(location.get('location_children').objectAt(1).get('id'), LCD.idTwo);
  assert.equal(location.get('children').get('length'), 2);
  assert.equal(location.get('children').objectAt(0).get('id'), LD.idTwo);
  assert.equal(location.get('children').objectAt(1).get('id'), LD.idThree);
});

test('removed location children join models are excluded', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_m2m = store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo, removed: true});
  assert.equal(location.get('location_children').get('length'), 0);
  assert.equal(location.get('children').get('length'), 0);
});

test('related parents is setup correctly', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idOne]});
  store.push('location', {id: LD.idTwo});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  assert.equal(location.get('location_parents').get('length'), 1);
  assert.equal(location.get('location_parents').objectAt(0).get('id'), LPD.idOne);
  assert.equal(location.get('parents').get('length'), 1);
  assert.equal(location.get('parents').objectAt(0).get('id'), LD.idTwo);
});

test('related parents can have multiple', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idOne, LPD.idTwo]});
  store.push('location', {id: LD.idTwo});
  store.push('location', {id: LD.idThree});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  store.push('location-parents', {id: LPD.idTwo, location_pk: LD.idOne, parents_pk: LD.idThree});
  assert.equal(location.get('location_parents').get('length'), 2);
  assert.equal(location.get('location_parents').objectAt(0).get('id'), LPD.idOne);
  assert.equal(location.get('location_parents').objectAt(1).get('id'), LPD.idTwo);
  assert.equal(location.get('parents').get('length'), 2);
  assert.equal(location.get('parents').objectAt(0).get('id'), LD.idTwo);
  assert.equal(location.get('parents').objectAt(1).get('id'), LD.idThree);
});

test('removed location parents join models are excluded', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idTwo]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_m2m = store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo, removed: true});
  assert.equal(location.get('location_parents').get('length'), 0);
  assert.equal(location.get('parents').get('length'), 0);
});

/*CHILD*/
test('add_child correctly adds child when none exists', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: []});
  const location_two = {id: LD.idTwo};
  location.add_child(location_two);
  assert.equal(location.get('children').get('length'), 1);
  assert.ok(location.get('childrenIsDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('add_child correctly adds child when already has one', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = {id: LD.idThree};
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  location.add_child(location_three);
  assert.equal(location.get('children').get('length'), 2);
});

test('add_child will add back old join model after it was removed', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  location.remove_children(location_two.get('id'));
  assert.equal(location.get('children').get('length'), 0);
  location.add_child({id: LD.idTwo});
  assert.equal(location.get('children').get('length'), 1);
  assert.ok(location.get('childrenIsNotDirty'));
});

test('add_child will add back old join model after it was removed and not dirty the model (multiple)', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne, LCD.idTwo]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = store.push('location', {id: LD.idThree});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  store.push('location-children', {id: LCD.idTwo, location_pk: LD.idOne, children_pk: LD.idThree});
  location.remove_children(location_three.get('id'));
  assert.equal(location.get('children').get('length'), 1);
  const location_three_object = {id: LD.idThree};
  location.add_child(location_three_object);
  assert.equal(location.get('children').get('length'), 2);
  assert.ok(location.get('childrenIsNotDirty'));
});

test('remove_child correctly adds child when already has one', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idTwo]});
  const location_two = store.push('location', {id: LD.idTwo});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  location.remove_children(location_two.get('id'));
  assert.equal(location.get('children').get('length'), 0);
});

test('remove_child correctly adds child when has multiple', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idTwo, LCD.idThree]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = store.push('location', {id: LD.idThree});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  store.push('location-children', {id: LCD.idTwo, location_pk: LD.idOne, children_pk: LD.idThree});
  location.remove_children(location_three.get('id'));
  assert.equal(location.get('children').get('length'), 1);
});

test('clicking save will make location model children not dirty', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: []});
  const location_two = store.push('location', {id: LD.idTwo});
  location.add_child({id: LD.idTwo});
  assert.equal(location.get('children').get('length'), 1);
  assert.ok(location.get('childrenIsDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  location.saveChildren();
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('childrenIsNotDirty'));
});

test('clicking save will make location model children not dirty with existing', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = store.push('location', {id: LD.idThree});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  location.add_child({id: LD.idThree});
  assert.equal(location.get('children').get('length'), 2);
  assert.ok(location.get('childrenIsDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  location.saveChildren();
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('childrenIsNotDirty'));
});

test('rollback children resets children', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_children_fks: [LCD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = store.push('location', {id: LD.idThree});
  const location_four = store.push('location', {id: LD.idFour});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  assert.deepEqual(location.get('location_children_fks'), [LCD.idOne]);
  location.add_child({id: LD.idThree});
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  location.save();
  location.saveRelated();
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.add_child({id: LD.idFour});
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  assert.deepEqual(location.get('location_children_fks').length, 2);
  assert.equal(location.get('children').get('length'), 3);
  location.rollback();
  location.rollback();
  assert.deepEqual(location.get('location_children_fks').length, 2);
  assert.equal(location.get('children').get('length'), 2);
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

/*PARENT*/
test('add_parent correctly adds parent when none exists', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: []});
  const location_two = {id: LD.idTwo};
  location.add_parent({id: LD.idTwo});
  assert.equal(location.get('parents').get('length'), 1);
  assert.ok(location.get('parentsIsDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('add_parent correctly adds parent when already has one', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = {id: LD.idThree};
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  location.add_parent({id: LD.idThree});
  assert.equal(location.get('parents').get('length'), 2);
});

test('add_parent will add back old join model after it was removed', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  location.remove_parent(location_two.get('id'));
  assert.equal(location.get('parents').get('length'), 0);
  const location_two_plain = {id: LD.idTwo};
  location.add_parent(location_two_plain);
  assert.equal(location.get('parents').get('length'), 1);
  assert.ok(location.get('parentsIsNotDirty'));
});

test('add_parent will add back old join model after it was removed and not dirty the model (multiple)', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idOne, LPD.idTwo]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = store.push('location', {id: LD.idThree});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  store.push('location-parents', {id: LPD.idTwo, location_pk: LD.idOne, parents_pk: LD.idThree});
  location.remove_parent(location_three.get('id'));
  assert.equal(location.get('parents').get('length'), 1);
  const location_three_plain = {id: LD.idThree};
  location.add_parent(location_three_plain);
  assert.equal(location.get('parents').get('length'), 2);
  assert.ok(location.get('parentsIsNotDirty'));
});

test('remove_parent correctly adds parent when already has one', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idTwo]});
  const location_two = store.push('location', {id: LD.idTwo});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  location.remove_parent(location_two.get('id'));
  assert.equal(location.get('parents').get('length'), 0);
});

test('remove_parent correctly adds parent when has multiple', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idTwo, LPD.idThree]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = store.push('location', {id: LD.idThree});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  store.push('location-parents', {id: LPD.idTwo, location_pk: LD.idOne, parents_pk: LD.idThree});
  location.remove_parent(location_three.get('id'));
  assert.equal(location.get('parents').get('length'), 1);
});

test('clicking save will make location model parents not dirty', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: []});
  const location_two = {id: LD.idTwo};
  location.add_parent(location_two);
  assert.equal(location.get('parents').get('length'), 1);
  assert.ok(location.get('parentsIsDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  location.saveParents();
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('parentsIsNotDirty'));
});

test('clicking save will make location model parents not dirty with existing', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = {id: LD.idThree};
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  location.add_parent(location_three);
  assert.equal(location.get('parents').get('length'), 2);
  assert.ok(location.get('parentsIsDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  location.saveParents();
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('parentsIsNotDirty'));
});

test('rollback parents resets parents', (assert) => {
  const location = store.push('location', {id: LD.idOne, location_parents_fks: [LPD.idOne]});
  const location_two = store.push('location', {id: LD.idTwo});
  const location_three = store.push('location', {id: LD.idThree});
  const location_four = store.push('location', {id: LD.idFour});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  assert.deepEqual(location.get('location_parents_fks'), [LPD.idOne]);
  location.add_parent({id: LD.idThree});
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  location.save();
  location.saveRelated();
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  location.add_parent({id: LD.idFour});
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isDirtyOrRelatedDirty'));
  assert.deepEqual(location.get('location_parents_fks').length, 2);
  assert.equal(location.get('parents').get('length'), 3);
  location.rollback();
  location.rollback();
  assert.deepEqual(location.get('location_parents_fks').length, 2);
  assert.equal(location.get('parents').get('length'), 2);
  assert.ok(location.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});
