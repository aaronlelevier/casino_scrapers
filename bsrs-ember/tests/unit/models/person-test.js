import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import CurrencyDefaults from 'bsrs-ember/vendor/defaults/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import PD from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PPHD from 'bsrs-ember/vendor/defaults/person-join-phonenumber';
import PEMD from 'bsrs-ember/vendor/defaults/person-join-email';
// import AF from 'bsrs-ember/vendor/address_fixtures';
// import ATD from 'bsrs-ember/vendor/defaults/address-type';
// import AD from 'bsrs-ember/vendor/defaults/address';
import LD from 'bsrs-ember/vendor/defaults/location';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, uuid, person, role;

module('unit: model | person test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency', 'model:phonenumber', 'model:phone-number-type', 'model:location', 'model:location-level', 'model:person-location', 'service:currency','service:person-current','service:translations-fetcher','service:i18n', 'model:uuid', 'model:status', 'model:person-join-phonenumber', 'model:person-join-email', 'model:email', 'model:email-type', 'model:locale', 'validator:presence', 'validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many']);
    run(() => {
      person = store.push('person', {id: PD.idOne, first_name: PD.first_name, last_name: PD.last_name, role_fk: RD.idOne, status_fk: SD.activeId, locale_fk: LOCALED.idOne, detail: true});
      role = store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.idOne]});
      store.push('status', {id: SD.activeId, people: [PD.idOne]});
      store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
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

// test('related phone numbers are not dirty when no phone numbers present', (assert) => {
//   let phone_number = store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.unusedId});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

// test('related addresses are not dirty when no addresses present', (assert) => {
//   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.unusedId});
//   assert.ok(person.get('addressesIsNotDirty'));
// });

/* LOCALE */
test('related locale should return one locale for a person', (assert) => {
  let locale = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('localeIsNotDirty'));
});

test('change_locale will update the persons locale and dirty the model', (assert) => {
  let locale = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  let inactive_locale = store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwo, people: []});
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idOne);
  person.change_locale(inactive_locale.get('id'));
  assert.equal(person.get('locale_fk'), LOCALED.idOne);
  assert.equal(person.get('locale.id'), LOCALED.idTwo);
  assert.ok(person.get('isDirtyOrRelatedDirty'));
  assert.ok(person.get('localeIsDirty'));
});

test('save person will set locale_fk to current locale id', (assert) => {
  let locale = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  let inactive_locale = store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwo, people: []});
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

test('rollback person will set locale to current locale_fk', (assert) => {
  let locale = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, people: [PD.idOne]});
  let inactive_locale = store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwo, people: []});
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
test('related status should return one status for a person', (assert) => {
  let status = store.push('status', {id: SD.activeId, name: SD.activeName});
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(person.get('statusIsNotDirty'));
  assert.ok(person.get('roleIsNotDirty'));
});

test('change_status will update the persons status and dirty the model', (assert) => {
  let status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
  let inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []});
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
  let status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
  let inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []});
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
  let status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
  let inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []});
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

test('related role is not dirty with original role model', (assert) => {
  assert.ok(person.get('roleIsNotDirty'));
});

test('related role only returns the single matching item even when multiple roles exist', (assert) => {
  person = store.push('person', {id: PD.idOne});
  store.push('role', {id: RD.idOne, people: [PD.idOne, PD.unusedId]});
  store.push('role', {id: RD.idTwo, people: ['123-abc-defg']});
  let role = person.get('role');
  assert.equal(role.get('id'), RD.idOne);
});

test('related role will update when the roles people array suddenly has the person pk (might be initially but person has a default role)', (assert) => {
  role = store.push('role', {id: RD.idOne, people: [PD.unusedId]});
  assert.equal(person.get('role'), undefined);
  person.change_role(role);
  assert.ok(person.get('role'));
  assert.equal(person.get('role.id'), RD.idOne);
});

test('related role will update when the roles people array changes and is dirty', (assert) => {
  store.clear('person');
  person = store.push('person', {id: PD.idOne, detail: true});
  role = store.push('role', {id: RD.idOne, people: [PD.unusedId]});
  assert.equal(person.get('role'), undefined);
  person.change_role(role);
  assert.ok(person.get('role'));
  assert.equal(person.get('role.id'), RD.idOne);
  assert.ok(person.get('roleIsDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('related role is not dirty if changed back to original role', (assert) => {
  person = store.push('person', {id: PD.idOne, role_fk: RD.idOne});
  role = store.push('role', {id: RD.idOne, people: [PD.idOne]});
  let role_change = store.push('role', {id: RD.idTwo, people: []});
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
  person = store.push('person', {id: PD.idOne, role_fk: RD.idOne});
  role = store.push('role', {id: RD.idOne, people: [PD.idOne]});
  let role_change = store.push('role', {id: RD.idTwo, people: []});
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

/* PHONE NUMBERS */

test('related phone numbers are not dirty with original phone number model', (assert) => {
  let person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    store.push('phonenumber', { id: PND.idOne, number: PND.numberOne, type: PNTD.officeId });
    store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 1);
  assert.equal(person.get('person_phonenumbers_ids').get('length'), 1);
  assert.equal(person.get('person_phonenumbers_ids')[0], PPHD.idOne);
  assert.equal(person.get('person_phonenumbers_fks')[0], PPHD.idOne);
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', (assert) => {
  let phone_number, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.idOne});
    store.push('phone-number-type', {id: PNTD.idOne, phonenumbers: [PND.idOne]});
    store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
  });
  assert.ok(phone_number.get('isNotDirty'));
  assert.ok(person.get('phonenumbersIsNotDirty'));
  phone_number.change_phone_number_type({id: PNTD.idTwo});
  assert.ok(phone_number.get('phoneNumberTypeIsDirty'));
  assert.ok(person.get('phonenumbersIsDirty'));
});

