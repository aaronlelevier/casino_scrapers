import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import LPND from 'bsrs-ember/vendor/defaults/location-join-phonenumber';
import LD from 'bsrs-ember/vendor/defaults/location';

var store, default_type, phone_number_types, phonenumbers;

moduleForComponent('input-multi-phone', 'integration: input-multi-phone test', {
  integration: true,
  setup() {
    // translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:location', 'model:phonenumber', 'model:location-join-phonenumber', 'model:phone-number-type']);
    const location = store.push('location', { id: LD.idOne, location_phonenumbers_fks: [LPND.idOne] });
    store.push('location-join-phonenumber', {id: LPND.idOne, phonenumber_pk: PND.idOne, location_pk: LD.idOne});
    store.push('phonenumber', {id: PND.idOne, street: PND.numberOne, phone_number_type_fk: PTD.idOne});
    store.push('phone-number-type', {id: PTD.idOne, phonenumbers: [PND.idOne]});
    phonenumbers = store.find('phonenumber');
    default_type = store.push('phone-number-type', {id: PTD.officeId, name: PTD.officeName});
    // other ph type
    store.push('phone-number-type', {id: PTD.mobileId, name: PTD.mobileName});
    phone_number_types = store.find('phone-number-type');
    this.set('model', location);
    this.set('phonenumbers', phonenumbers);
    this.set('phone_number_types', phone_number_types);
    this.set('default_type', default_type);
    this.render(hbs `{{input-multi-phone numbers=phonenumbers model=model types=phone_number_types default_type=default_type}}`);
    // var service = this.container.lookup('service:i18n');
    // var json = translations.generate('en');
    // loadTranslations(service, json);
  }
});

test('renders a single button', function(assert) {
  this.render(hbs `{{input-multi-phone}}`);
  var $component = this.$('.t-input-multi-phone');
  assert.equal($component.find('.t-add-phone-number-btn').length, 1);
});

test('click add btn will append blank entry to list of entries and binds value to model', function(assert) {
  var $component = this.$('.t-input-multi-phone');
  var $first_btn = $component.find('.t-add-phone-number-btn');
  assert.equal(phonenumbers.get('length'), 1);
  assert.equal(phonenumbers.objectAt(0).get('phone_number_type_fk'), PTD.idOne);
  assert.equal(phonenumbers.objectAt(0).get('phone_number_type').get('id'), PTD.idOne);
  $first_btn.trigger('click').trigger('change');
  assert.equal(phonenumbers.objectAt(1).get('phone_number_type_fk'), PTD.officeId);
  assert.equal(phonenumbers.objectAt(1).get('phone_number_type').get('id'), PTD.officeId);
  assert.equal(phonenumbers.objectAt(1).get('number'), undefined);
  this.$('.t-phonenumber-number1').val(PND.numberOne).trigger('change');
  assert.equal(phonenumbers.objectAt(1).get('number'), PND.numberOne);
  // leaving out other fields b/c possiblity using GOOGLE API for this stuff
});

test('once added a button for phonenumber type appears with a button to delete it', function(assert) {
  let $component = this.$('.t-input-multi-phone');
  let $first_btn = $component.find('.t-add-phone-number-btn');
  let $del = $component.find('.t-del-phone-number-btn');
  let $select = $component.find('.t-phone-number-type-select');
  assert.equal($del.length, 1);
  assert.equal($select.length, 1);
  $first_btn.trigger('click').trigger('change');
  $del = $component.find('.t-del-phone-number-btn');
  $select = $component.find('.t-phone-number-type-select');
  assert.equal($del.length, 2);
  assert.equal($select.length, 2);
  // hmmmm
  // const $last_del_btn = $component.find('.t-del-phone-number-btn:eq(1)');
  // $last_del_btn.trigger('click').trigger('change');
  // $del = $component.find('.t-del-phone-number-btn');
  // $select = $component.find('.t-phone-number-type-select');
  // assert.equal($del.length, 1);
  // assert.equal($select.length, 1);
});
