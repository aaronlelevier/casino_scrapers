import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LD from 'bsrs-ember/vendor/defaults/location';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import LF from 'bsrs-ember/vendor/location_fixtures';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PPHD from 'bsrs-ember/vendor/defaults/person-join-phonenumber';
import PEMD from 'bsrs-ember/vendor/defaults/person-join-email';
import CD from 'bsrs-ember/vendor/defaults/currency';
import Person from 'bsrs-ember/models/person';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

const PD = PERSON_DEFAULTS.defaults();

let subject, uuid, location_deserializer, location_level_deserializer, status, locale, person, role;

moduleFor('deserializer:person', 'Unit | Deserializer | person', {
  needs: ['model:person', 'model:random','model:uuid', 'model:person-list', 'model:role', 'model:person-location','model:location', 
    'model:location-level','model:email', 'model:email-type', 'model:phonenumber', 'model:phone-number-type', 'model:person-join-phonenumber', 
    'model:person-join-email', 'service:person-current','service:translations-fetcher', 'service:i18n', 'model:status', 'model:person-status-list', 
    'model:location-status', 'model:locale', 'model:attachment', 'model:currency', 'validator:presence', 'validator:unique-username', 'validator:length', 
    'validator:format', 'validator:has-many'],
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
    uuid = this.container.lookup('model:uuid');
    location_level_deserializer = LocationLevelDeserializer.create({simpleStore: this.store});
    location_deserializer = LocationDeserializer.create({simpleStore: this.store, LocationLevelDeserializer: location_level_deserializer});
    subject = PersonDeserializer.create({simpleStore: this.store, uuid: uuid, LocationDeserializer: location_deserializer});
    run(() => {
      status = this.store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
      this.store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.idOne], location_level_fk: LLD.idOne});
      this.store.push('location-level', {id: LLD.idOne, name: LLD.nameOne, roles: [RD.idOne]});
      person = this.store.push('person', {id: PD.idOne, status_fk: SD.activeId, role_fk: PD.role});
      this.store.push('phone-number-type', {id: PNTD.idOne, name: PNTD.officeName});
      this.store.push('phone-number-type', {id: PNTD.idTwo, name: PNTD.mobileName});
      this.store.push('email-type', {id: ETD.idOne, name: ETD.workEmail});
      this.store.push('email-type', {id: ETD.idTwo, name: ETD.personalEmail});
    });
  }
});

/* LOCALE */
test('person setup correct locale fk with bootstrapped data (detail)', function(assert) {
  let response = PF.generate(PD.idOne);
  run(() => {
    locale = this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne});
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('status_fk'), status.get('id'));
  assert.equal(person.get('status.id'), status.get('id'));
  assert.equal(person.get('locale_fk'), locale.get('id'));
  assert.equal(person.get('locale').get('id'), locale.get('id'));
  assert.deepEqual(locale.get('people'), [PD.idOne]);
  assert.ok(person.get('isNotDirty'));
});

