import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import LED from 'bsrs-ember/vendor/defaults/location-join-email';
import LD from 'bsrs-ember/vendor/defaults/location';
import EDTYPEREPO from 'bsrs-ember/repositories/email-type';

var store, emails;

moduleForComponent('input-multi-email', 'integration: input-multi-email test', {
  integration: true,
  setup() {
    // translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:location', 'model:email', 'model:location-join-email', 'model:email-type']);
    const location = store.push('location', { id: LD.idOne, location_emails_fks: [LED.idOne] });
    store.push('location-join-email', {id: LED.idOne, email_pk: ED.idOne, location_pk: LD.idOne});
    store.push('email', {id: ED.idOne, street: ED.emailOne, email_type_fk: ETD.idOne});
    store.push('email-type', {id: ETD.idOne, emails: [ED.idOne]});
    emails = store.find('email');
    store.push('email-type', {id: ETD.workId, name: ETD.workEmail});
    store.push('email-type', {id: ETD.personalId, name: ETD.personalEmail});
    this.set('model', location);
    this.set('emails', emails);
    this.email_type_repo = EDTYPEREPO.create({simpleStore: store});
    this.simpleStore = store;
    this.render(hbs `{{input-multi-email emails=emails model=model email_type_repo=email_type_repo simpleStore=simpleStore}}`);
    // var service = this.container.lookup('service:i18n');
    // var json = translations.generate('en');
    // loadTranslations(service, json);
  }
});

test('renders a single button', function(assert) {
  this.render(hbs `{{input-multi-email}}`);
  var $component = this.$('.t-input-multi-email');
  assert.equal($component.find('.t-add-email-btn').length, 1);
});

test('click add btn will append blank entry to list of entries and binds value to model', function(assert) {
  var $component = this.$('.t-input-multi-email');
  var $first_btn = $component.find('.t-add-email-btn');
  assert.equal(emails.get('length'), 1);
  assert.equal(emails.objectAt(0).get('email_type_fk'), ETD.idOne);
  assert.equal(emails.objectAt(0).get('email_type').get('id'), ETD.idOne);
  $first_btn.trigger('click').trigger('change');
  assert.equal(emails.objectAt(1).get('email_type_fk'), ETD.workId);
  assert.equal(emails.objectAt(1).get('email_type').get('id'), ETD.workId);
  assert.equal(emails.objectAt(1).get('email'), undefined);
  this.$('.t-email-email1').val(ED.emailOne).trigger('change');
  assert.equal(emails.objectAt(1).get('email'), ED.emailOne);
});

test('once added a button for email type appears with a button to delete it', function(assert) {
  let $component = this.$('.t-input-multi-email');
  let $first_btn = $component.find('.t-add-email-btn');
  let $del = $component.find('.t-del-email-btn');
  let $select = $component.find('.t-email-type-select');
  assert.equal($del.length, 1);
  assert.equal($select.length, 1);
  $first_btn.trigger('click').trigger('change');
  $del = $component.find('.t-del-email-btn');
  $select = $component.find('.t-email-type-select');
  assert.equal($del.length, 2);
  assert.equal($select.length, 2);
  // const $last_del_btn = $component.find('.t-del-email-btn:eq(1)');
  // $last_del_btn.trigger('click').trigger('change');
  // $del = $component.find('.t-del-email-btn');
  // $select = $component.find('.t-email-type-select');
  // assert.equal($del.length, 1);
  // assert.equal($select.length, 1);
});
