import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import InputMultiAddressComponent from 'bsrs-ember/components/input-multi-address/component';
import AddressType from 'bsrs-ember/models/address-type';
import ADDRESS_TYPE_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

var store, eventbus, person, run = Ember.run;

module('unit: input-multi-address component test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:address', 'service:eventbus']);
    eventbus = this.container.lookup('service:eventbus');
  }
});

test('valid computed should ignore models with an empty or undefined address attr (starting with no bound models)', (assert) => {
  let address;
  person = store.push('person', {id: PEOPLE_DEFAULTS.id});
  let address_types = [AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.officeId, name: ADDRESS_TYPE_DEFAULTS.officeName }), AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.shippingId, name: ADDRESS_TYPE_DEFAULTS.shippingName })];
  let model = store.find('address', {person_fk: PEOPLE_DEFAULTS.id});
  let subject = InputMultiAddressComponent.create({model: model, eventbus: eventbus});
  assert.equal(subject.get('valid'), true);
  run(() => {
    address = model.push({id: 'def456', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address.set('address', '1');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address.set('address', '123 Sky Park Ct. #45');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address.set('address', 'Sky Park ~');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address.set('address', '');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address.set('address', ' ');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
});

test('valid computed should ignore models with an empty or undefined zip code attr (starting with no bound models)', (assert) => {
  let address;
  person = store.push('person', {id: PEOPLE_DEFAULTS.id});
  let address_types = [AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.officeId, name: ADDRESS_TYPE_DEFAULTS.officeName }), AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.shippingId, name: ADDRESS_TYPE_DEFAULTS.shippingName })];
  let model = store.find('address', {person_fk: PEOPLE_DEFAULTS.id});
  let subject = InputMultiAddressComponent.create({model: model, eventbus: eventbus});
  assert.equal(subject.get('valid'), true);
  run(() => {
    address = model.push({id: 'def456', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address.set('postal_code', '1');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address.set('postal_code', '42324');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address.set('postal_code', '');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address.set('address', ' ');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address.set('address', '1234?0');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address.set('address', '1234-0');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
});

test('valid computed should ignore models with an empty or undefined address attr (when the middle model is modified)', (assert) => {
  let address_two;
  person = store.push('person', {id: PEOPLE_DEFAULTS.id});
  let address_types = [AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.officeId, name: ADDRESS_TYPE_DEFAULTS.officeName }), AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.shippingId, name: ADDRESS_TYPE_DEFAULTS.shippingName })];
  let model = store.find('address', {person_fk: PEOPLE_DEFAULTS.id});
  let subject = InputMultiAddressComponent.create({model: model, eventbus: eventbus});
  assert.equal(subject.get('valid'), true);
  run(() => {
    let address_one = model.push({id: 'def455', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    address_two = model.push({id: 'def456', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    let address_three = model.push({id: 'def457', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_two.set('address', '1');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address_two.set('address', '123 Sky Park Ct. #45');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_two.set('address', 'Sky Park ~');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address_two.set('address', '');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_two.set('postal_code', '');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_two.set('postal_code', '55566');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_two.set('postal_code', '5.5566');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address_two.set('postal_code', '');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_two.set('address', ' ');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
});

test('valid computed should ignore models with an empty or undefined address attr (when the middle model is blank)', (assert) => {
  let address_one;
  let address_two;
  let address_three;
  person = store.push('person', {id: PEOPLE_DEFAULTS.id});
  let address_types = [AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.officeId, name: ADDRESS_TYPE_DEFAULTS.officeName }), AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.shippingId, name: ADDRESS_TYPE_DEFAULTS.shippingName })];
  let model = store.find('address', {person_fk: PEOPLE_DEFAULTS.id});
  let subject = InputMultiAddressComponent.create({model: model, eventbus: eventbus});
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_one = model.push({id: 'def455', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    address_two = model.push({id: 'def456', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
    address_three = model.push({id: 'def457', type: ADDRESS_TYPE_DEFAULTS.officeId, person_fk: PEOPLE_DEFAULTS.id});
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_one.set('address', '1');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address_one.set('address', '123 Sky Park Ct. #45');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_one.set('address', 'Sky Park ~');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address_one.set('address', '');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_one.set('address', ' ');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_one.set('postal_code', '34255');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
  run(() => {
    address_one.set('postal_code', '.34255');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), false);
  run(() => {
    address_one.set('postal_code', ' ');
    subject.notifyPropertyChange('valid');
  });
  assert.equal(subject.get('valid'), true);
});
