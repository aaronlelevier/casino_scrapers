import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PPHD from 'bsrs-ember/vendor/defaults/person-join-phonenumber';
import PEMD from 'bsrs-ember/vendor/defaults/person-join-email';
import LD from 'bsrs-ember/vendor/defaults/location';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

const PD = PERSON_DEFAULTS.defaults();

let person, role;

moduleFor('model:person', 'Unit | Model | person', {
  needs: ['model:role', 'model:currency', 'model:phonenumber', 'model:phone-number-type', 
    'model:location', 'model:location-level', 'model:person-location', 'service:currency',
    'service:person-current','service:translations-fetcher','service:i18n', 'model:uuid', 
    'model:status', 'model:person-join-phonenumber', 'model:person-join-email', 'model:email', 
    'model:email-type', 'model:locale', 'validator:presence', 'validator:unique-username', 
    'validator:length', 'validator:format', 'validator:has-many', 'model:attachment'],
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
    run(() => {
      person = this.store.push('person', {id: PD.idOne, first_name: PD.first_name, last_name: PD.last_name, 
        role_fk: RD.idOne, status_fk: SD.activeId, locale_fk: LOCALED.idOne, detail: true});
      role = this.store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.idOne]});
      this.store.push('status', {id: SD.activeId, people: [PD.idOne]});
      this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
    });
  },
  afterEach() {
    delete this.store;
  }
});

test('fullname property is a computed of first and last', function(assert) {
  assert.equal(person.get('fullname'), PD.first_name + ' ' + PD.last_name);
  person.set('first_name', 'wat');
  assert.equal(person.get('fullname'), 'wat ' + PD.last_name);
  person.set('last_name', 'man');
  assert.equal(person.get('fullname'), 'wat man');
});

// test('related phone numbers are not dirty when no phone numbers present', function(assert) {
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.unusedId});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