test('save related will iterate over each phone number and save that model', (assert) => {
  let first_phone_number, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne, PPHD.idTwo]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
    store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
    store.push('person-join-phonenumber', {id: PPHD.idTwo, phonenumber_pk: PND.idTwo, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 2);
  assert.ok(person.get('phonenumbersIsNotDirty'));
  first_phone_number.change_phone_number_type({id: PNTD.mobileId});
  assert.ok(person.get('phonenumbersIsDirty'));
  person.savePhonenumbers();
  person.savePhonenumbersContainer();
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('savePhonenumbers will remove any phone number model with no (valid) value', (assert) => {
  let first_phone_number, second_phone_number, third_phone_number, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne, PPHD.idTwo, PPHD.idThree]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    third_phone_number = store.push('phonenumber', {id: PND.idThree, phone_number_type_fk: PNTD.mobileId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo, PND.idThree]});
    store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
    store.push('person-join-phonenumber', {id: PPHD.idTwo, phonenumber_pk: PND.idTwo, person_pk: PD.idOne});
    store.push('person-join-phonenumber', {id: PPHD.idThree, phonenumber_pk: PND.idThree, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 3);
  assert.equal(store.find('phonenumber').get('length'), 3);
  run(() => {
    person.savePhonenumbers();
    person.savePhonenumbersContainer();
  });
  assert.equal(person.get('phonenumbers').get('length'), 2);
  assert.equal(store.find('phonenumber').get('length'), 3);
  first_phone_number.set('number', '');
  run(() => {
    person.savePhonenumbers();
    person.savePhonenumbersContainer();
  });
  assert.equal(person.get('phonenumbers').get('length'), 1);
  assert.equal(store.find('phonenumber').get('length'), 3);
  second_phone_number.set('number', '');
  run(() => {
    person.savePhonenumbers();
    person.savePhonenumbersContainer();
  });
  assert.equal(person.get('phonenumbers').get('length'), 0);
  assert.equal(store.find('phonenumber').get('length'), 3);
});

test('phonenumbersIsDirty behaves correctly for existing phone numbers', (assert) => {
  let first_phone_number, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: '', phone_number_type_fk: PNTD.officeId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('phonenumbers').get('length'), 1);
  assert.ok(person.get('phonenumbersIsNotDirty'));
  run(() => {
    store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
  });
  assert.ok(person.get('phonenumbersIsDirty'));
  first_phone_number.set('number', '');
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('phonenumbersIsDirty behaves correctly for newly added phone numbers - not dirty when number is not valid and dirty tracking on number', (assert) => {
  let person, phone_number;
  run(() => {
    person = store.push('person', {id: PD.idOne});
    phone_number = store.push('phonenumber', {id: PND.idOne, number: '', phone_number_type_fk: PNTD.officeId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
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

test('rollback related will iterate over each phone number and rollback that model', (assert) => {
  let first_phone_number, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne, PPHD.idTwo]});
    first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId});
    store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
    store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
    store.push('person-join-phonenumber', {id: PPHD.idTwo, phonenumber_pk: PND.idTwo, person_pk: PD.idOne});
  });
  assert.ok(person.get('phonenumbersIsNotDirty'));
  first_phone_number.change_phone_number_type({id: PNTD.mobileId});
  assert.ok(person.get('phonenumbersIsDirty'));
  person.rollback();
  assert.ok(person.get('phonenumbersIsNotDirty'));
});

test('when phone number is removed after render, the person model is dirty (two phone numbers)', (assert) => {
  let person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_phonenumbers_fks: [PPHD.idOne]});
    store.push('phonenumber', {id: PND.idOne, number: PND.numberTwo, phone_number_type_fk: PNTD.officeId});
    store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
    store.push('person-join-phonenumber', {id: PPHD.idOne, phonenumber_pk: PND.idOne, person_pk: PD.idOne});
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

test('related emails are not dirty with original email model', (assert) => {
  let person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    store.push('email', { id: ED.idOne, email: ED.emailOne, type: ETD.personalId });
    store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 1);
  assert.equal(person.get('person_emails_ids').get('length'), 1);
  assert.equal(person.get('person_emails_ids')[0], PEMD.idOne);
  assert.equal(person.get('person_emails_fks')[0], PEMD.idOne);
  assert.ok(person.get('emailsIsNotDirty'));
});

test('related email model is dirty when email is dirty (and email is not newly added)', (assert) => {
  let email, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
    store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  assert.ok(email.get('isNotDirty'));
  assert.ok(person.get('emailsIsNotDirty'));
  email.change_email_type({id: ETD.idTwo});
  assert.ok(email.get('emailTypeIsDirty'));
  assert.ok(person.get('emailsIsDirty'));
});

test('save related will iterate over each email and save that model', (assert) => {
  let first_email, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne, PEMD.idTwo]});
    first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('email-type', {id: ETD.workId, emails: [ED.idTwo]});
    store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
    store.push('person-join-email', {id: PEMD.idTwo, email_pk: ED.idTwo, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 2);
  assert.ok(person.get('emailsIsNotDirty'));
  first_email.change_email_type({id: ETD.workId});
  assert.ok(person.get('emailsIsDirty'));
  person.saveEmails();
  person.saveEmailsContainer();
  assert.ok(person.get('emailsIsNotDirty'));
});

