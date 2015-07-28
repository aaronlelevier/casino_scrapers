import Ember from 'ember';
import {test, module} from 'qunit';
import CurrencyDefaults from 'bsrs-ember/vendor/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PHONE_NUMBER_FIXTURES from 'bsrs-ember/vendor/phone_number_fixtures';
import PHONE_NUMBER_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';

var container, registry, store;

module('unit: person test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:person', 'model:currency', 'model:phonenumber','service:currency']);
        store.push('currency', CurrencyDefaults);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('related phone numbers are not dirty when no phone numbers present', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.unusedId});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related phone numbers are not dirty with original phone number model', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
});

test('person is dirty or related is dirty when model has been updated', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, username: PEOPLE_DEFAULTS.username});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.set('username', 'abc');
    assert.ok(person.get('isDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.set('username', PEOPLE_DEFAULTS.username);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeType);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(!person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeType);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});

test('save related will iterate over each phone number and save that model', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.savePhoneNumbers();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeType);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.savePhoneNumbers();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('rollback related will iterate over each phone number and rollback that model', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var first_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    var second_phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    first_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.rollbackPhoneNumbers();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    second_phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.officeType);
    assert.ok(person.get('phoneNumbersIsDirty'));
    person.rollbackPhoneNumbers();
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('when new phone number is added, the person model is not dirty unless number is altered', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var phone_number_two = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number_two.set('number', '888-888-8888');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number_two.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '999-999-9999');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when new phone number is added, the person model is not dirty unless type is altered', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    var phone_number_two = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number_two.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number_two.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});

test('when no phone number and new phone number is added and updated, expect isDirty or Related to be true', (assert) => {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    var phone_number = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idTwo, type: PHONE_NUMBER_TYPES_DEFAULTS.officeType, person_id: PEOPLE_DEFAULTS.id});
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number.rollback();
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('number', '888-888-8888');
    assert.ok(person.get('isDirtyOrRelatedDirty'));
});
