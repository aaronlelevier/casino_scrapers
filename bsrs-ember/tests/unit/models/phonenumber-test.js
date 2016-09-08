import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/phone-number';
import PTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import PhoneNumber from 'bsrs-ember/models/phonenumber';

let store, phonenumber, type;

moduleFor('model:phonenumber', 'Unit | Model | phonenumber', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:phonenumber', 'model:phone-number-type']);
    run(() => {
      phonenumber = store.push('phonenumber', {id: PD.idOne});
    });
  }
});

test('dirty test | phonenumber', assert => {
  assert.equal(phonenumber.get('isDirty'), false);
  phonenumber.set('number', 'wat');
  assert.equal(phonenumber.get('isDirty'), true);
  phonenumber.set('number', '');
  assert.equal(phonenumber.get('isDirty'), false);
});

// // Address - PhoneNumberType: Start

test('phonenumber-type - get via related attr', assert => {
  run(() => {
    phonenumber = store.push('phonenumber', {id: PD.idOne, phone_number_type_fk: PTD.idOne});
    store.push('phone-number-type', {id: PTD.idOne, phonenumbers: [PD.idOne]});
  });
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idOne);
});

test('type - isDirty and related dirty tests', assert => {
  run(() => {
    phonenumber = store.push('phonenumber', {id: PD.idOne, phone_number_type_fk: PTD.idOne});
    type = store.push('phone-number-type', {id: PTD.idOne, phonenumbers: [PD.idOne]});
  });
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idOne);
  assert.ok(phonenumber.get('isNotDirty'));
  assert.ok(phonenumber.get('phoneNumber_typeIsNotDirty'));
  assert.ok(phonenumber.get('isNotDirtyOrRelatedNotDirty'));
  phonenumber.change_phone_number_type({id: PTD.idTwo});
  assert.ok(phonenumber.get('isNotDirty'));
  assert.ok(phonenumber.get('phoneNumber_typeIsNotDirty'));
  assert.ok(phonenumber.get('isDirtyOrRelatedDirty'));
});

test('type - saveRelated', assert => {
  run(() => {
    phonenumber = store.push('phonenumber', {id: PD.idOne, phone_number_type_fk: PTD.idOne});
    type = store.push('phone-number-type', {id: PTD.idOne, phonenumbers: [PD.idOne]});
  });
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idOne);
  assert.ok(phonenumber.get('isNotDirtyOrRelatedNotDirty'));
  phonenumber.change_phone_number_type({id: PTD.idTwo});
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idTwo);
  assert.ok(phonenumber.get('isDirtyOrRelatedDirty'));
  phonenumber.saveRelated();
  assert.ok(phonenumber.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idTwo);
});

test('type - rollback', assert => {
  run(() => {
    phonenumber = store.push('phonenumber', {id: PD.idOne, phone_number_type_fk: PTD.idOne});
    type = store.push('phone-number-type', {id: PTD.idOne, phonenumbers: [PD.idOne]});
  });
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idOne);
  assert.ok(phonenumber.get('isNotDirtyOrRelatedNotDirty'));
  phonenumber.change_phone_number_type({id: PTD.idTwo});
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idTwo);
  assert.ok(phonenumber.get('isDirtyOrRelatedDirty'));
  phonenumber.rollback();
  assert.ok(phonenumber.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(phonenumber.get('phone_number_type').get('id'), PTD.idOne);
});

// // Address - PhoneNumberType: End