/* LOCALE */
test('related locale should return one locale for a person', function(assert) {
  run(() => {
    this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('localeIsNotDirty'));
});

test('change_locale will update the persons locale and dirty the model', function(assert) {
  let inactive_locale;
  run(() => {
    this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
    inactive_locale = this.store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwo, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idOne);
  person.change_locale(inactive_locale.get('id'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idTwo);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('localeIsDirty'));
});

test('change_locale can be set to null', function(assert) {
  run(() => {
    this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  });
  assert.equal(person.get('locale').get('id'), LOCALED.idOne);
  person.change_locale(null);
  assert.equal(person.get('locale'), null);
});

test('save person will set locale_fk to current locale id', function(assert) {
  let inactive_locale;
  run(() => {
    this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
    inactive_locale = this.store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwo, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idOne);
  person.change_locale(inactive_locale.get('id'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idTwo);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('localeIsDirty'));
  person.saveRelated();
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!person.get('localeIsDirty'));
  assert.equal(person.get('locale_fk'), LOCALED.idTwo);
  assert.equal(person.get('locale.id'), LOCALED.idTwo);
});

test('rollback person will set locale to current locale_fk', function(assert) {
  let inactive_locale;
  run(() => {
    this.store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
    inactive_locale = this.store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwo, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idOne);
  person.change_locale(inactive_locale.get('id'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idTwo);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('localeIsDirty'));
  person.rollback();
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('roleIsNotDirty'));
  assert.ok(!person.get('localeIsDirty'));
  assert.ok(person.get('locationsIsNotDirty'));
  assert.equal(person.get('locale.id'), LOCALED.idOne);
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
});

/* STATUS */
test('related status should return one status for a person', function(assert) {
  run(() => {
    this.store.push('status', {id: SD.activeId, name: SD.activeName});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('statusIsNotDirty'));
  assert.ok(person.get('roleIsNotDirty'));
});

test('change_status will update the persons status and dirty the model', function(assert) {
  let inactive_status;
  run(() => {
    this.store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
    inactive_status = this.store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []});
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

test('save person will set status_fk to current status id', function(assert) {
  let inactive_status;
  run(() => {
    this.store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
    inactive_status = this.store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []});
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

test('rollback person will set status to current status_fk', function(assert) {
  let inactive_status;
  run(() => {
    this.store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
    inactive_status = this.store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('status_fk'), SD.activeId);
  assert.equal(person.get('status.id'), SD.activeId);
  person.change_status(inactive_status.get('id'));
  assert.equal(person.get('status_fk'), SD.activeId);
  assert.equal(person.get('status.id'), SD.inactiveId);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('statusIsDirty'));
  person.rollback();
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!person.get('statusIsDirty'));
  assert.equal(person.get('status.id'), SD.activeId);
  assert.equal(person.get('status_fk'), SD.activeId);
});

/* ROLE */

test('related role is not dirty with original role model', function(assert) {
  assert.ok(person.get('roleIsNotDirty'));
});

test('related role only returns the single matching item even when multiple roles exist', function(assert) {
  run(() => {
    person = this.store.push('person', {id: PD.idOne});
    this.store.push('role', {id: RD.idOne, people: [PD.idOne, PD.unusedId]});
    this.store.push('role', {id: RD.idTwo, people: ['123-abc-defg']});
  });
  let role = person.get('role');
  assert.equal(role.get('id'), RD.idOne);
});

test('related role will update when the roles people array suddenly has the person pk (might be initially but person has a default role)', function(assert) {
  run(() => {
    role = this.store.push('role', {id: RD.idOne, people: [PD.unusedId]});
  });
  assert.equal(person.get('role'), undefined);
  person.change_role(role);
  assert.ok(person.get('role'));
  assert.equal(person.get('role.id'), RD.idOne);
});

test('related role will update when the roles people array changes and is dirty', function(assert) {
  run(() => {
    this.store.clear('person');
    person = this.store.push('person', {id: PD.idOne, detail: true});
    role = this.store.push('role', {id: RD.idOne, people: [PD.unusedId]});
  });
  assert.equal(person.get('role'), undefined);
  person.change_role(role);
  assert.ok(person.get('role'));
  assert.equal(person.get('role.id'), RD.idOne);
  assert.ok(person.get('roleIsDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('related role is not dirty if changed back to original role', function(assert) {
  let role_change;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, role_fk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, people: [PD.idOne]});
    role_change = this.store.push('role', {id: RD.idTwo, people: []});
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

test('related role is not dirty if after rollback and save', function(assert) {
  let role_change;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, role_fk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, people: [PD.idOne]});
    role_change = this.store.push('role', {id: RD.idTwo, people: []});
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

/* PHOTO */

test('related photo should return one photo for a person', function(assert) {
  run(() => {
    this.store.push('attachment', {id: 9});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('photoIsNotDirty'), true);
});

test('change_photo will update the persons photo and dirty the model', function(assert) {
  let inactive_photo;
  run(() => {
    inactive_photo = this.store.push('attachment', {id: 9, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('photo_fk'), undefined);
  assert.equal(person.get('photo.id'), undefined);
  person.change_photo(inactive_photo.get('id'));
  assert.equal(person.get('photo_fk'), undefined);
  assert.equal(person.get('photo.id'), 9);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('photoIsDirty'));
});

test('save person will set photo_fk to current photo id', function(assert) {
  let inactive_photo;
  run(() => {
    inactive_photo = this.store.push('attachment', {id: 9, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.change_photo(inactive_photo.get('id'));
  assert.equal(person.get('photo_fk'), undefined);
  assert.equal(person.get('photo.id'), 9);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('photoIsDirty'));
  person.saveRelated();
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!person.get('photoIsDirty'));
  assert.equal(person.get('photo_fk'), 9);
  assert.equal(person.get('photo.id'), 9);
});

test('rollback person will set photo to current photo_fk', function(assert) {
  let inactive_photo;
  run(() => {
    inactive_photo = this.store.push('attachment', {id: 9, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.change_photo(inactive_photo.get('id'));
  assert.equal(person.get('photo_fk'), undefined);
  assert.equal(person.get('photo.id'), 9);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('photoIsDirty'));
  person.rollback();
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!person.get('photoIsDirty'));
  assert.equal(person.get('photo.id'), undefined);
  assert.equal(person.get('photo_fk'), undefined);
});

test('rollback person will set photo to old photo_fk', function(assert) {
  let active_photo, inactive_photo;
  run(() => {
    this.store.push('person', {id: PD.idOne, photo_fk: 9});
    active_photo = this.store.push('attachment', {id: 9, people: [PD.idOne]});
    inactive_photo = this.store.push('attachment', {id: 8, people: []});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('photo_fk'), 9);
  assert.equal(person.get('photo.id'), 9);
  person.change_photo(inactive_photo.get('id'));
  assert.equal(person.get('photo_fk'), 9);
  assert.equal(person.get('photo.id'), 8);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('photoIsDirty'));
  person.rollback();
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!person.get('photoIsDirty'));
  assert.equal(person.get('photo.id'), 9);
  assert.equal(person.get('photo_fk'), 9);
});

/* PHONE NUMBERS */

test('related phone numbers are not dirty with original phone number model', function(assert) {
  let person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    this.store.push('phonenumber', { id: PND.idOne, number: PND.numberOne, type: PNTD.officeId });
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 1);
  assert.equal(person.get('person_phonenumbers_ids').get('length'), 1);
  assert.equal(person.get('person_phonenumbers_ids')[0], PPHD.idOne);
  assert.equal(person.get('person_phonenumbers_fks')[0], PPHD.idOne);
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', function(assert) {
  let phone_number, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.idOne});
    this.store.push('phone-number-type', {id: PNTD.idOne, phonenumbers: [PND.idOne]});
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
  });
  assert.ok(phone_number.get('isNotDirty'));
  assert.ok(person.get('phonenumbersIsNotDirty'));
  phone_number.change_phone_number_type({id: PNTD.idTwo});
  assert.ok(phone_number.get('phoneNumberTypeIsDirty'));
  assert.ok(person.get('phonenumbersIsDirty'));
});

test('save related will iterate over each phone number and save that model', function(assert) {
  let first_phone_number, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne, PPHD.idTwo]});
    first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    this.store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
    this.store.push('person-join-phonenumber', {id: PPHD.idTwo, phonenumber_pk: PND.idTwo, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 2);
  assert.ok(person.get('phonenumbersIsNotDirty'));
  first_phone_number.change_phone_number_type({id: PNTD.mobileId});
  assert.ok(person.get('phonenumbersIsDirty'));
  person.savePhonenumbers();
  person.savePhonenumbersContainer();
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('savePhonenumbers will remove any phone number model with no (valid) value', function(assert) {
  let first_phone_number, second_phone_number, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne, PPHD.idTwo, PPHD.idThree]});
    first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    this.store.push('phonenumber', {id: PND.idThree, phone_number_type_fk: PNTD.mobileId});
    this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    this.store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo, PND.idThree]});
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
    this.store.push('person-join-phonenumber', {id: PPHD.idTwo, phonenumber_pk: PND.idTwo, person_pk: PD.idOne});
    this.store.push('person-join-phonenumber', {id: PPHD.idThree, phonenumber_pk: PND.idThree, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 3);
  assert.equal(this.store.find('phonenumber').get('length'), 3);
  run(() => {
    person.savePhonenumbers();
    person.savePhonenumbersContainer();
  });
  assert.equal(person.get('phonenumbers').get('length'), 2);
  assert.equal(this.store.find('phonenumber').get('length'), 3);
  first_phone_number.set('number', '');
  run(() => {
    person.savePhonenumbers();
    person.savePhonenumbersContainer();
  });
  assert.equal(person.get('phonenumbers').get('length'), 1);
  assert.equal(this.store.find('phonenumber').get('length'), 3);
  second_phone_number.set('number', '');
  run(() => {
    person.savePhonenumbers();
    person.savePhonenumbersContainer();
  });
  assert.equal(person.get('phonenumbers').get('length'), 0);
  assert.equal(this.store.find('phonenumber').get('length'), 3);
});

test('phonenumbersIsDirty behaves correctly for existing phone numbers', function(assert) {
  let first_phone_number, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: '', phone_number_type_fk: PNTD.officeId});
    this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 1);
  assert.ok(person.get('phonenumbersIsNotDirty'));
  run(() => {
    this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
  });
  assert.ok(person.get('phonenumbersIsDirty'));
  first_phone_number.set('number', '');
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('phonenumbersIsDirty behaves correctly for newly added phone numbers - not dirty when number is not valid and dirty tracking on number', function(assert) {
  let person, phone_number;
  run(() => {
    person = this.store.push('person', {id: PD.idOne});
    phone_number = this.store.push('phonenumber', {id: PND.idOne, number: '', phone_number_type_fk: PNTD.officeId});
    this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
  });
  assert.equal(person.get('phonenumbers').get('length'), 0);
  assert.ok(person.get('phonenumbersIsNotDirty'));
  // add
  run(() => {
    person.add_phonenumber({id: PND.idOne, number: ''});
  });
  assert.equal(person.get('phonenumbers').get('length'), 1);
  // not dirty even though added
  assert.ok(person.get('phonenumbersIsNotDirty'));
  phone_number.set('number', PND.numberTwo);
  // dirty
  assert.ok(person.get('phonenumbersIsDirty'));
  phone_number.set('number', '');
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('rollback related will iterate over each phone number and rollback that model', function(assert) {
  let first_phone_number, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne, PPHD.idTwo]});
    first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    this.store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
    this.store.push('person-join-phonenumber', {id: PPHD.idTwo, phonenumber_pk: PND.idTwo, person_pk: PD.idOne});
  });
  assert.ok(person.get('phonenumbersIsNotDirty'));
  first_phone_number.change_phone_number_type({id: PNTD.mobileId});
  assert.ok(person.get('phonenumbersIsDirty'));
  person.rollback();
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('when phone number is removed after render, the person model is dirty (two phone numbers)', function(assert) {
  let person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    this.store.push('phonenumber', {id: PND.idOne, number: PND.numberTwo, phone_number_type_fk: PNTD.officeId});
    this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    this.store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.equal(person.get('phonenumbers').get('length'), 1);
  run(() => {
    person.remove_phonenumber(PND.idOne);
  });
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.equal(person.get('phonenumbers').get('length'), 0);
});

/* EMAIL */

test('related emails are not dirty with original email model', function(assert) {
  let person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    this.store.push('email', { id: ED.idOne, email: ED.emailOne, type: ETD.personalId });
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 1);
  assert.equal(person.get('person_emails_ids').get('length'), 1);
  assert.equal(person.get('person_emails_ids')[0], PEMD.idOne);
  assert.equal(person.get('person_emails_fks')[0], PEMD.idOne);
  assert.ok(person.get('emailsIsNotDirty'));
});

test('related email model is dirty when email is dirty (and email is not newly added)', function(assert) {
  let email, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.idOne});
    this.store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  assert.ok(email.get('isNotDirty'));
  assert.ok(person.get('emailsIsNotDirty'));
  email.change_email_type({id: ETD.idTwo});
  assert.ok(email.get('emailTypeIsDirty'));
  assert.ok(person.get('emailsIsDirty'));
});

