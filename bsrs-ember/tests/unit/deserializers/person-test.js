import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LD from 'bsrs-ember/vendor/defaults/location';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import LF from 'bsrs-ember/vendor/location_fixtures';
import ED from 'bsrs-ember/vendor/defaults/email';
import EF from 'bsrs-ember/vendor/email_fixtures';
import CD from 'bsrs-ember/vendor/defaults/currencies';
import Person from 'bsrs-ember/models/person';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, personProxy, subject, personCurrent, uuid, location_deserializer, location_level_deserializer, status, locale, person, role, run = Ember.run;

module('unit: person deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:random','model:uuid','model:person', 'model:person-list', 'model:role', 'model:person-location','model:location','model:location-level','model:email','model:phonenumber','service:person-current','service:translations-fetcher','service:i18n', 'model:status', 'model:person-status-list', 'model:location-status', 'model:locale', 'model:currency']);
    uuid = this.container.lookup('model:uuid');
    location_level_deserializer = LocationLevelDeserializer.create({simpleStore: store});
    location_deserializer = LocationDeserializer.create({simpleStore: store, LocationLevelDeserializer: location_level_deserializer});
    subject = PersonDeserializer.create({simpleStore: store, uuid: uuid, LocationDeserializer: location_deserializer});
    run(() => {
      status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
      store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.idOne], location_level_fk: LLD.idOne});
      store.push('location-level', {id: LLD.idOne, name: LLD.nameOne, roles: [RD.idOne]});
      person = store.push('person', {id: PD.idOne, status_fk: SD.activeId, role_fk: PD.role});
    });
  }
});

/* LOCALE */
test('person setup correct locale fk with bootstrapped data (detail)', (assert) => {
  let response = PF.generate(PD.idOne);
  locale = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne});
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('status_fk'), status.get('id'));
  assert.equal(person.get('status.id'), status.get('id'));
  assert.equal(person.get('locale_fk'), locale.get('id'));
  assert.equal(person.get('locale').get('id'), locale.get('id'));
  assert.deepEqual(locale.get('people'), [PD.idOne]);
  assert.ok(person.get('isNotDirty'));
});

test('person setup correct locale fk with existing locale pointer to person', (assert) => {
  store.push('person', {id: PD.idOne, status_fk: SD.activeId, locale_fk: LOCALED.idOne, role_fk: PD.role});
  let response = PF.generate(PD.idOne);
  locale = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('locale_fk'), locale.get('id'));
  assert.equal(person.get('locale').get('id'), locale.get('id'));
  assert.equal(locale.get('people').length, 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('localeIsNotDirty'));
  assert.ok(person.get('roleIsNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('will check for previous person in store for locale_id as well', (assert) => {
  store.push('person', {id: PD.idOne, status_fk: SD.activeId, locale_fk: LOCALED.idOne, role_fk: PD.role});
  let response = PF.generate(PD.idOne);
  response.locale = undefined;
  locale = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('locale_fk'), locale.get('id'));
  assert.equal(person.get('locale').get('id'), locale.get('id'));
  assert.equal(locale.get('people').length, 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('localeIsNotDirty'));
  assert.ok(person.get('roleIsNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

/* STATUS */
test('person setup correct status fk with bootstrapped data (detail)', (assert) => {
  let response = PF.generate(PD.idOne);
  status = store.push('status', {id: SD.activeId, name: SD.activeName});
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('status_fk'), status.get('id'));
  assert.equal(person.get('status').get('id'), status.get('id'));
  assert.deepEqual(status.get('people'), [PD.idOne]);
  assert.ok(person.get('isNotDirty'));
});

test('person setup correct status fk with existing status pointer to person', (assert) => {
  let response = PF.generate(PD.idOne);
  status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('status_fk'), status.get('id'));
  assert.equal(person.get('status').get('id'), status.get('id'));
  assert.equal(status.get('people').length, 1);
  assert.ok(person.get('isNotDirty'));
});

test('person setup correct status fk with bootstrapped data (list)', (assert) => {
  let json = PF.generate_list(PD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  person = store.find('person-list', PD.idOne);
  status = store.find('person-status-list', status.get('id'));
  assert.equal(person.get('status.id'), status.get('id'));
  assert.equal(status.get('people').length, 1);
  assert.deepEqual(status.get('people'), [PD.idOne]);
});

/* PH and ADDRESSES and EMAILS*/
test('person will setup the correct relationship with phone numbers when _deserializeSingle is invoked with relationship already in place', (assert) => {
  let location_level, phonenumber;
  let response = PF.generate(PD.id);
  response.phone_numbers = PNF.get();
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, phone_number_fks: [PND.idOne], role_fk: RD.idOne});
  phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, person_fk: PD.id});
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let person_pk = phonenumber.get('person_fk');
  assert.ok(person_pk);
  assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
  assert.ok(person.get('isNotDirty'));
  assert.equal(phonenumber.get('person_fk'), PD.id);
  assert.ok(!person.get('roleIsDirty'));
});

