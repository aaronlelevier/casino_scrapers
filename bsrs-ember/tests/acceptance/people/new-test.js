import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PhoneNumberDefaults from 'bsrs-ember/vendor/defaults/phone-number-type';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = "/admin/people";
const PEOPLE_NEW_URL = PEOPLE_URL + '/new';
const SAVE_BTN = '.t-save-btn';

var application, store, payload;

module('Acceptance | people-new', {
    beforeEach() {
        payload = {
            username: PEOPLE_DEFAULTS.username,
            password: PEOPLE_DEFAULTS.password,
            email: PEOPLE_DEFAULTS.email,
            role: PEOPLE_DEFAULTS.role,
            first_name: PEOPLE_DEFAULTS.first_name,
            middle_initial: PEOPLE_DEFAULTS.middle_initial,
            last_name: PEOPLE_DEFAULTS.last_name,
            phone_numbers: PEOPLE_DEFAULTS.phone_numbers,
            addresses: PEOPLE_DEFAULTS.addresses,
            location: PEOPLE_DEFAULTS.location,
            status: PEOPLE_DEFAULTS.status
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + PEOPLE_URL + "/";
        xhr( endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.empty() );
    },
    afterEach() {
        payload = null;
        Ember.run(application, 'destroy');
    }
});

test('visiting /people/new', (assert) => {
    payload.phone_numbers = [{cid: 'abc123', number: '999-999-9999', type: PhoneNumberDefaults.officeType}];
    var response = Ember.$.extend(true, {id: PEOPLE_DEFAULTS.id}, payload);
    response.phone_numbers[0].cid = 'abc123';
    response.phone_numbers[0].id = 'def456';
    var url = PREFIX + PEOPLE_URL + '/';
    xhr( url,'POST',payload,{},201,response );
    visit(PEOPLE_URL);
    click('.t-person-new');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.equal(store.find('person').length, 1);
        assert.equal(store.find('phonenumber').length, 0);
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    fillIn('.t-person-password', PEOPLE_DEFAULTS.password);
    fillIn('.t-person-email', PEOPLE_DEFAULTS.email);
    fillIn('.t-person-first-name', PEOPLE_DEFAULTS.first_name);
    fillIn('.t-person-middle-initial', PEOPLE_DEFAULTS.middle_initial);
    fillIn('.t-person-last-name', PEOPLE_DEFAULTS.last_name);
    fillIn('.t-person-role', PEOPLE_DEFAULTS.role);//TODO: make true select with multiple options
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry', '999-999-9999');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('person').length, 1);
        var person = store.find('person').objectAt(0);
        assert.equal(person.get('id'), PEOPLE_DEFAULTS.id);
        assert.equal(person.get('username'), PEOPLE_DEFAULTS.username);
        assert.equal(person.get('password'), PEOPLE_DEFAULTS.password);
        assert.equal(person.get('email'), PEOPLE_DEFAULTS.email);
        assert.equal(person.get('role'), PEOPLE_DEFAULTS.role);
        assert.equal(person.get('first_name'), PEOPLE_DEFAULTS.first_name);
        assert.equal(person.get('middle_initial'), PEOPLE_DEFAULTS.middle_initial);
        assert.equal(person.get('last_name'), PEOPLE_DEFAULTS.last_name);
        assert.equal(store.find('phonenumber').length, 1);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('phoneNumbersIsNotDirty'));
        var phonenumber = person.get('phone_numbers').objectAt(0);
        assert.equal(phonenumber.get('number'), '999-999-9999');
        assert.equal(phonenumber.get('id'), 'def456');
        assert.equal(phonenumber.get('type'), PhoneNumberDefaults.officeType);
        assert.equal(phonenumber.get('person_id'), PEOPLE_DEFAULTS.id);
        var phonenumber_from_store = store.find('phonenumber').objectAt(0);
        assert.equal(phonenumber_from_store.get('number'), '999-999-9999');
        assert.equal(phonenumber_from_store.get('id'), 'def456');
        assert.equal(phonenumber_from_store.get('type'), PhoneNumberDefaults.officeType);
        assert.equal(phonenumber_from_store.get('person_id'), PEOPLE_DEFAULTS.id);
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    var response = Ember.$.extend(true, {id: PEOPLE_DEFAULTS.id}, payload);
    var url = PREFIX + PEOPLE_URL + '/';
    xhr( url,'POST',payload,{},201,response );
    visit(PEOPLE_URL);
    click('.t-person-new');
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':hidden'));
        assert.ok(find('.t-password-validation-error').is(':hidden'));
        assert.ok(find('.t-first-name-validation-error').is(':hidden'));
        assert.ok(find('.t-last-name-validation-error').is(':hidden'));
        assert.ok(find('.t-email-validation-error').is(':hidden'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':visible'));
        assert.ok(find('.t-password-validation-error').is(':visible'));
        assert.ok(find('.t-first-name-validation-error').is(':visible'));
        assert.ok(find('.t-last-name-validation-error').is(':visible'));
        assert.ok(find('.t-email-validation-error').is(':visible'));
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.ok(find('.t-username-validation-error').is(':hidden'));
    });
    fillIn('.t-person-password', PEOPLE_DEFAULTS.password);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.ok(find('.t-password-validation-error').is(':hidden'));
    });
    fillIn('.t-person-first-name', PEOPLE_DEFAULTS.first_name);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.ok(find('.t-first-name-validation-error').is(':hidden'));
    });
    fillIn('.t-person-last-name', PEOPLE_DEFAULTS.last_name);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.ok(find('.t-last-name-validation-error').is(':hidden'));
    });
    fillIn('.t-person-middle-initial', PEOPLE_DEFAULTS.middle_initial);
    fillIn('.t-person-email', PEOPLE_DEFAULTS.email);
    fillIn('.t-person-role', PEOPLE_DEFAULTS.role);//TODO: make true select with multiple options
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});