test('save related will iterate over each email and save that model', function(assert) {
  let first_email, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne, PEMD.idTwo]});
    first_email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    this.store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    this.store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    this.store.push('email-type', {id: ETD.workId, emails: [ED.idTwo]});
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
    this.store.push('person-join-email', {id: PEMD.idTwo, email_pk: ED.idTwo, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 2);
  assert.ok(person.get('emailsIsNotDirty'));
  first_email.change_email_type({id: ETD.workId});
  assert.ok(person.get('emailsIsDirty'));
  person.saveEmails();
  person.saveEmailsContainer();
  assert.ok(person.get('emailsIsNotDirty'));
});

test('saveEmails will remove any email model with no (valid) value', function(assert) {
  let first_email, second_email, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne, PEMD.idTwo, PEMD.idThree]});
    first_email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    second_email = this.store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    // no email
    this.store.push('email', {id: ED.idThree, email_type_fk: ETD.workId});
    this.store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    this.store.push('email-type', {id: ETD.workId, emails: [ED.idTwo, ED.idThree]});
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
    this.store.push('person-join-email', {id: PEMD.idTwo, email_pk: ED.idTwo, person_pk: PD.idOne});
    this.store.push('person-join-email', {id: PEMD.idThree, email_pk: ED.idThree, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 3);
  assert.equal(this.store.find('email').get('length'), 3);
  run(() => {
    person.saveEmails();
    person.saveEmailsContainer();
  });
  assert.equal(person.get('emails').get('length'), 2);
  assert.equal(this.store.find('email').get('length'), 3);
  first_email.set('email', '');
  run(() => {
    person.saveEmails();
    person.saveEmailsContainer();
  });
  assert.equal(person.get('emails').get('length'), 1);
  assert.equal(this.store.find('email').get('length'), 3);
  second_email.set('email', '');
  run(() => {
    person.saveEmails();
    person.saveEmailsContainer();
  });
  assert.equal(person.get('emails').get('length'), 0);
  assert.equal(this.store.find('email').get('length'), 3);
});

