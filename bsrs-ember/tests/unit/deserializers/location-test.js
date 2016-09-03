import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LCD from 'bsrs-ember/vendor/defaults/location-children';
import LPD from 'bsrs-ember/vendor/defaults/location-parents';
import LD from 'bsrs-ember/vendor/defaults/location';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import ED from 'bsrs-ember/vendor/defaults/email';
import EF from 'bsrs-ember/vendor/email_fixtures';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import AND from 'bsrs-ember/vendor/defaults/address';
import ANF from 'bsrs-ember/vendor/address_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/country';
import SD from 'bsrs-ember/vendor/defaults/state';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';

var store, location_unused, location_level_deserializer, subject, location_status, location_status_two, location_level, run = Ember.run;

module('unit: location deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:location', 'model:location-list', 'model:location-status-list', 'model:location-level', 'model:location-status', 'model:location-children', 'model:location-parents', 'model:address', 'model:phonenumber', 'model:email', 'model:country', 'model:state', 'model:address-type', 'service:i18n']);
    location_level_deserializer = LocationLevelDeserializer.create({simpleStore: store});
    subject = LocationDeserializer.create({simpleStore: store, LocationLevelDeserializer: location_level_deserializer});
    run(function() {
      location_status = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
      location_status_two = store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
      location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
    });
  }
});

test('location deserializer returns correct data with already present location_level (list)', (assert) => {
  let location;
  let json = [LF.generate_list(LD.idOne), LF.generate_list(LD.unusedId)];
  let response = {'count':2,'next':null,'previous':null,'results': json};
  location = store.push('location-list', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  location_unused = store.push('location-list', {id: LD.unusedId, name: LD.storeName, number: '988', location_level_fk: LLD.idOne});
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne, LD.unusedId]});
  run(() => {
    subject.deserialize(response);
  });
  assert.deepEqual(location_level.get('locations'), [LD.idOne, LD.unusedId]);
  assert.ok(location_level.get('isNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location_unused.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(location.get('location_level_fk'), LLD.idOne);
  assert.equal(location_unused.get('location_level_fk'), LLD.idOne);
  assert.equal(store.find('location-list').get('length'), 2);
});

