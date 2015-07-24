import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';
import PhoneNumberDefaults from 'bsrs-ember/vendor/phone-number-type';
import PEOPLE_FACTORY from 'bsrs-ember/vendor/people_fixtures';

moduleForComponent('input-multi-phone', 'integration: input-multi-phone test', {
    integration: true,
    setup() {
        translation.initialize(this);
    }
});

// test('renders a single button with a class of t-add-btn', function(assert){
//   this.render(hbs`{{input-multi model=things}}`);
//   var $component = this.$('.t-input-multi');
//   assert.equal($component.find('.t-add-btn').length, 1);
// });

test('defaults to use phone number model with field name of number', function(assert) {
    var model = [];
    this.set('model', model);
    this.set('related_pk', 1);
    this.set('related_field', 'person_id');
    this.render(hbs`{{input-multi-phone model=model related_pk=related_pk related_field=related_field}}`);
    var $component = this.$('.t-input-multi-phone');
    assert.equal(this.$('.t-new-entry').length, 0);
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    $first_btn.trigger('click');
    assert.equal(this.$('.t-new-entry').length, 1);
    assert.equal(model.length, 1);
    assert.equal(model.objectAt(0).get('type'), 1);
    assert.equal(model.objectAt(0).get('person_id'), 1);
    assert.equal(model.objectAt(0).get('id'), 'abc123'); //replace w/ default value
    assert.equal(model.objectAt(0).get('number'), undefined);
    this.$('.t-new-entry').val('888-888-8888').trigger('change');
    assert.equal(model.objectAt(0).get('number'), '888-888-8888');
});

test('once added a button for phone number type appears with a button to delete it', function(assert) {
    //currently in General Settings Route
    var model = [];
    var phone_number_types = [PhoneNumberType.create({ id: PhoneNumberDefaults.officeType, name: PhoneNumberDefaults.officeName }), PhoneNumberType.create({ id: PhoneNumberDefaults.mobileType, name: PhoneNumberDefaults.mobileName })];
    this.set('model', model);
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types}}`);
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
    assert.equal(model.objectAt(0).get("type"), PhoneNumberDefaults.officeType);
});

test('changing the phone number type will alter the bound value', function(assert) {
    var phone_number_types = [PhoneNumberType.create({ id: PhoneNumberDefaults.officeType, name: PhoneNumberDefaults.officeName }), PhoneNumberType.create({ id: PhoneNumberDefaults.mobileType, name: PhoneNumberDefaults.mobileName })];
    var model = [];
    this.set('model', model);
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types}}`);
    var $component = this.$('.t-input-multi-phone');
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    var $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal($first_type_select.length, 0);
    $first_btn.trigger('click');
    $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal(model.objectAt(0).get("type"), PhoneNumberDefaults.officeType);
    $first_type_select.val(PhoneNumberDefaults.mobileType).trigger("change");
    assert.equal(model.objectAt(0).get("type"), PhoneNumberDefaults.mobileType);
    assert.equal($first_type_select.val(), PhoneNumberDefaults.mobileType);
});

test('changing existing phone number type will alter the model regardless of the primary key value', function(assert) {
    var officePhoneNumber = 9;
    var mobilePhoneNumber = 8;
    var phone_number_types = [PhoneNumberType.create({ id: officePhoneNumber, name: PhoneNumberDefaults.officeName }), PhoneNumberType.create({ id: mobilePhoneNumber, name: PhoneNumberDefaults.mobileName })];
    var model = [PhoneNumber.create({ id: 1, number: '888-888-8888', type: officePhoneNumber }), PhoneNumber.create({ id: 2, number: '999-999-9999', type: mobilePhoneNumber })];
    this.set('model', model);
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types}}`);
    var $component = this.$('.t-input-multi-phone');
    var $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal($first_type_select.length, 2);
    $first_type_select = $component.find('.t-multi-phone-type');
    assert.equal(model.objectAt(0).get('type'), officePhoneNumber);
    $first_type_select.val(mobilePhoneNumber).trigger("change");
    assert.equal(model.objectAt(0).get("type"), mobilePhoneNumber);
    assert.equal($first_type_select.val(), mobilePhoneNumber);
});

test('click delete btn will remove input', function(assert) {
    //todo: reduce the duplication on phone_number_types
    var phone_number_types = [PhoneNumberType.create({ id: PhoneNumberDefaults.officeType, name: PhoneNumberDefaults.officeName }), PhoneNumberType.create({ id: PhoneNumberDefaults.mobileType, name: PhoneNumberDefaults.mobileName })];
    var model = [PhoneNumber.create({ id: 1, number: '888-888-8888', type: phone_number_types[0].get('id') }), PhoneNumber.create({ id: 2, number: '999-999-9999', type: phone_number_types[1].get('id') })];
    this.set('model', model);
    this.set('phone_number_types', phone_number_types);
    this.render(hbs`{{input-multi-phone model=model types=phone_number_types}}`);
    var $component = this.$('.t-input-multi-phone');
    assert.equal(this.$('.t-new-entry').length, 2);
    var $first_del_btn = $component.find('.t-del-btn:eq(0)');
    assert.equal($first_del_btn.length, 1);
    $first_del_btn.trigger('click');
    assert.equal(this.$('.t-new-entry').length, 1);
});