test('emailsIsDirty behaves correctly for existing emails', function(assert) {
  let first_email, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    first_email = this.store.push('email', {id: ED.idOne, email: '', email_type_fk: ETD.personalId});
    this.store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 1);
  assert.ok(person.get('emailsIsNotDirty'));
  run(() => {
    this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
  });
  assert.ok(person.get('emailsIsDirty'));
  first_email.set('email', '');
  assert.ok(person.get('emailsIsNotDirty'));
});

test('emailsIsDirty behaves correctly for newly added emails - not dirty when email is not valid and dirty tracking on email', function(assert) {
  let person, email;
  run(() => {
    person = this.store.push('person', {id: PD.idOne});
    email = this.store.push('email', {id: ED.idOne, email: '', email_type_fk: ETD.personalId});
    this.store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
  });
  assert.equal(person.get('emails').get('length'), 0);
  assert.ok(person.get('emailsIsNotDirty'));
  // add
  run(() => {
    person.add_email({id: ED.idOne, email: ''});
  });
  assert.equal(person.get('emails').get('length'), 1);
  // not dirty even though added
  assert.ok(person.get('emailsIsNotDirty'));
  email.set('email', ED.emailTwo);
  // dirty
  assert.ok(person.get('emailsIsDirty'));
  email.set('email', '');
  assert.ok(person.get('emailsIsNotDirty'));
});

test('rollback related will iterate over each email and rollback that model', function(assert) {
  let first_email, person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne, PEMD.idTwo]});
    first_email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    this.store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    this.store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    this.store.push('email-type', {id: ETD.workId, emails: [ED.idTwo]});
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
    this.store.push('person-join-email', {id: PEMD.idTwo, email_pk: ED.idTwo, person_pk: PD.idOne});
  });
  assert.ok(person.get('emailsIsNotDirty'));
  first_email.change_email_type({id: ETD.workId});
  assert.ok(person.get('emailsIsDirty'));
  person.rollback();
  assert.ok(person.get('emailsIsNotDirty'));
});

test('when email is removed after render, the person model is dirty (two emails)', function(assert) {
  let person;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    this.store.push('email', {id: ED.idOne, email: ED.emailTwo, email_type_fk: ETD.personalId});
    this.store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    this.store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.equal(person.get('emails').get('length'), 1);
  run(() => {
    person.remove_email(ED.idOne);
  });
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.equal(person.get('emails').get('length'), 0);
});

// /* PHONE NUMBERS AND ADDRESSES AND EMAILS*/
// test('related phone numbers are not dirty with original phone number model', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

// test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   assert.ok(phone_number.get('isNotDirty'));
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(phone_number.get('isDirtyOrRelatedDirty'));
//   assert.ok(person.get('phonenumbersIsDirty'));
// });