test('location deserializer returns correct data with no current location_level (list)', (assert) => {
  let location;
  let json = [LF.generate_list(LD.unusedId)];
  let response = {'count':1,'next':null,'previous':null,'results': json};
  location = store.push('location-list', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  run(() => {
    subject.deserialize(response);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(original.get('locations'), [LD.idOne, LD.unusedId]);
  assert.ok(original.get('isNotDirty'));
});

test('(2) location deserializer returns correct data with already present location_level (detail)', (assert) => {
  let location;
  let json = LF.generate(LD.unusedId);
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  run(() => {
    subject.deserialize(json, LD.unusedId);
  });
  assert.deepEqual(location_level.get('locations'), [LD.idOne, LD.unusedId, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
  assert.ok(location_level.get('isNotDirty'));
  let loc = store.find('location', LD.idOne);
  assert.equal(loc.get('location_level_fk'), LLD.idOne);
  assert.equal(store.find('location', LD.unusedId).get('location_level.name'), LLD.nameCompany);
});

test('location deserializer returns correct data with no current location_level (detail)', (assert) => {
  let location;
  let json = LF.generate(LD.unusedId);
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  run(() => {
    subject.deserialize(json, LD.unusedId);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(location_level.get('locations'), [LD.idOne, LD.unusedId, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
  assert.ok(original.get('isNotDirty'));
  assert.equal(store.find('location', LD.unusedId).get('location_level.name'), LLD.nameCompany);
});

test('location array in location level will not be duplicated and deserializer returns correct data with already present location_level (detail)', (assert) => {
  let location;
  let json = LF.generate(LD.idOne);
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  run(() => {
    subject.deserialize(json, LD.idOne);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(location_level.get('locations'), [LD.idOne, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
  let loc = store.find('location', LD.idOne);
  assert.equal(loc.get('location_level_fk'), LLD.idOne);
  assert.ok(original.get('isNotDirty'));
  assert.equal(store.find('location', LD.idOne).get('location_level.name'), LLD.nameCompany);
});

/* LOCATION TO STATUS */
test('location status will be deserialized into its own store when deserialize detail is invoked', (assert) => {
  let location;
  let json = LF.generate(LD.idOne);
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  // assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('statusIsNotDirty'));
  assert.ok(location.get('locationLevelIsNotDirty'));
  run(() => {
    subject.deserialize(json, location.get('id'));
  });
  assert.deepEqual(location_status.get('locations'), [LD.idOne, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('status.id'), LDS.openId);
});

test('location status will be updated when server returns same status (single)', (assert) => {
  let location;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  let json = LF.generate(LD.idOne);
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, LD.idOne);
  });
  assert.deepEqual(location_status.get('locations'), [LD.idOne, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(location.get('status.id'), LDS.openId);
});

test('can push in location with location level as an object', (assert) => {
  let location;
  let json = LF.generate(LD.idOne);
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  subject.deserialize(json, LD.idOne);
  assert.equal(location.get('location_level').get('id'), LLD.idOne);
});

test('can push in location with location level as an id', (assert) => {
  let location;
  let json = LF.generate(LD.idOne);
  json.location_level = LLD.idOne;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  run(() => {
    subject.deserialize(json, LD.idOne);
  });
  assert.equal(location.get('location_level').get('id'), LLD.idOne);
});

/* PH and ADDRESSES and Emails*/
test('location will setup the correct relationship with emails when _deserializeSingle is invoked with no relationship in place', (assert) => {
  let location, email;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  email = store.push('email', {id: ED.idOne, email: ED.emailOne});
  let response = LF.generate(LD.idOne);
  response.emails = EF.get();
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  let location_pk = email.get('model_fk');
  assert.ok(location_pk);
  assert.deepEqual(location.get('email_fks'), [ED.idOne, ED.idTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(email.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with emails when _deserializeSingle is invoked with location setup with phone number relationship', (assert) => {
  let location, email;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, email_fks: [ED.idOne]});
  email = store.push('email', {id: ED.idOne, number: ED.emailOne});
  let response = LF.generate(LD.idOne);
  response.emails = EF.get();
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  let location_pk = email.get('model_fk');
  assert.ok(location_pk);
  assert.deepEqual(location.get('email_fks'), [ED.idOne, ED.idTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(email.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with phone numbers when _deserializeSingle is invoked with no relationship in place', (assert) => {
  let location, phonenumber;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
  let response = LF.generate(LD.idOne);
  response.phone_numbers = PNF.get();
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  let location_pk = phonenumber.get('model_fk');
  assert.ok(location_pk);
  assert.deepEqual(location.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(phonenumber.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with phone numbers when _deserializeSingle is invoked with location setup with phone number relationship', (assert) => {
  let location, phonenumber;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, phone_number_fks: [PND.idOne]});
  phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
  let response = LF.generate(LD.idOne);
  response.phone_numbers = PNF.get();
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  let location_pk = phonenumber.get('model_fk');
  assert.ok(location_pk);
  assert.deepEqual(location.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(phonenumber.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with addresses when _deserializeSingle is invoked with no relationship in place', (assert) => {
  let location, address;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  address = store.push('address', {id: AND.idOne, address: AND.streetOne});
  let response = LF.generate(LD.idOne);
  response.addresses = ANF.get();
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  let location_pk = address.get('model_fk');
  assert.ok(location_pk);
  assert.deepEqual(location.get('address_fks'), [AND.idOne, AND.idTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(address.get('model_fk'), LD.idOne);
  assert.equal(location.get('addresses').objectAt(0).get('id'), AND.idOne);
});

test('location will setup the correct relationship with address when _deserializeSingle is invoked with location setup with address relationship', (assert) => {
  let location, address;
  location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, address_fks: [AND.idOne]});
  address = store.push('address', {id: AND.idOne, address: AND.streetOne});
  let response = LF.generate(LD.idOne);
  response.addresses = ANF.get();
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  let location_pk = address.get('model_fk');
  assert.ok(location_pk);
  assert.deepEqual(location.get('address_fks'), [AND.idOne, AND.idTwo]);
  assert.ok(location.get('isNotDirty'));
  assert.equal(address.get('model_fk'), LD.idOne);
});

test('deserialize location and address with its related models: type, state, and country', assert => {
  let response = LF.generate(LD.idOne);
  response.addresses = ANF.get();
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  assert.equal(store.find('location', LD.idOne).get('id'), LD.idOne);
  let location = store.find('location', LD.idOne);
  assert.equal(location.get('name'), LD.baseStoreName);
  // addresses
  assert.equal(location.get('addresses').get('length'), 2);
  let address = location.get('addresses').objectAt(0);
  assert.equal(address.get('id'), AND.idOne);
  // country
  assert.equal(address.get('country').get('id'), CD.idOne);
  assert.equal(address.get('country').get('name'), CD.name);
  // state
  assert.equal(address.get('state').get('id'), SD.id);
  assert.equal(address.get('state').get('name'), SD.name);
  // address-type
  assert.equal(address.get('address_type').get('id'), ATD.idOne);
  assert.equal(address.get('address_type').get('name'), ATD.officeName);
  // dirty checking
  assert.ok(address.get('addressTypeIsNotDirty'));
  assert.ok(address.get('stateIsNotDirty'));
  assert.ok(address.get('countryIsNotDirty'));
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

/*PARENT AND CHILDREN M2M*/
test('children are deserialized correctly (detail)', (assert) => {
  const response = LF.generate(LD.idOne);
  response.children = [LF.get(LD.idTwo)];
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('children').get('length'), 1);
  assert.equal(location.get('children').objectAt(0).get('id'), LD.idTwo);
  assert.equal(location.get('children').objectAt(0).get('location_level.id'), LLD.idOne);
  assert.equal(location.get('children').objectAt(0).get('location_level_fk'), LLD.idOne);
  assert.equal(location.get('location_children').get('length'), 1);
  assert.equal(location.get('location_children_fks').length, 1);
});

test('parents are deserialized correctly (detail)', (assert) => {
  const response = LF.generate(LD.idOne);
  response.parents = [LF.get(LD.idParent)];
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('parents').get('length'), 1);
  assert.equal(location.get('parents').objectAt(0).get('id'), LD.idParent);
  assert.equal(location.get('parents').objectAt(0).get('location_level.id'), LLD.idOne);
  assert.equal(location.get('parents').objectAt(0).get('location_level_fk'), LLD.idOne);
  assert.equal(location.get('location_parents').get('length'), 1);
});

test('children are deserialized correctly with existing same child (detail)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, location_children_fks: [LCD.idOne]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  const response = LF.generate(LD.idOne);
  response.children = [LF.get(LD.idTwo)];
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('children').get('length'), 1);
  assert.equal(location.get('children').objectAt(0).get('id'), LD.idTwo);
  assert.equal(location.get('location_children').get('length'), 1);
});

test('children are deserialized correctly with existing different child (detail)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, location_children_fks: [LCD.idOne]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  const response = LF.generate(LD.idOne);
  response.children = [LF.get(LD.idThree)];
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('children').get('length'), 1);
  assert.equal(location.get('children').objectAt(0).get('id'), LD.idThree);
  assert.equal(location.get('location_children').get('length'), 1);
  assert.equal(location.get('location_children').objectAt(0).get('children_pk'), LD.idThree);
  assert.notDeepEqual(location.get('location_children_fks'), [LCD.idOne]);
});

test('children are deserialized correctly with null child (detail)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, location_children_fks: [LCD.idOne]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
  const response = LF.generate(LD.idOne);
  response.children = null;
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('children').get('length'), 0);
  assert.equal(location.get('location_children').get('length'), 0);
  assert.equal(location.get('location_children_fks').length, 0);
});

test('parents are deserialized correctly with existing same parent (detail)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, location_parent_fks: [LPD.idOne]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  const response = LF.generate(LD.idOne);
  response.parents = [LF.get(LD.idTwo)];
  subject.deserialize(response, LD.idOne);
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('parents').get('length'), 1);
  assert.equal(location.get('parents').objectAt(0).get('id'), LD.idTwo);
  assert.equal(location.get('location_parents').get('length'), 1);
});

test('parents are deserialized correctly with existing different parent (detail)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, location_parents_fks: [LPD.idOne]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  const response = LF.generate(LD.idOne);
  response.parents = [LF.get(LD.idThree)];
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('parents').get('length'), 1);
  assert.equal(location.get('parents').objectAt(0).get('id'), LD.idThree);
  assert.equal(location.get('location_parents').get('length'), 1);
  assert.equal(location.get('location_parents').objectAt(0).get('parents_pk'), LD.idThree);
  assert.notDeepEqual(location.get('location_parents_fks'), [LPD.idOne]);
});

test('parents are deserialized correctly with null parent (detail)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, location_parents_fks: [LPD.idOne]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, location_level_fk: LLD.idOne, status_fk: LDS.openId});
  store.push('location-parents', {id: LPD.idOne, location_pk: LD.idOne, parents_pk: LD.idTwo});
  const response = LF.generate(LD.idOne);
  response.parents = null;
  run(() => {
    subject.deserialize(response, LD.idOne);
  });
  const location = store.find('location', LD.idOne);
  assert.equal(location.get('parents').get('length'), 0);
  assert.equal(location.get('location_parents').get('length'), 0);
  assert.equal(location.get('location_parents_fks').length, 0);
});