test('person setup correct locale fk with existing locale pointer to person', function(assert) {
  let response = PF.generate(PD.idOne);
  run(() => {
    this.store.push('person', {id: PD.idOne, status_fk: SD.activeId, locale_fk: LOCALED.idOne, role_fk: PD.role});
    locale = this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
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

test('person can be deserialized without a locale (no existing)', function(assert) {
  assert.equal(person.get('locale'), undefined);
  const response = PF.generate(PD.idOne);
  delete response.locale;
  run(() => {
    this.store.push('person', {id: PD.idOne, status_fk: SD.activeId, role_fk: PD.role});
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('locale'), undefined);
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('person can be deserialized without a locale (existing)', function(assert) {
  let response = PF.generate(PD.idOne);
  response.locale = undefined;
  run(() => {
    this.store.push('person', {id: PD.idOne, status_fk: SD.activeId, locale_fk: LOCALED.idOne, role_fk: PD.role});
    locale = this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('locale_fk'), undefined);
  assert.equal(person.get('locale').get('id'), undefined);
  assert.equal(locale.get('people').length, 0);
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

/* STATUS */

test('person setup correct status fk with bootstrapped data (detail)', function(assert) {
  let response = PF.generate(PD.idOne);
  run(() => {
    status = this.store.push('status', {id: SD.activeId, name: SD.activeName});
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('status_fk'), status.get('id'));
  assert.equal(person.get('status').get('id'), status.get('id'));
  assert.deepEqual(status.get('people'), [PD.idOne]);
  assert.ok(person.get('isNotDirty'));
});

test('person setup correct status fk with existing status pointer to person', function(assert) {
  let response = PF.generate(PD.idOne);
  run(() => {
    status = this.store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('status_fk'), status.get('id'));
  assert.equal(person.get('status').get('id'), status.get('id'));
  assert.equal(status.get('people').length, 1);
  assert.ok(person.get('isNotDirty'));
});

test('person setup correct status fk with bootstrapped data (list)', function(assert) {
  let json = PF.generate_list(PD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  person = this.store.find('person-list', PD.idOne);
  status = this.store.find('person-status-list', status.get('id'));
  assert.equal(person.get('status.id'), status.get('id'));
  assert.equal(status.get('people').length, 1);
  assert.deepEqual(status.get('people'), [PD.idOne]);
});

test('person may not have a photo (list)', function(assert) {
  let json = PF.generate_list(PD.idOne);
  delete json.photo;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  person = this.store.find('person-list', PD.idOne);
  assert.equal(person.get('photo.id'), undefined);
});

test('person setup correct photo fk (list)', function(assert) {
  let json = PF.generate_list(PD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  person = this.store.find('person-list', PD.idOne);
  const photo = this.store.find('attachment').objectAt(0);
  assert.equal(person.get('photo.id'), photo.get('id'));
});

/* PHOTO */

test('person setup correct photo fk', function(assert) {
  let response = PF.generate(PD.idOne);
  response.photo = {id: 9, filename: 'wat.jpg'};
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('photo_fk'), 9);
  assert.equal(person.get('photo').get('id'), 9);
  assert.equal(person.get('photo').get('filename'), 'wat.jpg');
  const photo = this.store.find('attachment', 9);
  assert.deepEqual(photo.get('people'), [PD.idOne]);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('photoIsDirty'), false);
});

test('person may not have a photo detail', function(assert) {
  let response = PF.generate(PD.idOne);
  delete response.photo;
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(person.get('photo_fk'), undefined);
  assert.equal(person.get('photo.id'), undefined);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('photoIsNotDirty'), true);
});

test('person setup correct photo fk with existing photo pointer to person', function(assert) {
  let response = PF.generate(PD.idOne);
  response.photo = {id: 10, filename: 'foo.jpg'};
  run(() => {
    this.store.push('attachment', {id: 9, filename: 'wat.jpg', people: [PD.idOne]});
    subject.deserialize(response, PD.idOne);
  });
  const photo = this.store.find('attachment', 10);
  assert.equal(person.get('photo_fk'), photo.get('id'));
  assert.equal(person.get('photo').get('id'), photo.get('id'));
  assert.equal(person.get('photo').get('filename'), photo.get('filename'));
  assert.equal(photo.get('people').length, 1);
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('photoIsDirty'), false);
});

/* PH and EMAILS*/

test('deserialize - email, email_type - no existing relationship', function(assert) {
  let response = PF.detail(PD.idOne);
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(this.store.find('person', PD.idOne).get('id'), PD.idOne);
  let person = this.store.find('person', PD.idOne);
  assert.equal(person.get('name'), PD.baseStoreName);
  // emails
  assert.equal(person.get('emails').get('length'), 2);
  let email_one = person.get('emails').objectAt(1);
  let email_two = person.get('emails').objectAt(0);
  assert.equal(email_one.get('id'), ED.idTwo);
  assert.equal(email_two.get('id'), ED.idOne);
  // email-type
  assert.equal(email_one.get('email_type').get('id'), ETD.idTwo);
  assert.equal(email_one.get('email_type').get('name'), ETD.personalEmail);
  assert.equal(email_two.get('email_type').get('id'), ETD.idOne);
  assert.equal(email_two.get('email_type').get('name'), ETD.workEmail);
  // dirty checking
  assert.ok(email_one.get('emailTypeIsNotDirty'));
  assert.ok(email_one.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize - email, email_type - existing relationship', function(assert) {
  let response = PF.detail(PD.idOne);
  run(() => {
    this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    this.store.push('email-type', {id: ETD.personalId, name: ETD.workEmail, emails: [ED.idOne]});
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  let person = this.store.find('person', PD.idOne);
  assert.equal(person.get('name'), PD.baseStoreName);
  // emails
  assert.equal(person.get('emails').get('length'), 2);
  let email_one = person.get('emails').objectAt(1);
  let email_two = person.get('emails').objectAt(0);
  assert.equal(email_one.get('id'), ED.idTwo);
  assert.equal(email_two.get('id'), ED.idOne);
  // email-type
  assert.equal(email_one.get('email_type').get('id'), ETD.idTwo);
  assert.equal(email_one.get('email_type').get('name'), ETD.personalEmail);
  assert.equal(email_two.get('email_type').get('id'), ETD.idOne);
  assert.equal(email_two.get('email_type').get('name'), ETD.workEmail);
  // dirty checking
  assert.ok(email_one.get('emailTypeIsNotDirty'));
  assert.ok(email_one.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize - phonenumber, phonenumber_type - no existing relationship', function(assert) {
  let response = PF.detail(PD.idOne);
  run(() => {
    subject.deserialize(response, PD.idOne);
  });
  assert.equal(this.store.find('person', PD.idOne).get('id'), PD.idOne);
  let person = this.store.find('person', PD.idOne);
  assert.equal(person.get('name'), PD.baseStoreName);
  // phonenumbers
  assert.equal(person.get('phonenumbers').get('length'), 2);
  let phonenumber_one = person.get('phonenumbers').objectAt(1);
  let phonenumber_two = person.get('phonenumbers').objectAt(0);
  assert.equal(phonenumber_one.get('id'), PND.idTwo);
  assert.equal(phonenumber_two.get('id'), PND.idOne);
  // phonenumber-type
  assert.equal(phonenumber_one.get('phone_number_type').get('id'), PNTD.idTwo);
  assert.equal(phonenumber_one.get('phone_number_type').get('name'), PNTD.mobileName);
  assert.equal(phonenumber_two.get('phone_number_type').get('id'), PNTD.idOne);
  assert.equal(phonenumber_two.get('phone_number_type').get('name'), PNTD.officeName);
  // dirty checking
  assert.ok(phonenumber_one.get('phoneNumberTypeIsNotDirty'));
  assert.ok(phonenumber_one.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize - phonenumber, phonenumber_type - existing relationship', function(assert) {
  let response = PF.detail(PD.idOne);
  run(() => {
    this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    this.store.push('phone-number-type', {id: PNTD.officeId, name: PNTD.officeName, phonenumbers: [PND.idOne]});
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
    subject.deserialize(response, PD.idOne);
  });
  let person = this.store.find('person', PD.idOne);
  assert.equal(person.get('name'), PD.baseStoreName);
  // phonenumbers
  assert.equal(person.get('phonenumbers').get('length'), 2);
  let phonenumber_one = person.get('phonenumbers').objectAt(1);
  let phonenumber_two = person.get('phonenumbers').objectAt(0);
  assert.equal(phonenumber_one.get('id'), PND.idTwo);
  assert.equal(phonenumber_two.get('id'), PND.idOne);
  // phonenumber-type
  assert.equal(phonenumber_one.get('phone_number_type').get('id'), PNTD.idTwo);
  assert.equal(phonenumber_one.get('phone_number_type').get('name'), PNTD.mobileName);
  assert.equal(phonenumber_two.get('phone_number_type').get('id'), PNTD.idOne);
  assert.equal(phonenumber_two.get('phone_number_type').get('name'), PNTD.officeName);
  // dirty checking
  assert.ok(phonenumber_one.get('phoneNumberTypeIsNotDirty'));
  assert.ok(phonenumber_one.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

// test('setup phonenumber and phonenumber type relationship', function(assert) {
//   let location_level, phonenumber;
//   let response = PF.generate(PD.id);
//   response.phone_numbers = PNF.get();
//   run(() => {
//     subject.deserialize(response, PD.id);
//   });
//   person = this.store.find('person', PD.id);
//   assert.equal(person.get('phone_numbers').get('length'), 2);
//   assert.equal(person.get('phone_numbers').objectAt(0).get('phone_number_type.id'), PNTD.idOne);
//   assert.equal(person.get('phone_numbers').objectAt(1).get('phone_number_type.id'), PNTD.idTwo);
// });

// test('person will setup the correct relationship with phone numbers when _deserializeSingle is invoked with relationship already in place', function(assert) {
//   let location_level, phonenumber;
//   let response = PF.generate(PD.id);
//   response.phone_numbers = PNF.get();
//   location_level = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
//   role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
//   person = this.store.push('person', {id: PD.id, phone_number_fks: [PND.idOne], role_fk: RD.idOne});
//   phonenumber = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, person_fk: PD.id});
//   run(() => {
//     subject.deserialize(response, PD.id);
//   });
//   let person_pk = phonenumber.get('person_fk');
//   assert.ok(person_pk);
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
//   assert.ok(person.get('isNotDirty'));
//   assert.equal(phonenumber.get('person_fk'), PD.id);
//   assert.ok(!person.get('roleIsDirty'));
// });

// test('setup email and email type relationship', function(assert) {
//   let response = PF.generate(PD.id);
//   response.emails = EF.get();
//   run(() => {
//     subject.deserialize(response, PD.id);
//   });
//   person = this.store.find('person', PD.id);
//   assert.equal(person.get('emails').get('length'), 2);
//   assert.equal(person.get('emails').objectAt(0).get('email_type.id'), ETD.idOne);
//   assert.equal(person.get('emails').objectAt(1).get('email_type.id'), ETD.idTwo);
// });

// test('person will setup the correct relationship with phone emails when _deserializeSingle is invoked with no relationship in place', function(assert) {
//   let location_level, email;
//   let response = PF.generate(PD.id);
//   response.emails = EF.get();
//   location_level = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
//   role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
//   person = this.store.push('person', {id: PD.id, role_fk: RD.idOne});
//   email = this.store.push('email', {id: ED.idOne, email: ED.emailOne});
//   run(() => {
//     subject.deserialize(response, PD.id);
//   });
//   let person_pk = email.get('model_fk');
//   assert.ok(person_pk);
//   assert.deepEqual(person.get('email_fks'), [ED.idOne, ED.idTwo]);
//   assert.ok(person.get('isNotDirty'));
//   assert.equal(email.get('model_fk'), PD.id);
// });

// test('person will setup the correct relationship with phone emails when _deserializeSingle is invoked with person setup with phone email relationship', function(assert) {
//   let location_level, email, response = PF.generate(PD.id);
//   response.emails = EF.get();
//   location_level = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
//   role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
//   person = this.store.push('person', {id: PD.id, email_fks: [ED.idOne], role_fk: RD.idOne});
//   email = this.store.push('email', {id: ED.idOne, email: ED.emailOne});
//   run(() => {
//     subject.deserialize(response, PD.id);
//   });
//   let person_pk = email.get('model_fk');
//   assert.ok(person_pk);
//   assert.deepEqual(person.get('email_fks'), [ED.idOne, ED.idTwo]);
//   assert.ok(person.get('isNotDirty'));
//   assert.equal(email.get('model_fk'), PD.id);
// });

// test('person will setup the correct relationship with phone numbers when _deserializeSingle is invoked with no relationship in place', function(assert) {
//   let location_level, phonenumber;
//   let response = PF.generate(PD.id);
//   response.phone_numbers = PNF.get();
//   location_level = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
//   role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
//   person = this.store.push('person', {id: PD.id, role_fk: RD.idOne});
//   phonenumber = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
//   run(() => {
//     subject.deserialize(response, PD.id);
//   });
//   let person_pk = phonenumber.get('model_fk');
//   assert.ok(person_pk);
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
//   assert.ok(person.get('isNotDirty'));
//   assert.equal(phonenumber.get('model_fk'), PD.id);
// });

// test('person will setup the correct relationship with phone numbers when _deserializeSingle is invoked with person setup with phone number relationship', function(assert) {
//   let location_level, phonenumber, response = PF.generate(PD.id);
//   response.phone_numbers = PNF.get();
//   location_level = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
//   role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
//   person = this.store.push('person', {id: PD.id, phone_number_fks: [PND.idOne], role_fk: RD.idOne});
//   phonenumber = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
//   run(() => {
//     subject.deserialize(response, PD.id);
//   });
//   let person_pk = phonenumber.get('model_fk');
//   assert.ok(person_pk);
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
//   assert.ok(person.get('isNotDirty'));
//   assert.equal(phonenumber.get('model_fk'), PD.id);
// });

/* ROLE */
test('role will keep appending when _deserializeList is invoked with many people who play the same role', function(assert) {
  let json = PF.generate_list(PD.unusedId);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    person = this.store.push('person', {id: PD.id, role_fk: RD.idOne});
    subject.deserialize(response);
  });
  let original = this.store.find('role', RD.idOne);
  assert.deepEqual(original.get('people'), [PD.id, PD.unusedId]);
  assert.ok(original.get('isNotDirty'));
});

test('role will setup the correct relationship with location_level when _deserializeSingle is invoked', function(assert) {
  let location_level, response = PF.generate(PD.id);
  run(() => {
    location_level = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    person = this.store.push('person', {id: PD.id, role_fk: RD.idOne});
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
test('person-location m2m is set up correctly using deserialize single (starting with no m2m relationship)', function(assert) {
  run(() => {
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    person = this.store.push('person', {id: PD.id, person_locations_fks: [], role_fk: RD.idOne});
  });
  let response = PF.generate(PD.id);
  response.locations = [LF.get_fk()];
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 0);
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let original = this.store.find('person', PD.id);
  locations = original.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('name'), LD.storeName);
  assert.equal(this.store.find('person-location').get('length'), 1);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('person-location m2m is added after deserialize single (starting with existing m2m relationship)', function(assert) {
  run(() => {
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
    role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    person = this.store.push('person', {id: PD.id, person_locations_fks: [PERSON_LD.idOne], role_fk: RD.idOne});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
  });
  assert.equal(person.get('locations.length'), 1);
  let response = PF.generate(PD.id);
  let second_location = LF.get_fk(LD.idTwo);
  second_location.name = LD.storeNameTwo;
  response.locations = [LF.get_fk(), second_location];
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let original = this.store.find('person', PD.id);
  let locations = original.get('locations');
  assert.equal(locations.get('length'), 2);
  assert.equal(locations.objectAt(0).get('name'), LD.storeName);
  assert.equal(locations.objectAt(1).get('name'), LD.storeNameTwo);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(this.store.find('person-location').get('length'), 2);
});

test('person-location m2m is removed when server payload no longer reflects what server has for m2m relationship', function(assert) {
  run(() => {
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
    role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    person = this.store.push('person', {id: PD.id, person_locations_fks: [PERSON_LD.idOne], role_fk: RD.idOne});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
  });
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
  let original = this.store.find('person', PD.id);
  let locations = original.get('locations');
  assert.equal(locations.get('length'), 2);
  assert.equal(locations.objectAt(0).get('id'), LD.idTwo);
  assert.equal(locations.objectAt(1).get('id'), LD.idThree);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(this.store.find('person-location').get('length'), 3);
});

test('person-location m2m added even when person did not exist before the deserializer executes', function(assert) {
  run(() => {
    this.store.clear('person');
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    role = this.store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
  });
  let response = PF.generate(PD.id);
  response.locations = [LF.get_fk()];
  run(() => {
    subject.deserialize(response, PD.id);
  });
  let person = this.store.find('person', PD.id);
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('id'), LD.idOne);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(this.store.find('person-location').get('length'), 1);
});

test('destructure inherited obj to first level attrs', function(assert) {
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
// test('currency - fk related model', function(assert) {
//     store.clear('person');
//     let currency = this.store.push('currency', {id:CD.id, symbol:CD.symbol, name:CD.name, decimal_digits:CD.decimal_digits, code:CD.code, name_plural:CD.name_plural, rounding:CD.rounding, symbol_native:CD.symbol_native});
//     role = this.store.push('role', {id: RD.idOne, currency_fk: CD.id, people: [PD.id]});
//     let response = PF.generate(PD.id);
//     run(() => {
//         subject.deserialize(response, PD.id);
//     });
//     let person = this.store.find('person', PD.id);
//     assert.ok(person.get('currency'));
// // assert.equal(currency.get('id'), person.get('currency').get('id'))
// });