test('person will setup the correct relationship with phone emails when _deserializeSingle is invoked with no relationship in place', (assert) => {
  let location_level, email;
  let response = PF.generate(PD.id);
  response.emails = EF.get();
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, role_fk: RD.idOne});
  email = store.push('email', {id: ED.idOne, email: ED.emailOne});
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let person_pk = email.get('model_fk');
  assert.ok(person_pk);
  assert.deepEqual(person.get('email_fks'), [ED.idOne, ED.idTwo]);
  assert.ok(person.get('isNotDirty'));
  assert.equal(email.get('model_fk'), PD.id);
});

test('person will setup the correct relationship with phone emails when _deserializeSingle is invoked with person setup with phone email relationship', (assert) => {
  let location_level, email, response = PF.generate(PD.id);
  response.emails = EF.get();
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, email_fks: [ED.idOne], role_fk: RD.idOne});
  email = store.push('email', {id: ED.idOne, email: ED.emailOne});
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let person_pk = email.get('model_fk');
  assert.ok(person_pk);
  assert.deepEqual(person.get('email_fks'), [ED.idOne, ED.idTwo]);
  assert.ok(person.get('isNotDirty'));
  assert.equal(email.get('model_fk'), PD.id);
});

test('person will setup the correct relationship with phone numbers when _deserializeSingle is invoked with no relationship in place', (assert) => {
  let location_level, phonenumber;
  let response = PF.generate(PD.id);
  response.phone_numbers = PNF.get();
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, role_fk: RD.idOne});
  phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let person_pk = phonenumber.get('model_fk');
  assert.ok(person_pk);
  assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
  assert.ok(person.get('isNotDirty'));
  assert.equal(phonenumber.get('model_fk'), PD.id);
});

test('person will setup the correct relationship with phone numbers when _deserializeSingle is invoked with person setup with phone number relationship', (assert) => {
  let location_level, phonenumber, response = PF.generate(PD.id);
  response.phone_numbers = PNF.get();
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, phone_number_fks: [PND.idOne], role_fk: RD.idOne});
  phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let person_pk = phonenumber.get('model_fk');
  assert.ok(person_pk);
  assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
  assert.ok(person.get('isNotDirty'));
  assert.equal(phonenumber.get('model_fk'), PD.id);
});

/* ROLE */
test('role will keep appending when _deserializeList is invoked with many people who play the same role', (assert) => {
  let location_level;
  let json = PF.generate_list(PD.unusedId);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, role_fk: RD.idOne});
  run(() => {
    subject.deserialize(response);
  });
  let original = store.find('role', RD.idOne);
  assert.deepEqual(original.get('people'), [PD.id, PD.unusedId]);
  assert.ok(original.get('isNotDirty'));
});