test('saveEmails will remove any email model with no (valid) value', (assert) => {
  let first_email, second_email, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne, PEMD.idTwo, PEMD.idThree]});
    first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    second_email = store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    // no email
    store.push('email', {id: ED.idThree, email_type_fk: ETD.workId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('email-type', {id: ETD.workId, emails: [ED.idTwo, ED.idThree]});
    store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
    store.push('person-join-email', {id: PEMD.idTwo, email_pk: ED.idTwo, person_pk: PD.idOne});
    store.push('person-join-email', {id: PEMD.idThree, email_pk: ED.idThree, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 3);
  assert.equal(store.find('email').get('length'), 3);
  run(() => {
    person.saveEmails();
    person.saveEmailsContainer();
  });
  assert.equal(person.get('emails').get('length'), 2);
  assert.equal(store.find('email').get('length'), 3);
  first_email.set('email', '');
  run(() => {
    person.saveEmails();
    person.saveEmailsContainer();
  });
  assert.equal(person.get('emails').get('length'), 1);
  assert.equal(store.find('email').get('length'), 3);
  second_email.set('email', '');
  run(() => {
    person.saveEmails();
    person.saveEmailsContainer();
  });
  assert.equal(person.get('emails').get('length'), 0);
  assert.equal(store.find('email').get('length'), 3);
});

test('emailsIsDirty behaves correctly for existing emails', (assert) => {
  let first_email, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    first_email = store.push('email', {id: ED.idOne, email: '', email_type_fk: ETD.personalId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
  });
  assert.equal(person.get('emails').get('length'), 1);
  assert.ok(person.get('emailsIsNotDirty'));
  run(() => {
    store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
  });
  assert.ok(person.get('emailsIsDirty'));
  first_email.set('email', '');
  assert.ok(person.get('emailsIsNotDirty'));
});

test('emailsIsDirty behaves correctly for newly added emails - not dirty when email is not valid and dirty tracking on email', (assert) => {
  let person, email;
  run(() => {
    person = store.push('person', {id: PD.idOne});
    email = store.push('email', {id: ED.idOne, email: '', email_type_fk: ETD.personalId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
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

test('rollback related will iterate over each email and rollback that model', (assert) => {
  let first_email, person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne, PEMD.idTwo]});
    first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.personalId});
    store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.workId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('email-type', {id: ETD.workId, emails: [ED.idTwo]});
    store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
    store.push('person-join-email', {id: PEMD.idTwo, email_pk: ED.idTwo, person_pk: PD.idOne});
  });
  assert.ok(person.get('emailsIsNotDirty'));
  first_email.change_email_type({id: ETD.workId});
  assert.ok(person.get('emailsIsDirty'));
  person.rollback();
  assert.ok(person.get('emailsIsNotDirty'));
});