// test('person dirty tracks their emails and email types', function(assert) {
//   this.store.clear('person');
//   person = this.store.push('person', {id: PD.idOne, username: PD.username, status_fk: SD.activeId, email_fks: [ED.idOne], locale_fk: LOCALED.idOne, role_fk: RD.idOne, detail: true});
//   let email = this.store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(email.get('isDirtyOrRelatedDirty'));
//   assert.ok(person.get('emailsIsDirty'));
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   email.change_email_type({id: ETD.workId});
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.ok(email.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(!person.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.workId});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('person dirty tracks their phonenumbers and phonenumber types', assert => {
//   this.store.clear('person');
//   person = this.store.push('person', {id: PD.idOne, username: PD.username, phone_number_fks: [PND.idOne], status_fk: SD.activeId, locale_fk: LOCALED.idOne, role_fk: RD.idOne, detail: true});
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(phone_number.get('isNotDirty'));
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   person.set('username', 'abc');
//   assert.ok(person.get('isDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   person.set('username', PD.username);
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(phone_number.get('isDirtyOrRelatedDirty'));
//   assert.ok(person.get('phonenumbersIsDirty'));
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   phone_number.change_phone_number_type({id: PNTD.officeId});
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.ok(phone_number.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(!person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.officeId});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('save related will iterate over each phone number and save that model', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId, model_fk: PD.idOne});
//   this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   this.store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   first_phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(person.get('phonenumbersIsDirty'));
//   person.savePhoneNumbers();
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   second_phone_number.change_phone_number_type({id: PNTD.officeId});
//   assert.ok(person.get('phonenumbersIsDirty'));
//   person.savePhoneNumbers();
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

// test('savePhoneNumbers will remove any phone number model with no (valid) value', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = this.store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   first_phone_number.set('type', PNTD.officeId);
//   second_phone_number.set('type', PNTD.officeId);
//   third_phone_number.set('type', PNTD.officeId);
//   first_phone_number.set('number', PND.numberOne);
//   second_phone_number.set('number', PND.numberTwo);
//   assert.equal(this.store.find('phonenumber').get('length'), 3);
//   person.savePhoneNumbers();
//   assert.equal(this.store.find('phonenumber').get('length'), 2);
//   assert.equal(this.store.find('phonenumber').objectAt(0).get('id'), PND.idOne);
//   assert.equal(this.store.find('phonenumber').objectAt(1).get('id'), PND.idTwo);
//   first_phone_number.set('number', '');
//   person.savePhoneNumbers();
//   assert.equal(this.store.find('phonenumber').get('length'), 1);
//   assert.equal(this.store.find('phonenumber').objectAt(0).get('id'), PND.idTwo);
//   second_phone_number.set('number', ' ');
//   person.savePhoneNumbers();
//   assert.equal(this.store.find('phonenumber').get('length'), 0);
// });

// test('phoneNumbersDirty behaves correctly for phone numbers (newly) added', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = this.store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(person.get('phonenumbers').get('length'), 3);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   first_phone_number.set('number', PND.numberOne);
//   assert.ok(person.get('phonenumbersIsDirty'));
//   first_phone_number.set('number', '');
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

// test('phoneNumbersDirty behaves correctly for existing phone numbers', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   first_phone_number.set('number', PND.numberTwo);
//   assert.ok(person.get('phonenumbersIsDirty'));
//   first_phone_number.set('number', '');
//   assert.ok(person.get('phonenumbersIsDirty'));
// });

// test('phonenumbersIsDirty is false when a phone number is added but does not have a (valid) number', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = this.store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(this.store.find('phonenumber').get('length'), 3);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(this.store.find('phonenumber').get('length'), 3);
// });

// test('phonenumbersIsDirty is false when a phone number is added but does not have a (valid) number without phone_number_fks', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: []});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = this.store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(this.store.find('phonenumber').get('length'), 3);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(this.store.find('phonenumber').get('length'), 3);
// });

// test('rollback related will iterate over each phone number and rollback that model', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId, model_fk: PD.idOne});
//   this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   this.store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   first_phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(person.get('phonenumbersIsDirty'));
//   person.rollback();
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   second_phone_number.change_phone_number_type({id: PNTD.officeId});
//   assert.ok(person.get('phonenumbersIsDirty'));
//   person.rollback();
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

// test('when new phone number is added, the person model is not dirty unless number is altered', function(assert) {
//   let phone_number_two;
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     phone_number_two = this.store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number_two.set('number', '888-888-8888');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   phone_number_two.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.set('number', '999-999-9999');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when new phone number is added, the person model is dirty when the type or number attrs are modified', function(assert) {
//   let phone_number_two;
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     phone_number_two = this.store.push('phonenumber', {id: PND.idTwo, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//     this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne, PND.idTwo]});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number_two.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   phone_number_two.rollback();
//   assert.equal(phone_number_two.get('phone_number_type.id'), PNTD.officeId);
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.set('number', '5');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   assert.equal(phone_number.get('number'), '5');
// });

// test('when new phone number is added after render, the person model is not dirty when a new phone number is appended to the array of phone numbers', function(assert) {
//   let added_phone_num;
//   person = this.store.push('person', {id: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let phonenumbers = person.get('phonenumbers');
//   run(function() {
//     added_phone_num = phonenumbers.push({id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('when phone number is removed after render, the person model is dirty (two phone numbers)', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let phonenumbers = person.get('phonenumbers');
//   run(function() {
//     phonenumbers.remove(PND.idOne);
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when no phone number and new phone number is added and updated, expect related isDirty to be true', function(assert) {
//   let phone_number;
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   this.store.push('phonenumber', {id: PND.idOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   run(function() {
//     phone_number = this.store.push('phonenumber', {id: PND.idTwo, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//     this.store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne, PND.idTwo]});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   phone_number.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.set('number', '888-888-8888');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when phone number is removed after render, the person model is dirty', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = this.store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     this.store.push('phonenumber', {id: phone_number.get('id'), removed: true});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('related emails are not dirty with original emailes model', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = this.store.push('email', {id: ED.idOne, type: ETD.personalId, model_fk: PD.idOne});
//   assert.ok(person.get('emailsIsNotDirty'));
// });

// test('related email model is dirty when email is dirty (and email is not newly added)', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = this.store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.ok(email.get('isNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(email.get('isDirtyOrRelatedDirty'));
//   assert.ok(person.get('emailsIsDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('save related will iterate over each email and save that model', function(assert) {
//   person = this.store.push('person', {id: PD.idOne});
//   let first_email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   let second_email = this.store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.personalId, model_fk: PD.idOne});
//   this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   this.store.push('email-type', {id: ETD.personalId, emails: [ED.idTwo]});
//   assert.ok(person.get('emailsIsNotDirty'));
//   first_email.change_email_type({id: ETD.personalId});
//   assert.ok(person.get('emailsIsDirty'));
//   person.saveEmails();
//   assert.ok(person.get('emailsIsNotDirty'));
//   second_email.change_email_type({id: ETD.workId});
//   assert.ok(person.get('emailsIsDirty'));
//   person.saveEmails();
//   assert.ok(person.get('emailsIsNotDirty'));
// });

// test(' emailsIsDirty behaves correctly for emails (newly) added', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = this.store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   let second_email = this.store.push('email', {id: ED.idTwo, type: ETD.personalId, model_fk: PD.idOne});
//   let third_email = this.store.push('email', {id: ED.idThree, type: ETD.personalId, model_fk: PD.idOne});
//   assert.equal(person.get('emails').get('length'), 3);
//   assert.ok(person.get('emailsIsNotDirty'));
//   first_email.set('email', ED.emailOne);
//   assert.ok(person.get('emailsIsDirty'));
//   first_email.set('email', '');
//   assert.ok(person.get('emailsIsNotDirty'));
// });

// test('saveEmails will remove any email model with no (valid) value', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = this.store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   let second_email = this.store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: PD.idOne});
//   let third_email = this.store.push('email', {id: ED.idThree, type: ETD.workId, model_fk: PD.idOne});
//   first_email.set('type', ETD.workId);
//   second_email.set('type', ETD.workId);
//   third_email.set('type', ETD.workId);
//   first_email.set('email', ED.emailOne);
//   second_email.set('email', ED.emailTwo);
//   assert.equal(this.store.find('email').get('length'), 3);
//   person.saveEmails();
//   assert.equal(this.store.find('email').get('length'), 2);
//   assert.equal(this.store.find('email').objectAt(0).get('id'), ED.idOne);
//   assert.equal(this.store.find('email').objectAt(1).get('id'), ED.idTwo);
//   first_email.set('email', '');
//   person.saveEmails();
//   assert.equal(this.store.find('email').get('length'), 1);
//   assert.equal(this.store.find('email').objectAt(0).get('id'), ED.idTwo);
//   second_email.set('email', ' ');
//   person.saveEmails();
//   assert.equal(this.store.find('email').get('length'), 0);
// });

// test('emailsIsDirty is false when an email is added but does not have a (valid) email', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = this.store.push('email', {id: ED.idOne, type: ETD.personalId, model_fk: PD.idOne});
//   let second_email = this.store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: PD.idOne});
//   let third_email = this.store.push('email', {id: ED.idThree, type: ETD.workId, model_fk: PD.idOne});
//   assert.equal(this.store.find('email').get('length'), 3);
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.equal(this.store.find('email').get('length'), 3);
// });

// test('emailsDirty behaves correctly for existing emails', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let first_email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.personalId, model_fk: PD.idOne});
//   assert.equal(person.get('emails').get('length'), 1);
//   assert.ok(person.get('emailsIsNotDirty'));
//   first_email.set('email', ED.emailTwo);
//   assert.ok(person.get('emailsIsDirty'));
//   first_email.set('email', '');
//   assert.ok(person.get('emailsIsDirty'));
// });

// test('emailsIsDirty is false when an email is added but does not have a (valid) email without email_fks', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: []});
//   let first_email = this.store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   let second_email = this.store.push('email', {id: ED.idTwo, type: ETD.personalId, model_fk: PD.idOne});
//   let third_email = this.store.push('email', {id: ED.idThree, type: ETD.personalId, model_fk: PD.idOne});
//   assert.equal(this.store.find('email').get('length'), 3);
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.equal(this.store.find('email').get('length'), 3);
// });

// test('rollback related will iterate over each email and rollback that model', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo]});
//   let first_email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   let second_email = this.store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.personalId, model_fk: PD.idOne});
//   this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   this.store.push('email-type', {id: ETD.personalId, emails: [ED.idTwo]});
//   assert.ok(person.get('emailsIsNotDirty'));
//   first_email.change_email_type({id: ETD.personalId});
//   assert.ok(person.get('emailsIsDirty'));
//   assert.ok(first_email.get('isDirtyOrRelatedDirty'));
//   person.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   second_email.change_email_type({id: ETD.workId});
//   assert.ok(second_email.get('isDirtyOrRelatedDirty'));
//   person.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('when new email is added, the person model is not dirty unless email is altered', function(assert) {
//   let email_two;
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = this.store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     email_two = this.store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email_two.set('email', 'snewcomer@gmaail.com');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   email_two.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'aalever@yaho.com');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when new email is added, the person model is not dirty when the type or email attrs are modified', function(assert) {
//   let email_two;
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = this.store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     email_two = this.store.push('email', {id: ED.idTwo, email_type_fk: ETD.workId, model_fk: PD.idOne});
//     this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne, ED.idTwo]});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email_two.change_email_type({id: ETD.personalId});
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   email_two.rollback();
//   assert.equal(email_two.get('email_type.id'), ETD.workId);
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'snewcomer@msn.com');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   assert.ok(email.get('email'),'wat@gmail.com');
// });

// test('when new email is added after render, the person model is not dirty when new email is appended to the array of emails', function(assert) {
//   let added_email;
//   person = this.store.push('person', {id: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let emails = person.get('emails');
//   run(function() {
//     added_email = emails.push({id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('when email is removed after render, the person model is dirty (two emails)', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo]});
//   let email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.workId, model_fk: PD.idOne});
//   this.store.push('email', {id: ED.idTwo, email: ED.emailTwo, city: ED.cityTwo, type: ETD.workId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let emails = person.get('emails');
//   run(function() {
//     emails.remove(ED.idOne);
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when no email and new email is added and updated, expect related isDirty to be true', function(assert) {
//   let email;
//   person = this.store.push('person', {id: PD.idOne});
//   this.store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   run(function() {
//     email = this.store.push('email', {id: ED.idTwo, email_type_fk: ETD.workId, model_fk: PD.idOne});
//     this.store.push('email-type', {id: ETD.workId, emails: [ED.idOne, ED.idTwo]});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   email.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'snewcomer@gmail.com');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when email is removed after render, the person model is dirty', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = this.store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.workId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     this.store.push('email', {id: email.get('id'), removed: true});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

test('rollback role will reset the previously used role when switching from one role to another', function(assert) {
  let admin_role, another_role;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, role_fk: RD.idTwo});
    this.store.push('role', {id: RD.idTwo, name: RD.nameTwo, people: [PD.unusedId, PD.idOne]});
    admin_role = this.store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.unusedId]});
    another_role = this.store.push('role', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3', name: 'another', people: [PD.unusedId]});
  });
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('roleIsNotDirty'));
  assert.ok(person.get('statusIsNotDirty'));
  assert.ok(person.get('locationsIsNotDirty'));
  assert.ok(person.get('phonenumbersIsNotDirty'));
  // assert.ok(person.get('addressesIsNotDirty'));
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
  person.rollback();
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
  person.rollback();
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
test('locations property should return all associated locations or empty array', function(assert) {
  let m2m;
  run(() => {
    m2m = this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
  });
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('name'), LD.storeName);
  run(() => {
    this.store.push('person-location', {id: m2m.get('id'), removed: true});
  });
  assert.equal(person.get('locations').get('length'), 0);
});

