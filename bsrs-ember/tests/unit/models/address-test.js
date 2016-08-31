import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/address';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import CD from 'bsrs-ember/vendor/defaults/country';
import SD from 'bsrs-ember/vendor/defaults/country';

var store, address, country, state, address_type;

moduleFor('model:address', 'Unit | Model | address', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:address', 'model:address-type', 'model:country', 'model:state']);
    run(() => {
      address = store.push('address', {id: AD.idOne});
    });
  }
});

test('dirty test | address', assert => {
  assert.equal(address.get('isDirty'), false);
  address.set('address', 'wat');
  assert.equal(address.get('isDirty'), true);
  address.set('address', '');
  assert.equal(address.get('isDirty'), false);
});

test('dirty test | city', assert => {
  assert.equal(address.get('isDirty'), false);
  address.set('city', 'wat');
  assert.equal(address.get('isDirty'), true);
  address.set('city', '');
  assert.equal(address.get('isDirty'), false);
});

test('dirty test | postal_code', assert => {
  assert.equal(address.get('isDirty'), false);
  address.set('postal_code', 'wat');
  assert.equal(address.get('isDirty'), true);
  address.set('postal_code', '');
  assert.equal(address.get('isDirty'), false);
});

// Address - Country: Start

test('country - get via related attr', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, country_fk: CD.idOne});
    store.push('country', {id: CD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('country').get('id'), CD.idOne);
});

test('address.change_country', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, country_fk: CD.idOne});
    country = store.push('country', {id: CD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('country').get('id'), CD.idOne);
  address.change_country({id: CD.idTwo});
  assert.equal(address.get('country').get('id'), CD.idTwo);
});

test('country - isDirty and related dirty tests', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, country_fk: CD.idOne});
    country = store.push('country', {id: CD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('country').get('id'), CD.idOne);
  assert.ok(address.get('isNotDirty'));
  assert.ok(address.get('countryIsNotDirty'));
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  // change
  address.change_country({id: CD.idTwo});
  assert.ok(address.get('isNotDirty'));
  assert.ok(address.get('countryIsDirty'));
  assert.ok(address.get('isDirtyOrRelatedDirty'));
});

test('country - saveRelated', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, country_fk: CD.idOne});
    country = store.push('country', {id: CD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('country').get('id'), CD.idOne);
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  address.change_country({id: CD.idTwo});
  assert.equal(address.get('country').get('id'), CD.idTwo);
  assert.ok(address.get('isDirtyOrRelatedDirty'));
  address.saveRelated();
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(address.get('country').get('id'), CD.idTwo);
});

test('country - rollback', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, country_fk: CD.idOne});
    country = store.push('country', {id: CD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('country').get('id'), CD.idOne);
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  address.change_country({id: CD.idTwo});
  assert.equal(address.get('country').get('id'), CD.idTwo);
  assert.ok(address.get('isDirtyOrRelatedDirty'));
  address.rollback();
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(address.get('country').get('id'), CD.idOne);
});

// Address - Country: End

// Address - State: Start

test('state - get via related attr', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, state_fk: SD.idOne});
    store.push('state', {id: SD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('state').get('id'), SD.idOne);
});

test('address.change_state', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, state_fk: SD.idOne});
    state = store.push('state', {id: SD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('state').get('id'), SD.idOne);
  address.change_state({id: SD.idTwo});
  assert.equal(address.get('state').get('id'), SD.idTwo);
});

test('state - isDirty and related dirty tests', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, state_fk: SD.idOne});
    state = store.push('state', {id: SD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('state').get('id'), SD.idOne);
  assert.ok(address.get('isNotDirty'));
  assert.ok(address.get('stateIsNotDirty'));
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  // change
  address.change_state({id: SD.idTwo});
  assert.ok(address.get('isNotDirty'));
  assert.ok(address.get('stateIsDirty'));
  assert.ok(address.get('isDirtyOrRelatedDirty'));
});