test('when email is removed after render, the person model is dirty (two emails)', (assert) => {
  let person;
  run(() => {
    person = store.push('person', {id: PD.idOne, person_emails_fks: [PEMD.idOne]});
    store.push('email', {id: ED.idOne, email: ED.emailTwo, email_type_fk: ETD.personalId});
    store.push('email-type', {id: ETD.personalId, emails: [ED.idOne]});
    store.push('person-join-email', {id: PEMD.idOne, email_pk: ED.idOne, person_pk: PD.idOne});
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
// test('related phone numbers are not dirty with original phone number model', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

// // test('related addresses are not dirty with original addresses model', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
// //   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   assert.ok(person.get('addressesIsNotDirty'));
// // });


// test('related phone number model is dirty when phone number is dirty (and phone number is not newly added)', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   assert.ok(phone_number.get('isNotDirty'));
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(phone_number.get('isDirtyOrRelatedDirty'));
//   assert.ok(person.get('phonenumbersIsDirty'));
// });

// // test('related address model is dirty when address is dirty (and address is not newly added)', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
// //   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   assert.ok(address.get('isNotDirty'));
// //   address.set('type', ATD.shippingId);
// //   assert.ok(address.get('isDirty'));
// //   assert.ok(person.get('addressesIsDirty'));
// //   assert.ok(person.get('isDirtyOrRelatedDirty'));
// // });


// test('person dirty tracks their emails and email types', (assert) => {
//   store.clear('person');
//   person = store.push('person', {id: PD.idOne, username: PD.username, status_fk: SD.activeId, email_fks: [ED.idOne], locale_fk: LOCALED.idOne, role_fk: RD.idOne, detail: true});
//   let email = store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
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
//   store.clear('person');
//   person = store.push('person', {id: PD.idOne, username: PD.username, phone_number_fks: [PND.idOne], status_fk: SD.activeId, locale_fk: LOCALED.idOne, role_fk: RD.idOne, detail: true});
//   let phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
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

// test('save related will iterate over each phone number and save that model', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId, model_fk: PD.idOne});
//   store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
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

// // test('save related will iterate over each address and save that model', (assert) => {
// //   person = store.push('person', {id: PD.idOne});
// //   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: PD.idOne});
// //   let second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: PD.idOne});
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   first_address.set('type', ATD.shippingId);
// //   assert.ok(person.get('addressesIsDirty'));
// //   person.saveAddresses();
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   second_address.set('type', ATD.officeId);
// //   assert.ok(person.get('addressesIsDirty'));
// //   person.saveAddresses();
// //   assert.ok(person.get('addressesIsNotDirty'));
// // });


// test('savePhoneNumbers will remove any phone number model with no (valid) value', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   first_phone_number.set('type', PNTD.officeId);
//   second_phone_number.set('type', PNTD.officeId);
//   third_phone_number.set('type', PNTD.officeId);
//   first_phone_number.set('number', PND.numberOne);
//   second_phone_number.set('number', PND.numberTwo);
//   assert.equal(store.find('phonenumber').get('length'), 3);
//   person.savePhoneNumbers();
//   assert.equal(store.find('phonenumber').get('length'), 2);
//   assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idOne);
//   assert.equal(store.find('phonenumber').objectAt(1).get('id'), PND.idTwo);
//   first_phone_number.set('number', '');
//   person.savePhoneNumbers();
//   assert.equal(store.find('phonenumber').get('length'), 1);
//   assert.equal(store.find('phonenumber').objectAt(0).get('id'), PND.idTwo);
//   second_phone_number.set('number', ' ');
//   person.savePhoneNumbers();
//   assert.equal(store.find('phonenumber').get('length'), 0);
// });

// // test('saveAddresses will remove any address model with no (valid) value', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
// //   let first_address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   let second_address = store.push('address', {id: AD.idTwo, type: ATD.officeId, model_fk: PD.idOne});
// //   let third_address = store.push('address', {id: AD.idThree, type: ATD.officeId, model_fk: PD.idOne});
// //   first_address.set('type', ATD.officeId);
// //   second_address.set('type', ATD.officeId);
// //   third_address.set('type', ATD.officeId);
// //   first_address.set('address', AD.streetOne);
// //   second_address.set('address', AD.streetTwo);
// //   assert.equal(store.find('address').get('length'), 3);
// //   person.saveAddresses();
// //   assert.equal(store.find('address').get('length'), 2);
// //   assert.equal(store.find('address').objectAt(0).get('id'), AD.idOne);
// //   assert.equal(store.find('address').objectAt(1).get('id'), AD.idTwo);
// //   first_address.set('address', '');
// //   person.saveAddresses();
// //   assert.equal(store.find('address').get('length'), 1);
// //   assert.equal(store.find('address').objectAt(0).get('id'), AD.idTwo);
// //   second_address.set('address', ' ');
// //   person.saveAddresses();
// //   assert.equal(store.find('address').get('length'), 0);
// // });


// test('phoneNumbersDirty behaves correctly for phone numbers (newly) added', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(person.get('phonenumbers').get('length'), 3);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   first_phone_number.set('number', PND.numberOne);
//   assert.ok(person.get('phonenumbersIsDirty'));
//   first_phone_number.set('number', '');
//   assert.ok(person.get('phonenumbersIsNotDirty'));
// });

// // test('addressesIsDirty behaves correctly for addresses (newly) added', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
// //   let first_address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   let second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: PD.idOne});
// //   let third_address = store.push('address', {id: AD.idThree, type: ATD.shippingId, model_fk: PD.idOne});
// //   assert.equal(person.get('addresses').get('length'), 3);
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   first_address.set('address', AD.streetOne);
// //   assert.ok(person.get('addressesIsDirty'));
// //   first_address.set('address', '');
// //   assert.ok(person.get('addressesIsNotDirty'));
// // });


// test('phoneNumbersDirty behaves correctly for existing phone numbers', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   first_phone_number.set('number', PND.numberTwo);
//   assert.ok(person.get('phonenumbersIsDirty'));
//   first_phone_number.set('number', '');
//   assert.ok(person.get('phonenumbersIsDirty'));
// });

// // test('addressesDirty behaves correctly for existing addresses', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
// //   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ATD.officeId, model_fk: PD.idOne});
// //   assert.equal(person.get('addresses').get('length'), 1);
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   first_address.set('address', AD.streetTwo);
// //   assert.ok(person.get('addressesIsDirty'));
// //   first_address.set('address', '');
// //   assert.ok(person.get('addressesIsDirty'));
// // });


// test('phonenumbersIsDirty is false when a phone number is added but does not have a (valid) number', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo, PND.idThree]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(store.find('phonenumber').get('length'), 3);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(store.find('phonenumber').get('length'), 3);
// });

// // test('addressesIsDirty is false when an address is added but does not have a (valid) address', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo, AD.idThree]});
// //   let first_address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   let second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: PD.idOne});
// //   let third_address = store.push('address', {id: AD.idThree, type: ATD.shippingId, model_fk: PD.idOne});
// //   assert.equal(store.find('address').get('length'), 3);
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   assert.equal(store.find('address').get('length'), 3);
// // });


// test('phonenumbersIsDirty is false when a phone number is added but does not have a (valid) number without phone_number_fks', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: []});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   let third_phone_number = store.push('phonenumber', {id: PND.idThree, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.equal(store.find('phonenumber').get('length'), 3);
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(store.find('phonenumber').get('length'), 3);
// });

// // test('addressesIsDirty is false when an address is added but does not have a (valid) address without address_fks', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: []});
// //   let first_address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   let second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: PD.idOne});
// //   let third_address = store.push('address', {id: AD.idThree, type: ATD.shippingId, model_fk: PD.idOne});
// //   assert.equal(store.find('address').get('length'), 3);
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   assert.equal(store.find('address').get('length'), 3);
// // });


// test('rollback related will iterate over each phone number and rollback that model', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, phone_number_type_fk: PNTD.mobileId, model_fk: PD.idOne});
//   store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   store.push('phone-number-type', {id: PNTD.mobileId, phonenumbers: [PND.idTwo]});
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

// // test('rollback related will iterate over each address and rollback that model', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
// //   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ATD.officeId, model_fk: PD.idOne});
// //   let second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: PD.idOne});
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   first_address.set('type', ATD.shippingId);
// //   assert.ok(person.get('addressesIsDirty'));
// //   assert.ok(first_address.get('isDirty'));
// //   person.rollback();
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   second_address.set('type', ATD.officeId);
// //   assert.ok(second_address.get('isDirty'));
// //   person.rollback();
// //   assert.ok(person.get('addressesIsNotDirty'));
// // });


// test('when new phone number is added, the person model is not dirty unless number is altered', (assert) => {
//   let phone_number_two;
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     phone_number_two = store.push('phonenumber', {id: PND.idTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number_two.set('number', '888-888-8888');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   phone_number_two.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.set('number', '999-999-9999');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// // test('when new address is added, the person model is not dirty unless address is altered', (assert) => {
// //   let address_two;
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
// //   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   assert.ok(person.get('isNotDirty'));
// //   run(function() {
// //     address_two = store.push('address', {id: AD.idTwo, type: ATD.officeId, model_fk: PD.idOne});
// //   });
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   address_two.set('address', '123 Mexico');
// //   assert.ok(person.get('isDirtyOrRelatedDirty'));
// //   address_two.rollback();
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   address.set('address', 'Big Sky Parkway');
// //   assert.ok(person.get('isDirtyOrRelatedDirty'));
// // });


// test('when new phone number is added, the person model is dirty when the type or number attrs are modified', (assert) => {
//   let phone_number_two;
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     phone_number_two = store.push('phonenumber', {id: PND.idTwo, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//     store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne, PND.idTwo]});
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

// // test('when new address is added, the person model is not dirty when the type or address attrs are modified', (assert) => {
// //   let address_two;
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
// //   let address = store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   assert.ok(person.get('addressesIsNotDirty'));
// //   assert.ok(person.get('isNotDirty'));
// //   run(function() {
// //     address_two = store.push('address', {id: AD.idTwo, type: ATD.officeId, model_fk: PD.idOne});
// //   });
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   address_two.set('type', ATD.shippingId);
// //   assert.ok(person.get('isDirtyOrRelatedDirty'));
// //   address_two.rollback();
// //   assert.equal(address_two.get('type'), ATD.officeId);
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   address.set('address', 'Big Sky Parkway');
// //   assert.ok(person.get('isDirtyOrRelatedDirty'));
// //   assert.ok(address.get('address'),'Big Sky Parkway');
// // });


// test('when new phone number is added after render, the person model is not dirty when a new phone number is appended to the array of phone numbers', (assert) => {
//   let added_phone_num;
//   person = store.push('person', {id: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let phonenumbers = person.get('phonenumbers');
//   run(function() {
//     added_phone_num = phonenumbers.push({id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// });

// // test('when new address is added after render, the person model is not dirty when new address is appended to the array of addresses', (assert) => {
// //   let added_address;
// //   person = store.push('person', {id: PD.idOne});
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   assert.ok(person.get('isNotDirty'));
// //   let addresses = person.get('addresses');
// //   run(function() {
// //     added_address = addresses.push({id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   });
// //   assert.ok(person.get('isNotDirty'));
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// // });

// test('when phone number is removed after render, the person model is dirty (two phone numbers)', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let phonenumbers = person.get('phonenumbers');
//   run(function() {
//     phonenumbers.remove(PND.idOne);
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// // test('when address is removed after render, the person model is dirty (two addresses)', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
// //   let address = store.push('address', {id: AD.idOne, address: AD.streetOne, city: AD.cityOne, state: AD.stateOne, postal_code: AD.zipOne,
// //                            type: ATD.officeId, model_fk: PD.idOne});
// //                            store.push('address', {id: AD.idTwo, address: AD.streetTwo, city: AD.cityTwo, state: AD.stateTwo, postal_code: AD.zipOne,
// //                                       type: ATD.officeId, model_fk: PD.idOne});
// //                                       assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //                                       assert.ok(person.get('isNotDirty'));
// //                                       let addresses = person.get('addresses');
// //                                       run(function() {
// //                                         addresses.remove(AD.idOne);
// //                                       });
// //                                       assert.ok(person.get('isNotDirty'));
// //                                       assert.ok(person.get('isDirtyOrRelatedDirty'));
// // });

// test('when no phone number and new phone number is added and updated, expect related isDirty to be true', (assert) => {
//   let phone_number;
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   store.push('phonenumber', {id: PND.idOne, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//   store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne]});
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   run(function() {
//     phone_number = store.push('phonenumber', {id: PND.idTwo, phone_number_type_fk: PNTD.officeId, model_fk: PD.idOne});
//     store.push('phone-number-type', {id: PNTD.officeId, phonenumbers: [PND.idOne, PND.idTwo]});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.change_phone_number_type({id: PNTD.mobileId});
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   phone_number.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   phone_number.set('number', '888-888-8888');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// // test('when no address and new address is added and updated, expect related isDirty to be true', (assert) => {
// //   let address;
// //   person = store.push('person', {id: PD.idOne});
// //   store.push('address', {id: AD.idOne, type: ATD.officeId, model_fk: PD.idOne});
// //   assert.ok(person.get('isNotDirty'));
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   run(function() {
// //     address = store.push('address', {id: AD.idTwo, type: ATD.officeId, model_fk: PD.idOne});
// //   });
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   address.set('type', ATD.shippingId);
// //   assert.ok(person.get('isDirtyOrRelatedDirty'));
// //   address.rollback();
// //   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //   address.set('address', '123 Baja');
// //   assert.ok(person.get('isDirtyOrRelatedDirty'));
// // });

// test('when phone number is removed after render, the person model is dirty', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let phone_number = store.push('phonenumber', {id: PND.idOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     store.push('phonenumber', {id: phone_number.get('id'), removed: true});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// // test('when address is removed after render, the person model is dirty', (assert) => {
// //   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
// //   let address = store.push('address', {id: AD.idOne, address: AD.streetOne, city: AD.cityOne, state: AD.stateOne, postal_code: AD.zipOne,
// //                            type: ATD.officeId, model_fk: PD.idOne});
// //                            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// //                            assert.ok(person.get('isNotDirty'));
// //                            run(function() {
// //                              store.push('address', {id: address.get('id'), removed: true});
// //                            });
// //                            assert.ok(person.get('isNotDirty'));
// //                            assert.ok(person.get('isDirtyOrRelatedDirty'));
// // });

// test('related emails are not dirty with original emailes model', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, type: ETD.personalId, model_fk: PD.idOne});
//   assert.ok(person.get('emailsIsNotDirty'));
// });

// test('related email model is dirty when email is dirty (and email is not newly added)', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.ok(email.get('isNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(email.get('isDirtyOrRelatedDirty'));
//   assert.ok(person.get('emailsIsDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('save related will iterate over each email and save that model', (assert) => {
//   person = store.push('person', {id: PD.idOne});
//   let first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.personalId, model_fk: PD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   store.push('email-type', {id: ETD.personalId, emails: [ED.idTwo]});
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

// test(' emailsIsDirty behaves correctly for emails (newly) added', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.personalId, model_fk: PD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.personalId, model_fk: PD.idOne});
//   assert.equal(person.get('emails').get('length'), 3);
//   assert.ok(person.get('emailsIsNotDirty'));
//   first_email.set('email', ED.emailOne);
//   assert.ok(person.get('emailsIsDirty'));
//   first_email.set('email', '');
//   assert.ok(person.get('emailsIsNotDirty'));
// });

// test('saveEmails will remove any email model with no (valid) value', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: PD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.workId, model_fk: PD.idOne});
//   first_email.set('type', ETD.workId);
//   second_email.set('type', ETD.workId);
//   third_email.set('type', ETD.workId);
//   first_email.set('email', ED.emailOne);
//   second_email.set('email', ED.emailTwo);
//   assert.equal(store.find('email').get('length'), 3);
//   person.saveEmails();
//   assert.equal(store.find('email').get('length'), 2);
//   assert.equal(store.find('email').objectAt(0).get('id'), ED.idOne);
//   assert.equal(store.find('email').objectAt(1).get('id'), ED.idTwo);
//   first_email.set('email', '');
//   person.saveEmails();
//   assert.equal(store.find('email').get('length'), 1);
//   assert.equal(store.find('email').objectAt(0).get('id'), ED.idTwo);
//   second_email.set('email', ' ');
//   person.saveEmails();
//   assert.equal(store.find('email').get('length'), 0);
// });

// test('emailsIsDirty is false when an email is added but does not have a (valid) email', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo, ED.idThree]});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.personalId, model_fk: PD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: PD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.workId, model_fk: PD.idOne});
//   assert.equal(store.find('email').get('length'), 3);
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.equal(store.find('email').get('length'), 3);
// });

// test('emailsDirty behaves correctly for existing emails', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.personalId, model_fk: PD.idOne});
//   assert.equal(person.get('emails').get('length'), 1);
//   assert.ok(person.get('emailsIsNotDirty'));
//   first_email.set('email', ED.emailTwo);
//   assert.ok(person.get('emailsIsDirty'));
//   first_email.set('email', '');
//   assert.ok(person.get('emailsIsDirty'));
// });

// test('emailsIsDirty is false when an email is added but does not have a (valid) email without email_fks', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: []});
//   let first_email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, type: ETD.personalId, model_fk: PD.idOne});
//   let third_email = store.push('email', {id: ED.idThree, type: ETD.personalId, model_fk: PD.idOne});
//   assert.equal(store.find('email').get('length'), 3);
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.equal(store.find('email').get('length'), 3);
// });

// test('rollback related will iterate over each email and rollback that model', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo]});
//   let first_email = store.push('email', {id: ED.idOne, email: ED.emailOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   let second_email = store.push('email', {id: ED.idTwo, email: ED.emailTwo, email_type_fk: ETD.personalId, model_fk: PD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   store.push('email-type', {id: ETD.personalId, emails: [ED.idTwo]});
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

// test('when new email is added, the person model is not dirty unless email is altered', (assert) => {
//   let email_two;
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     email_two = store.push('email', {id: ED.idTwo, type: ETD.workId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email_two.set('email', 'snewcomer@gmaail.com');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   email_two.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'aalever@yaho.com');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when new email is added, the person model is not dirty when the type or email attrs are modified', (assert) => {
//   let email_two;
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(person.get('emailsIsNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     email_two = store.push('email', {id: ED.idTwo, email_type_fk: ETD.workId, model_fk: PD.idOne});
//     store.push('email-type', {id: ETD.workId, emails: [ED.idOne, ED.idTwo]});
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

// test('when new email is added after render, the person model is not dirty when new email is appended to the array of emails', (assert) => {
//   let added_email;
//   person = store.push('person', {id: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let emails = person.get('emails');
//   run(function() {
//     added_email = emails.push({id: ED.idOne, type: ETD.workId, model_fk: PD.idOne});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
// });

// test('when email is removed after render, the person model is dirty (two emails)', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne, ED.idTwo]});
//   let email = store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.workId, model_fk: PD.idOne});
//   store.push('email', {id: ED.idTwo, email: ED.emailTwo, city: ED.cityTwo, type: ETD.workId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   let emails = person.get('emails');
//   run(function() {
//     emails.remove(ED.idOne);
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when no email and new email is added and updated, expect related isDirty to be true', (assert) => {
//   let email;
//   person = store.push('person', {id: PD.idOne});
//   store.push('email', {id: ED.idOne, email_type_fk: ETD.workId, model_fk: PD.idOne});
//   store.push('email-type', {id: ETD.workId, emails: [ED.idOne]});
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   run(function() {
//     email = store.push('email', {id: ED.idTwo, email_type_fk: ETD.workId, model_fk: PD.idOne});
//     store.push('email-type', {id: ETD.workId, emails: [ED.idOne, ED.idTwo]});
//   });
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.change_email_type({id: ETD.personalId});
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
//   email.rollback();
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   email.set('email', 'snewcomer@gmail.com');
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

// test('when email is removed after render, the person model is dirty', (assert) => {
//   person = store.push('person', {id: PD.idOne, email_fks: [ED.idOne]});
//   let email = store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.workId, model_fk: PD.idOne});
//   assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//   assert.ok(person.get('isNotDirty'));
//   run(function() {
//     store.push('email', {id: email.get('id'), removed: true});
//   });
//   assert.ok(person.get('isNotDirty'));
//   assert.ok(person.get('isDirtyOrRelatedDirty'));
// });

test('rollback role will reset the previously used role when switching from one role to another', (assert) => {
  person = store.push('person', {id: PD.idOne, role_fk: RD.idTwo});
  let guest_role = store.push('role', {id: RD.idTwo, name: RD.nameTwo, people: [PD.unusedId, PD.idOne]});
  let admin_role = store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.unusedId]});
  let another_role = store.push('role', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3', name: 'another', people: [PD.unusedId]});
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
test('locations property should return all associated locations or empty array', (assert) => {
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location = store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('name'), LD.storeName);
  run(function() {
    store.push('person-location', {id: m2m.get('id'), removed: true});
  });
  assert.equal(person.get('locations').get('length'), 0);
});

test('locations property is not dirty when no location present (undefined)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: undefined});
  person = store.push('person', {id: PD.idOne, person_locations_fks: undefined});
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty when no location present (empty array)', (assert) => {
  store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: []});
  person = store.push('person', {id: PD.idOne, person_locations_fks: []});
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('locationsIsNotDirty'));
});

test('locations property is not dirty with original location model', (assert) => {
  store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  let location = store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
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

test('locations property only returns the single matching item even when multiple locations exist', (assert) => {
  store.push('person-location', {id: PERSON_LD.idThree, person_pk: PD.unusedId, location_pk: LD.idOne});
  store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idTwo});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_locations_fks: [PERSON_LD.idOne]});
  store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idThree]});
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 1);
  assert.equal(locations.objectAt(0).get('id'), LD.idTwo);
});

test('locations property returns multiple matching items when multiple locations exist', (assert) => {
  store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idTwo});
  store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
  store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idTwo]});
  store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_locations_fks: [PERSON_LD.idOne]});
  let locations = person.get('locations');
  assert.equal(locations.get('length'), 2);
  assert.equal(locations.objectAt(0).get('id'), LD.idOne);
  assert.equal(locations.objectAt(1).get('id'), LD.idTwo);
});

test('locations property will update when the m2m array suddenly has the person pk (starting w/ empty array)', (assert) => {
  person = store.push('person', {id: PD.idOne, person_locations_fks: []});
  let location = {id: LD.idOne, person_locations_fks: []};
  store.push('location', {id: LD.idTwo, person_locations_fks: []});
  assert.equal(person.get('locations').get('length'), 0);
  person.add_location(location);
  assert.equal(person.get('locations').get('length'), 1);
  assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
});

test('locations property will update when the m2m array suddenly has the person pk', (assert) => {
  store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location_two = {id: LD.idTwo, person_locations_fks: []};
  assert.equal(person.get('locations').get('length'), 1);
  person.add_location(location_two);
  assert.equal(person.get('locations').get('length'), 2);
  assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
  assert.equal(person.get('locations').objectAt(1).get('id'), LD.idTwo);
});

test('locations property will update when the m2m array suddenly removes the person', (assert) => {
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  assert.equal(person.get('locations').get('length'), 1);
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 0);
});