test('locations property is not dirty when no location present (undefined)', function(assert) {
  run(() => {
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: undefined});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: undefined});
  });
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty when no location present (empty array)', function(assert) {
  run(() => {
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: []});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: []});
  });
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty with original location model', function(assert) {
  let location;
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    location = this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  });
  assert.equal(person.get('locations').get('length'), 1);
  assert.equal(person.get('person_locations_fks').length, 1);
  assert.equal(person.get('person_locations_ids').length, 1);
  assert.ok(person.get('locationsIsNotDirty'));
  location.set('name', LD.storeNameTwo);
  assert.ok(location.get('isDirty'));
  assert.equal(person.get('person_locations_fks').length, 1);
  assert.equal(person.get('person_locations_ids').length, 1);
  assert.ok(person.get('locationsIsNotDirty'));
  assert.equal(person.get('locations').get('length'), 1);
  assert.equal(person.get('locations').objectAt(0).get('name'), LD.storeNameTwo);
});

test('locations property only returns the single matching item even when multiple locations exist', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idThree, person_pk: PD.unusedId, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idTwo});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idThree]});
  });
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('id'), LD.idTwo);
});

test('locations property returns multiple matching items when multiple locations exist', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idTwo});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idTwo]});
    this.store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_locations_fks: [PERSON_LD.idOne]});
  });
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 2);
  assert.equal(locations.objectAt(0).get('id'), LD.idOne);
  assert.equal(locations.objectAt(1).get('id'), LD.idTwo);
});

