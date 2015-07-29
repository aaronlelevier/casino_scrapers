import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';
import PhoneNumberDefaults from 'bsrs-ember/vendor/defaults/phone-number';
import PhoneNumberTypeDefaults from 'bsrs-ember/vendor/defaults/phone-number-type';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store;

moduleForComponent('input-multi-phone', 'integration: input-multi-phone test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:phonenumber']);
        translation.initialize(this);
    }
});

// test('renders a single button with a class of t-add-btn', function(assert){
//   this.render(hbs`{{input-multi model=things}}`);
//   var $component = this.$('.t-input-multi');
//   assert.equal($component.find('.t-add-btn').length, 1);
// });

test('defaults to use phone number model with field name of number', function(assert) {
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var model = store.find('phonenumber', {person_id: PEOPLE_DEFAULTS.id});
    this.set('model', model);
    this.set('related_pk', PEOPLE_DEFAULTS.id);
    this.set('related_field', 'person_id');
    this.render(hbs`{{input-multi-phone model=model related_pk=related_pk related_field=related_field}}`);
    assert.equal(model.get('content.length'), 0);
    var $component = this.$('.t-input-multi-phone');
    assert.equal(this.$('.t-new-entry').length, 0);
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    $first_btn.trigger('click').trigger('change');
    assert.equal(this.$('.t-new-entry').length, 1);
    assert.equal(model.get('content.length'), 1);
    assert.equal(model.objectAt(0).get('person_id'), PEOPLE_DEFAULTS.id);
    assert.equal(model.objectAt(0).get('type'), PhoneNumberTypeDefaults.officeType);
    assert.equal(model.objectAt(0).get('id'), UUID.value);
    assert.equal(model.objectAt(0).get('number'), undefined);
    this.$('.t-new-entry').val('888-888-8888').trigger('change');
    assert.equal(model.objectAt(0).get('number'), '888-888-8888');
});

test('once added a button for phone number type appears with a button to delete it', function(assert) {
    //currently in General Settings Route
    var model = store.find('phonenumber', {person_id: PEOPLE_DEFAULTS.id});
    var phone_number_types = [PhoneNumberType.create({id: PhoneNumberTypeDefaults.officeType, name: PhoneNumberTypeDefaults.officeName }), PhoneNumberType.create({ id: PhoneNumberTypeDefaults.mobileType, name: PhoneNumberTypeDefaults.mobileName})];
    this.set('model', model);
    this.set('related_pk', PEOPLE_DEFAULTS.id);
    this.set('related_field', 'person_id');
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types related_pk=related_pk related_field=related_field}}`);
    var $component = this.$('.t-input-multi-phone');
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    var $first_type_select = $component.find('.t-multi-phone-type');
    var $first_del = $component.find('.t-del-btn:eq(0)');
    assert.equal($first_type_select.length, 0);
    assert.equal($first_del.length, 0);
    $first_btn.trigger('click');
    $first_del = $component.find('.t-del-btn:eq(0)');
    $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal($first_del.length, 1);
    assert.equal($first_type_select.length, 1);
    //NOTE: If we modify from select to div / ul the below needs to be updated
    assert.equal($first_type_select.find('option').length, 2);
    assert.equal($first_type_select.find('option:eq(0)').text(), 'Office');
    assert.equal($first_type_select.find('option:eq(1)').text(), 'Mobile');
    assert.equal(model.objectAt(0).get("type"), PhoneNumberTypeDefaults.officeType);
});

test('changing the phone number type will alter the bound value', function(assert) {
    var phone_number_types = [PhoneNumberType.create({ id: PhoneNumberTypeDefaults.officeType, name: PhoneNumberTypeDefaults.officeName }), PhoneNumberType.create({ id: PhoneNumberTypeDefaults.mobileType, name: PhoneNumberTypeDefaults.mobileName })];
    var model = store.find('phonenumber', {person_id: PEOPLE_DEFAULTS.id});
    this.set('model', model);
    this.set('related_pk', PEOPLE_DEFAULTS.id);
    this.set('related_field', 'person_id');
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types related_pk=related_pk related_field=related_field}}`);
    var $component = this.$('.t-input-multi-phone');
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    var $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal($first_type_select.length, 0);
    $first_btn.trigger('click');
    $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal(model.objectAt(0).get("type"), PhoneNumberTypeDefaults.officeType);
    $first_type_select.val(PhoneNumberTypeDefaults.mobileType).trigger("change");
    assert.equal(model.objectAt(0).get("type"), PhoneNumberTypeDefaults.mobileType);
    assert.equal($first_type_select.val(), PhoneNumberTypeDefaults.mobileType);
});