//TODO: do no want to dirty person model when location name is changed
test('when location is changed dirty tracking works as expected', (assert) => {
  store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
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

test('when location is suddently assigned it shows as a dirty relationship (starting undefined)', (assert) => {
  let location = {id: LD.idOne, name: LD.storeName, person_locations_fks: undefined};
  person = store.push('person', {id: PD.idOne, person_locations_fks: undefined});
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

test('when location is suddenly assigned it shows as a dirty relationship (starting with an empty array)', (assert) => {
  let location = {id: LD.idOne, name: LD.storeName, person_locations_fks: []};
  person = store.push('person', {id: PD.idOne, person_locations_fks: []});
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

test('when location is suddently assigned it shows as a dirty relationship (starting with legit value)', (assert) => {
  store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
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

test('when location is suddently removed it shows as a dirty relationship', (assert) => {
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 0);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when location is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location_two = store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
  assert.equal(person.get('locations').get('length'), 2);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 1);
  assert.ok(person.get('isNotDirty'));
  assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('rollback location will reset the previously used locations when switching from valid locations to nothing', (assert) => {
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  let m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location_two = store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
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

test('rollback location will reset the previous locations when switching from one location to another and saving in between each step', (assert) => {
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  let m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location_two = store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
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

test('location_ids computed returns a flat list of ids for each location', (assert) => {
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  let m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
  let person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne, PERSON_LD.idTwo]});
  let location = store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location_two = store.push('location', {id: LD.idTwo, person_locations_fks: [PERSON_LD.idTwo]});
  let location_three = store.push('location', {id: LD.unusedId, person_locations_fks: [PERSON_LD.idThree]});
  let location_four = store.push('location', {id: LD.anotherId, person_locations_fks: [PERSON_LD.idFour]});
  assert.equal(person.get('locations').get('length'), 2);
  assert.deepEqual(person.get('locations_ids'), [LD.idOne, LD.idTwo]);
  person.remove_location(LD.idOne);
  assert.equal(person.get('locations').get('length'), 1);
  assert.deepEqual(person.get('locations_ids'), [LD.idTwo]);
});
/*END PERSON LOCATION M2M*/

// test('cleanup phone numbers works as expected on removal and save', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   let phone_numbers = store.find('phone-number');
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   run(function() {
//     store.push('phonenumber', {id: second_phone_number.get('id'), removed: true});
//   });
//   assert.ok(person.get('phonenumbersIsDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 2);
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
//   person.cleanupPhoneNumberFKs();
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne]);
// });

// test('cleanup phone numbers works as expected on add and save', (assert) => {
//   let second_phone_number;
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 1);
//   run(function() {
//     second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   });
//   second_phone_number.set('number', PND.numberTwo);
//   assert.ok(person.get('phonenumbersIsDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 2);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 2);
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne]);
//   person.cleanupPhoneNumberFKs();
//   assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
// });

// test('cleanup phone numbers works as expected on removal and rollback', (assert) => {
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne, PND.idTwo]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   let second_phone_number = store.push('phonenumber', {id: PND.idTwo, number: PND.numberTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   run(function() {
//     store.push('phonenumber', {id: second_phone_number.get('id'), removed: true});
//   });
//   assert.ok(person.get('phonenumbersIsDirty'));
//   person.rollbackPhoneNumbers();
//   assert.deepEqual(person.get('removed'), undefined);
// });

// test('cleanup phone numbers works as expected on add and rollback', (assert) => {
//   let second_phone_number;
//   person = store.push('person', {id: PD.idOne, phone_number_fks: [PND.idOne]});
//   let first_phone_number = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, type: PNTD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('phonenumbersIsNotDirty'));
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 1);
//   run(function() {
//     second_phone_number = store.push('phonenumber', {id: PND.idTwo, type: PNTD.mobileId, model_fk: PD.idOne});
//   });
//   assert.ok(second_phone_number.get('invalid_number'));
//   assert.equal(person.get('phonenumbers').get('length'), 2);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 2);
//   person.rollbackPhoneNumbers();
//   assert.equal(person.get('phonenumbers').get('length'), 1);
//   // assert.equal(person.get('phone_numbers_all').get('length'), 1);
// });

// test('cleanup addresses works as expected on removal and save', (assert) => {
//   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: PD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   run(function() {
//     store.push('address', {id: second_address.get('id'), removed: true});
//   });
//   assert.ok(person.get('addressesIsDirty'));
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 2);
//   assert.deepEqual(person.get('address_fks'), [AD.idOne, AD.idTwo]);
//   person.cleanupAddressFKs();
//   assert.deepEqual(person.get('address_fks'), [AD.idOne]);
// });

// test('cleanup addresses works as expected on add and save', (assert) => {
//   let second_address;
//   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne, type: ATD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 1);
//   run(function() {
//     second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   });
//   second_address.set('address', AD.streetTwo);
//   assert.ok(person.get('addressesIsDirty'));
//   assert.equal(person.get('addresses').get('length'), 2);
//   assert.equal(person.get('addresses_all').get('length'), 2);
//   assert.deepEqual(person.get('address_fks'), [AD.idOne]);
//   person.cleanupAddressFKs();
//   assert.deepEqual(person.get('address_fks'), [AD.idOne, AD.idTwo]);
// });

// test('cleanup addresses works as expected on removal and rollback', (assert) => {
//   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne, AD.idTwo]});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: PD.idOne});
//   let second_address = store.push('address', {id: AD.idTwo, address: AD.streetTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   run(function() {
//     store.push('address', {id: second_address.get('id'), removed: true});
//   });
//   assert.ok(person.get('addressesIsDirty'));
//   person.rollbackAddresses();
//   assert.deepEqual(person.get('removed'), undefined);
// });

// test('cleanup addresses works as expected on add and rollback', (assert) => {
//   let second_address;
//   person = store.push('person', {id: PD.idOne, address_fks: [AD.idOne]});
//   let first_address = store.push('address', {id: AD.idOne, address: AD.streetOne,  type: ATD.officeId, model_fk: PD.idOne});
//   assert.ok(person.get('addressesIsNotDirty'));
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 1);
//   run(function() {
//     second_address = store.push('address', {id: AD.idTwo, type: ATD.shippingId, model_fk: PD.idOne});
//   });
//   assert.ok(second_address.get('invalid_address'));
//   assert.equal(person.get('addresses').get('length'), 2);
//   assert.equal(person.get('addresses_all').get('length'), 2);
//   person.rollbackAddresses();
//   assert.equal(person.get('addresses').get('length'), 1);
//   assert.equal(person.get('addresses_all').get('length'), 1);
// });

test('person-location join models are correctly filtered on for the current User when calling change_role and updating a Users Locations', (assert) => {
  store.push('location-level', {id: LLD.idOne, roles: [RD.idOne, RD.idTwo], locations: [LD.idOne]});
  store.push('location-level', {id: LLD.idTwo, roles: [RD.idOne, RD.idTwo], locations: []});
  let old_role = store.push('role', {id: RD.idOne, people: [PD.idOne], location_level_fk: LLD.idTwo});
  let new_role = store.push('role', {id: RD.idTwo, people: [], location_level_fk: LLD.idOne});
  let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
  let m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.unusedId, location_pk: LD.idOne});
  person = store.push('person', {id: PD.idOne, person_locations_fks: [PERSON_LD.idOne]});
  let location = store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne], location_level_fk: LLD.idOne});
  assert.equal(person.get('locations').get('length'), 1);
  person.change_role(new_role);
  assert.equal(person.get('locations').get('length'), 1);
  assert.equal(person.get('locationsIsDirty'), false);
});