test('locations property will update when the m2m array suddenly has the person pk (starting w/ empty array)', function(assert) {
  let location;
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: []});
    location = {id: LD.idOne, person_locations_fks: []};
    this.store.push('location', {id: LD.idTwo, person_locations_fks: []});
  });
  assert.equal(person.get('locations').get('length'), 0);
  person.add_location(location);
  assert.equal(person.get('locations').get('length'), 1);
  assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
});

test('locations property will update when the m2m array suddenly has the person pk', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  });
  let location_two = {id: LD.idTwo, person_locations_fks: []};
  assert.equal(person.get('locations').get('length'), 1);
  person.add_location(location_two);
  assert.equal(person.get('locations').get('length'), 2);
  assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
  assert.equal(person.get('locations').objectAt(1).get('id'), LD.idTwo);
});

test('locations property will update when the m2m array suddenly removes the person', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  });
  assert.equal(person.get('locations').get('length'), 1);
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 0);
});

//TODO: do no want to dirty person model when location name is changed
test('when location is changed dirty tracking works as expected', function(assert) {
  let location;
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    location = this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  });
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  location.set('name', LD.storeName);
  assert.ok(location.get('isDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  location.rollback();
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  location.set('name', LD.storeNameTwo);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  location.rollback();
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting undefined)', function(assert) {
  let location = {id: LD.idOne, name: LD.storeName, person_locations_fks: undefined};
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: undefined});
  });
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('locationsIsNotDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.add_location(location);
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.notOk(person.get('person_locations_fks'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddenly assigned it shows as a dirty relationship (starting with an empty array)', function(assert) {
  let location = {id: LD.idOne, name: LD.storeName, person_locations_fks: []};
  run(() => {
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: []});
  });
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('locationsIsNotDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.add_location(location);
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently assigned it shows as a dirty relationship (starting with legit value)', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  });
  let location_two = {id: LD.idTwo, person_locations_fks: []};
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('locationsIsNotDirty'));
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.add_location(location_two);
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently removed it shows as a dirty relationship', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  });
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
    this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
  });
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('rollback location will reset the previously used locations when switching from valid locations to nothing', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
    this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
  });
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  person.rollback();
  person.rollbackLocations();
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idOne);
  person.remove_location(LD.idTwo);
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  person.rollback();
  person.rollbackLocations();
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback location will reset the previous locations when switching from one location to another and saving in between each step', function(assert) {
  let location;
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
    location = this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
  });
  let location_three = {id: LD.unusedId, person_locations_fks: [PERSON_LD.idThree]};
  let location_four = {id: LD.anotherId, person_locations_fks: [PERSON_LD.idFour]};
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  location.set('name', 'watwat');
  person.save();
  person.saveRelated();
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idOne);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.equal(person.get('locations').get('length'), 1);
  person.save();
  person.saveRelated();
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.add_location(location_three);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  person.save();
  person.saveRelated();
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idTwo);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.equal(person.get('locations').get('length'), 1);
  person.save();
  person.saveRelated();
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('locations').get('length'), 1);
  person.add_location(location_four);
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  person.rollback();
  person.rollback();
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('location_ids computed returns a flat list of ids for each location', function(assert) {
  let person;
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
    this.store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
    this.store.push('location', {id: LD.unusedId, person_locations_fks: [PERSON_LD.idThree]});
    this.store.push('location', {id: LD.anotherId, person_locations_fks: [PERSON_LD.idFour]});
  });
  assert.equal(person.get('locations').get('length'), 2);
  assert.deepEqual(person.get('locations_ids'), [LD.idOne, LD.idTwo]);
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 1);
  assert.deepEqual(person.get('locations_ids'), [LD.idTwo]);
});
/*END PERSON LOCATION M2M*/

// test('cleanup phone numbers works as expected on removal and save', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   let phone_numbers = store.find('phone-number');
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   run(function() {
//     this.store.push('phonenumber', {id: second_phone_number.get('id'), removed: true});
//   });
//   assert.ok(person.get('phonenumbersIsDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 2);
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
//   person.cleanupPhoneNumberFKs();
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne]);
// });

// test('cleanup phone numbers works as expected on add and save', function(assert) {
//   let second_phone_number;
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 1);
//   run(function() {
//     second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   });
//   second_phone_number.set('number', PND.numberTwo);
//   assert.ok(person.get('phonenumbersIsDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 2);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 2);
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne]);
//   person.cleanupPhoneNumberFKs();
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
// });

// test('cleanup phone numbers works as expected on removal and rollback', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   run(function() {
//     this.store.push('phonenumber', {id: second_phone_number.get('id'), removed: true});
//   });
//   assert.ok(person.get('phonenumbersIsDirty'));
//   person.rollbackPhoneNumbers();
//   assert.deepEqual(person.get('removed'), undefined);
// });

// test('cleanup phone numbers works as expected on add and rollback', function(assert) {
//   let second_phone_number;
//   person = this.store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let first_phone_number = this.store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 1);
//   run(function() {
//     second_phone_number = this.store.push('phonenumber', {id: PND.idTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   });
//   assert.ok(second_phone_number.get('invalid_number'));
//   assert.equal(person.get('phonenumbers').get('length'), 2);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 2);
//   person.rollbackPhoneNumbers();
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 1);
// });

