import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import InputMultiPhoneComponent from 'bsrs-ember/components/input-multi-phone/component';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';
import PHONE_NUMBER_TYPE_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

var store, eventbus, run = Ember.run;

module('unit: input-multi-phone component test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:phonenumber', 'service:eventbus']);
        eventbus = this.container.lookup('service:eventbus');
    }
});

test('valid computed should ignore models with an empty or undefined number attr (starting with no bound models)', (assert) => {
    let phone_number;
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let phone_number_types = [PhoneNumberType.create({ id: PHONE_NUMBER_TYPE_DEFAULTS.officeId, name: PHONE_NUMBER_TYPE_DEFAULTS.officeName }), PhoneNumberType.create({ id: PHONE_NUMBER_TYPE_DEFAULTS.mobileId, name: PHONE_NUMBER_TYPE_DEFAULTS.mobileName })];
    let model = store.find('phonenumber', {person: PEOPLE_DEFAULTS.id});
    let subject = InputMultiPhoneComponent.create({model: model, eventbus: eventbus});
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number = model.push({id: 'def456', type: PHONE_NUMBER_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number.set('number', '1');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        phone_number.set('number', '');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number.set('number', ' ');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
});

test('valid computed should ignore models with an empty or undefined number attr (when the middle model is modified)', (assert) => {
    let phone_number_two;
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let phone_number_types = [PhoneNumberType.create({ id: PHONE_NUMBER_TYPE_DEFAULTS.officeId, name: PHONE_NUMBER_TYPE_DEFAULTS.officeName }), PhoneNumberType.create({ id: PHONE_NUMBER_TYPE_DEFAULTS.mobileId, name: PHONE_NUMBER_TYPE_DEFAULTS.mobileName })];
    let model = store.find('phonenumber', {person: PEOPLE_DEFAULTS.id});
    let subject = InputMultiPhoneComponent.create({model: model, eventbus: eventbus});
    assert.equal(subject.get('valid'), true);
    run(() => {
        let phone_number_one = model.push({id: 'def457', type: PHONE_NUMBER_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
        phone_number_two = model.push({id: 'def458', type: PHONE_NUMBER_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
        let phone_number_three = model.push({id: 'def459', type: PHONE_NUMBER_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number_two.set('number', '1');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        phone_number_two.set('number', '');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number_two.set('number', ' ');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
});

test('valid computed should ignore models with an empty or undefined number attr (when the middle model is blank)', (assert) => {
    let phone_number_one;
    let phone_number_two;
    let phone_number_three;
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let phone_number_types = [PhoneNumberType.create({ id: PHONE_NUMBER_TYPE_DEFAULTS.officeId, name: PHONE_NUMBER_TYPE_DEFAULTS.officeName }), PhoneNumberType.create({ id: PHONE_NUMBER_TYPE_DEFAULTS.mobileId, name: PHONE_NUMBER_TYPE_DEFAULTS.mobileName })];
    let model = store.find('phonenumber', {person: PEOPLE_DEFAULTS.id});
    let subject = InputMultiPhoneComponent.create({model: model, eventbus: eventbus});
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number_one = model.push({id: 'def457', type: PHONE_NUMBER_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
        phone_number_two = model.push({id: 'def458', type: PHONE_NUMBER_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
        phone_number_three = model.push({id: 'def459', type: PHONE_NUMBER_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number_one.set('number', '515-333-456');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        phone_number_one.set('number', '515-333-4567');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number_three.set('number', '515-343-223');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        phone_number_three.set('number', '515-343-2234');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        phone_number_two.set('number', '515');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        phone_number_two.set('number', '');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
});