test('role will setup the correct relationship with location_level when _deserializeSingle is invoked', (assert) => {
  let location_level, response = PF.generate(PD.id);
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, role_fk: RD.idOne});
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let role_location_level = role.get('location_level');
  assert.ok(role_location_level);
  assert.equal(location_level.get('id'), LLD.idOne);
  assert.ok(role_location_level.get('isNotDirty'));
  assert.equal(role.get('location_level_fk'), LLD.idOne);
  assert.deepEqual(role_location_level.get('roles'), [RD.idOne]);
});

/* PERSON LOCATION */
test('person-location m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
  let location_level;
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, person_locations_fks: [], role_fk: RD.idOne});
  let response = PF.generate(PD.id);
  response.locations = [LF.get_fk()];
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 0);
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let original = store.find('person', PD.id);
  locations = original.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('name'), LD.storeName);
  assert.equal(store.find('person-location').get('length'), 1);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('person-location m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
  let location_level, m2m, location;
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, person_locations_fks: [PERSON_LD.idOne], role_fk: RD.idOne});
  location = store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
  assert.equal(person.get('locations.length'), 1);
  let response = PF.generate(PD.id);
  let second_location = LF.get_fk(LD.idTwo);
  second_location.name = LD.storeNameTwo;
  response.locations = [LF.get_fk(), second_location];
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let original = store.find('person', PD.id);
  let locations = original.get('locations');
  assert.equal(locations.get('length'), 2);
  assert.equal(locations.objectAt(0).get('name'), LD.storeName);
  assert.equal(locations.objectAt(1).get('name'), LD.storeNameTwo);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('person-location').get('length'), 2);
});

test('person-location m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
  let location_level, m2m, location;
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  person = store.push('person', {id: PD.id, person_locations_fks: [PERSON_LD.idOne], role_fk: RD.idOne});
  location = store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
  assert.equal(person.get('locations').get('length'), 1);
  let response = PF.generate(PD.id);
  let second_location = LF.get_fk(LD.idTwo);
  second_location.name = LD.storeNameTwo;
  let third_location = LF.get_fk(LD.idThree);
  third_location.name = LD.storeNameThree;
  response.locations = [second_location, third_location];
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let original = store.find('person', PD.id);
  let locations = original.get('locations');
  assert.equal(locations.get('length'), 2);
  assert.equal(locations.objectAt(0).get('id'), LD.idTwo);
  assert.equal(locations.objectAt(1).get('id'), LD.idThree);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('person-location').get('length'), 3);
});

test('person-location m2m added even when person did not exist before the deserializer executes', (assert) => {
  let location_level;
  store.clear('person');
  location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  let response = PF.generate(PD.id);
  response.locations = [LF.get_fk()];
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let person = store.find('person', PD.id);
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('id'), LD.idOne);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('person-location').get('length'), 1);
});

test('destructure inherited obj to first level attrs', assert => {
  let response = PF.detail(PD.idOne);
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  // setting attrs
  assert.equal(person.get('auth_amount'), PD.inherited.auth_amount.value);
  assert.equal(person.get('auth_currency'), PD.inherited.auth_currency.value);
  // settings_object
  assert.deepEqual(person.get('inherited').auth_amount, PD.inherited.auth_amount);
  assert.deepEqual(person.get('inherited').auth_currency, PD.inherited.auth_currency);
});

// TODO: Need to add Currency to Person Deserializer
// test('currency - fk related model', assert => {
//     store.clear('person');
//     let currency = store.push('currency', {id:CD.id, symbol:CD.symbol, name:CD.name, decimal_digits:CD.decimal_digits, code:CD.code, name_plural:CD.name_plural, rounding:CD.rounding, symbol_native:CD.symbol_native});
//     role = store.push('role', {id: RD.idOne, currency_fk: CD.id, people: [PD.id]});
//     let response = PF.generate(PD.id);
//     run(() => {
//         subject.deserialize(response, PD.id);
//     });
//     let person = store.find('person', PD.id);
//     assert.ok(person.get('currency'));
// // assert.equal(currency.get('id'), person.get('currency').get('id'))
// });