// test('cleanup addresses works as expected on removal and save', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
//   let first_address = this.store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: PD.idOne});
//   let second_address = this.store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   run(function() {
//     this.store.push('address', {id: second_address.get('id'), removed: true});
//   });
//   assert.ok(person.get('addressesIsDirty'));
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 2);
//   assert.deepEqual(person.get('address_fks'), [AD.idOne, AD.idTwo]);
//   person.cleanupAddressFKs();
//   assert.deepEqual(person.get('address_fks'), [AD.idOne]);
// });

// test('cleanup addresses works as expected on add and save', function(assert) {
//   let second_address;
//   person = this.store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
//   let first_address = this.store.push('address', {id: AD.idOne, address: AD.streetOne, type: ATD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 1);
//   run(function() {
//     second_address = this.store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   });
//   second_address.set('address', AD.streetTwo);
//   assert.ok(person.get('addressesIsDirty'));
//   assert.equal(person.get('addresses').get('length'), 2);
//   assert.equal(person.get('addresses_all').get('length'), 2);
//   assert.deepEqual(person.get('address_fks'), [AD.idOne]);
//   person.cleanupAddressFKs();
//   assert.deepEqual(person.get('address_fks'), [AD.idOne, AD.idTwo]);
// });

// test('cleanup addresses works as expected on removal and rollback', function(assert) {
//   person = this.store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
//   let first_address = this.store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: PD.idOne});
//   let second_address = this.store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   run(function() {
//     this.store.push('address', {id: second_address.get('id'), removed: true});
//   });
//   assert.ok(person.get('addressesIsDirty'));
//   person.rollbackAddresses();
//   assert.deepEqual(person.get('removed'), undefined);
// });

// test('cleanup addresses works as expected on add and rollback', function(assert) {
//   let second_address;
//   person = this.store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
//   let first_address = this.store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 1);
//   run(function() {
//     second_address = this.store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   });
//   assert.ok(second_address.get('invalid_address'));
//   assert.equal(person.get('addresses').get('length'), 2);
//   assert.equal(person.get('addresses_all').get('length'), 2);
//   person.rollbackAddresses();
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 1);
// });

test('person-location join models are correctly filtered on for the current User when calling change_role and updating a Users Locations', function(assert) {
  let new_role;
  run(() => {
    this.store.push('location-level', {id: LLD.idOne, roles: [RD.idOne, RD.idTwo], locations: [LD.idOne]});
    this.store.push('location-level', {id: LLD.idTwo, roles: [RD.idOne, RD.idTwo], locations: []});
    this.store.push('role', {id: RD.idOne, people: [PD.idOne], location_level_fk: LLD.idTwo});
    new_role = this.store.push('role', {id: RD.idTwo, people: [], location_level_fk: LLD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.unusedId, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne], location_level_fk: LLD.idOne});
  });
  assert.equal(person.get('locations').get('length'), 1);
  person.change_role(new_role);
  assert.equal(person.get('locations').get('length'), 1);
  assert.equal(person.get('locationsIsDirty'), false);
});

test('serialize', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.unusedId, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne], location_level_fk: LLD.idOne});
  });
  const ret = person.serialize();
  assert.equal(ret.id, person.get('id'));
  assert.equal(ret.username, person.get('username'));
  assert.equal(ret.first_name, person.get('first_name'));
  assert.equal(ret.middle_initial, person.get('middle_initial'));
  assert.equal(ret.last_name, person.get('last_name'));
  assert.equal(ret.title, person.get('title'));
  assert.equal(ret.employee_id, person.get('employee_id'));
  assert.equal(ret.auth_amount, person.get('auth_amount'));
  assert.equal(ret.auth_currency, person.get('auth_currency'));
  assert.equal(ret.role, person.get('role.id'));
  assert.equal(ret.status, person.get('status.id'));
  assert.deepEqual(ret.locations, person.get('locations_ids'));
  assert.deepEqual(ret.emails, person.get('emails_ids'));
  assert.deepEqual(ret.phone_numbers, person.get('phonenumbers_ids'));
  assert.equal(ret.locale, person.get('locale.id'));
  assert.equal(ret.password, person.get('password'));
  assert.equal(ret.photo, person.get('photo.id'));
});

test('serialize with no locale', function(assert) {
  run(() => {
    person = this.store.push('person', { id: PD.idOne, locale_fk: undefined });
    this.store.push('locale', { id: LOCALED.idOne, name: LOCALED.nameOne, people: [] });
  });
  const ret = person.serialize();
  assert.equal(ret.id, person.get('id'));
  assert.strictEqual(ret.locale, null);
});

test('createSerialize', function(assert) {
  run(() => {
    this.store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
    this.store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.unusedId, location_pk: LD.idOne});
    person = this.store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
    this.store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne], location_level_fk: LLD.idOne});
  });
  const ret = person.createSerialize();
  assert.equal(ret.id, person.get('id'));
  assert.equal(ret.username, person.get('username'));
  assert.equal(ret.first_name, person.get('first_name'));
  assert.equal(ret.middle_initial, person.get('middle_initial'));
  assert.equal(ret.last_name, person.get('last_name'));
  assert.equal(ret.role, person.get('role.id'));
  assert.equal(ret.status, person.get('status.id'));
  assert.equal(ret.locale, person.get('locale.id'));
  assert.equal(ret.password, person.get('password'));
});

test('createSerialize with no locale', function(assert) {
  run(() => {
    person = this.store.push('person', { id: PD.idOne, locale_fk: undefined });
    this.store.push('locale', { id: LOCALED.idOne, name: LOCALED.nameOne, people: [] });
  });
  const ret = person.createSerialize();
  assert.equal(ret.id, person.get('id'));
  assert.equal(ret.locale, undefined);
});