test('changing existing phone number type will alter the model regardless of the primary key value', function(assert) {
    store.push('phonenumber', {id: PhoneNumberDefaults.id, number: PhoneNumberDefaults.numberOne, type: PhoneNumberTypeDefaults.officeType, person_id: PEOPLE_DEFAULTS.id});
    store.push('phonenumber', {id: PhoneNumberDefaults.idTwo, number: PhoneNumberDefaults.numberTwo, type: PhoneNumberTypeDefaults.mobileType, person_id: PEOPLE_DEFAULTS.id});
    var model = store.find('phonenumber', {person_id: PEOPLE_DEFAULTS.id});
    this.set('model', model);
    this.set('related_pk', PEOPLE_DEFAULTS.id);
    this.set('related_field', 'person_id');
    var phone_number_types = [PhoneNumberType.create({id: PhoneNumberTypeDefaults.officeType, name: PhoneNumberTypeDefaults.officeName }), PhoneNumberType.create({ id: PhoneNumberTypeDefaults.mobileType, name: PhoneNumberTypeDefaults.mobileName})];
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types related_pk=related_pk related_field=related_field}}`);
    var $component = this.$('.t-input-multi-phone');
    var $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal($first_type_select.length, 2);
    $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal(model.objectAt(0).get('type'), PhoneNumberTypeDefaults.officeType);
    $first_type_select.val(PhoneNumberTypeDefaults.mobileType).trigger("change");
    assert.equal(model.objectAt(0).get("type"), PhoneNumberTypeDefaults.mobileType);
    assert.equal($first_type_select.val(), PhoneNumberTypeDefaults.mobileType);
});

test('click delete btn will remove input', function(assert) {
    //todo: reduce the duplication on phone_number_types
    var phone_number_types = [PhoneNumberType.create({ id: PhoneNumberTypeDefaults.officeType, name: PhoneNumberTypeDefaults.officeName }), PhoneNumberType.create({ id: PhoneNumberTypeDefaults.mobileType, name: PhoneNumberTypeDefaults.mobileName})];
    store.push('phonenumber', {id: PhoneNumberDefaults.id, number: PhoneNumberDefaults.numberOne, type: PhoneNumberTypeDefaults.officeType, person_id: PEOPLE_DEFAULTS.id});
    store.push('phonenumber', {id: PhoneNumberDefaults.idTwo, number: PhoneNumberDefaults.numberTwo, type: PhoneNumberTypeDefaults.mobileType, person_id: PEOPLE_DEFAULTS.id});
    var model = store.find('phonenumber', {person_id: PEOPLE_DEFAULTS.id});
    this.set('model', model);
    this.set('related_pk', PEOPLE_DEFAULTS.id);
    this.set('related_field', 'person_id');
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types related_pk=related_pk related_field=related_field}}`);
    var $component = this.$('.t-input-multi-phone');
    assert.equal(this.$('.t-new-entry').length, 2);
    var $first_del_btn = $component.find('.t-del-btn:eq(0)');
    assert.equal($first_del_btn.length, 1);
    $first_del_btn.trigger('click');
    assert.equal(this.$('.t-new-entry').length, 1);
});