test('state - saveRelated', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, state_fk: SD.idOne});
    state = store.push('state', {id: SD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('state').get('id'), SD.idOne);
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  address.change_state({id: SD.idTwo});
  assert.equal(address.get('state').get('id'), SD.idTwo);
  assert.ok(address.get('isDirtyOrRelatedDirty'));
  address.saveRelated();
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(address.get('state').get('id'), SD.idTwo);
});

test('state - rollback', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, state_fk: SD.idOne});
    state = store.push('state', {id: SD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('state').get('id'), SD.idOne);
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  address.change_state({id: SD.idTwo});
  assert.equal(address.get('state').get('id'), SD.idTwo);
  assert.ok(address.get('isDirtyOrRelatedDirty'));
  address.rollback();
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(address.get('state').get('id'), SD.idOne);
});

// Address - State: End

// Address - AddressType: Start

test('address-type - get via related attr', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, address_type_fk: ATD.idOne});
    store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('address_type').get('id'), ATD.idOne);
});

test('address.change_address_type', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, address_type_fk: ATD.idOne});
    address_type = store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('address_type').get('id'), ATD.idOne);
  address.change_address_type({id: ATD.idTwo});
  assert.equal(address.get('address_type').get('id'), ATD.idTwo);
});

test('address_type - isDirty and related dirty tests', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, address_type_fk: ATD.idOne});
    address_type = store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('address_type').get('id'), ATD.idOne);
  assert.ok(address.get('isNotDirty'));
  assert.ok(address.get('addressTypeIsNotDirty'));
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  // change
  address.change_address_type({id: ATD.idTwo});
  assert.ok(address.get('isNotDirty'));
  assert.ok(address.get('addressTypeIsDirty'));
  assert.ok(address.get('isDirtyOrRelatedDirty'));
});

test('address_type - saveRelated', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, address_type_fk: ATD.idOne});
    address_type = store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('address_type').get('id'), ATD.idOne);
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  address.change_address_type({id: ATD.idTwo});
  assert.equal(address.get('address_type').get('id'), ATD.idTwo);
  assert.ok(address.get('isDirtyOrRelatedDirty'));
  address.saveRelated();
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(address.get('address_type').get('id'), ATD.idTwo);
});

test('address_type - rollback', assert => {
  run(() => {
    address = store.push('address', {id: AD.idOne, address_type_fk: ATD.idOne});
    address_type = store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
  });
  assert.equal(address.get('address_type').get('id'), ATD.idOne);
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  address.change_address_type({id: ATD.idTwo});
  assert.equal(address.get('address_type').get('id'), ATD.idTwo);
  assert.ok(address.get('isDirtyOrRelatedDirty'));
  address.rollback();
  assert.ok(address.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(address.get('address_type').get('id'), ATD.idOne);
});

// Address - AddressType: End

test('serialize', assert => {
  run(() => {
    address = store.push('address', {
      id: AD.idOne,
      type: AD.typeOne,
      address: AD.streetOne,
      city: AD.cityOne,
      postal_code: AD.zipOne,
      country_fk: CD.idOne,
      state_fk: SD.idOne,
      address_type_fk: ATD.idOne
    });
    country = store.push('country', {
      id: CD.idOne,
      addresses: [AD.idOne]
    });
    state = store.push('state', {
      id: SD.idOne,
      addresses: [AD.idOne]
    });
    address_type = store.push('address-type', {
      id: ATD.idOne,
      addresses: [AD.idOne]
    });
  });
  let data = address.serialize();
  assert.equal(data.id, address.get('id'));
  assert.equal(data.type, address.get('address_type.id'));
  assert.equal(data.address, address.get('address'));
  assert.equal(data.city, address.get('city'));
  assert.equal(data.state, address.get('state').get('id'));
  assert.equal(data.postal_code, address.get('postal_code'));
  assert.equal(data.country, address.get('country').get('id'));
});