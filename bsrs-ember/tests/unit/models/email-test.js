import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';

var store, email;

moduleFor('model:email', 'Unit | Model | email', {
  needs: ['validator:format'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:email', 'model:email-type']);
    run(() => {
      email = store.push('email', {id: ED.idOne});
    });
  }
});

test('dirty test | email', assert => {
  assert.equal(email.get('isDirty'), false);
  email.set('email', 'wat');
  assert.equal(email.get('isDirty'), true);
  email.set('email', '');
  assert.equal(email.get('isDirty'), false);
});

// Address - EmailType: Start

test('email-type - get via related attr', assert => {
  run(() => {
    email = store.push('email', {id: ED.idOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
  });
  assert.equal(email.get('email_type').get('id'), ETD.idOne);
});

test('email.change_email_type', assert => {
  run(() => {
    email = store.push('email', {id: ED.idOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
  });
  assert.equal(email.get('email_type').get('id'), ETD.idOne);
  assert.ok(email.get('isNotDirtyOrRelatedNotDirty'));
  email.change_email_type({id: ETD.idTwo});
  assert.equal(email.get('email_type').get('id'), ETD.idTwo);
  assert.ok(email.get('isDirtyOrRelatedDirty'));
});

test('email_type - isDirty and related dirty tests', assert => {
  run(() => {
    email = store.push('email', {id: ED.idOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
  });
  assert.equal(email.get('email_type').get('id'), ETD.idOne);
  assert.ok(email.get('isNotDirty'));
  assert.ok(email.get('emailTypeIsNotDirty'));
  assert.ok(email.get('isNotDirtyOrRelatedNotDirty'));
  // change
  email.change_email_type({id: ETD.idTwo});
  assert.ok(email.get('isNotDirty'));
  assert.ok(email.get('emailTypeIsDirty'));
  assert.ok(email.get('isDirtyOrRelatedDirty'));
});

test('email_type - saveRelated', assert => {
  run(() => {
    email = store.push('email', {id: ED.idOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
  });
  assert.equal(email.get('email_type').get('id'), ETD.idOne);
  assert.ok(email.get('isNotDirtyOrRelatedNotDirty'));
  email.change_email_type({id: ETD.idTwo});
  assert.equal(email.get('email_type').get('id'), ETD.idTwo);
  assert.ok(email.get('isDirtyOrRelatedDirty'));
  email.saveRelated();
  assert.ok(email.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(email.get('email_type').get('id'), ETD.idTwo);
});

test('email_type - rollback', assert => {
  run(() => {
    email = store.push('email', {id: ED.idOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
  });
  assert.equal(email.get('email_type').get('id'), ETD.idOne);
  assert.ok(email.get('isNotDirtyOrRelatedNotDirty'));
  email.change_email_type({id: ETD.idTwo});
  assert.equal(email.get('email_type').get('id'), ETD.idTwo);
  assert.ok(email.get('isDirtyOrRelatedDirty'));
  email.rollback();
  assert.ok(email.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(email.get('email_type').get('id'), ETD.idOne);
});

// Address - EmailType: End

test('validation - email', assert => {
  run(() => {
    email = store.push('email', {id: ED.idOne});
  });

  let validAddresses = [
    'email@domain.com',
    'firstname.lastname@domain.com',
    'email@subdomain.domain.com',
    'firstname+lastname@domain.com',
    '1234567890@domain.com',
    'email@domain-one.com',
    '_______@domain.com',
    'email@domain.name',
    'email@domain.co.jp',
    'firstname-lastname@domain.com',
    'EMAIL@DOMAIN.COM'
  ];
  let invalidAddresses = [
    'plainaddress',
    '#@%^%#$@#$@#.com',
    '@domain.com',
    'Joe Smith <email@domain.com>',
    'email.domain.com',
    'email@domain@domain.com',
    '.email@domain.com',
    'email.@domain.com',
    'email..email@domain.com',
    'あいうえお@domain.com',
    'email@domain.com (Joe Smith)',
    'email@domain',
    'email@domain.',
    'email@domain.-',
    'email@domain-',
    'email@domain-.',
    'email@domain.com.',
    'email@domain.com.-',
    'email@domain.com-',
    'email@domain.com-.',
    'email@-domain.com',
    'email@domain..com',
    // our invalid email
    'email@d.c'
  ];

  validAddresses.forEach((e) => {
    email.set('email', e);
    assert.ok(email.get('validations.attrs.email.isValid'), `validation of ${e} must succeed`);
  });
  invalidAddresses.forEach((e) => {
    email.set('email', e);
    assert.notOk(email.get('validations.attrs.email.isValid'), `validation of ${e} must fail`);
  });

});
