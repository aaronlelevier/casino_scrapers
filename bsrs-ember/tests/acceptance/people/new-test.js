import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = "/admin/people";
const PEOPLE_NEW_URL = PEOPLE_URL + '/new';
const SAVE_BTN = '.t-save-btn';

var application, store;

module('Acceptance | people-new', {
    beforeEach() {
        var payload = {username: PEOPLE_DEFAULTS.username, password: PEOPLE_DEFAULTS.password, email: PEOPLE_DEFAULTS.email, role: PEOPLE_DEFAULTS.role, first_name: PEOPLE_DEFAULTS.first_name, last_name: PEOPLE_DEFAULTS.last_name, phone_numbers: PEOPLE_DEFAULTS.phone_numbers, addresses: PEOPLE_DEFAULTS.addresses, location: PEOPLE_DEFAULTS.location, status: PEOPLE_DEFAULTS.status };
        var response = Ember.$.extend(true, {id: 1}, payload); 
        var url = PREFIX + PEOPLE_URL + '/';
        xhr( url,'POST',payload,{},201,response );
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + PEOPLE_URL + "/";
        xhr( endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.empty() );
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /people/new', (assert) => {
    visit(PEOPLE_URL);
    click('.t-person-new');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL); 
        assert.equal(store.find('person').length, 0);
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    fillIn('.t-person-password', PEOPLE_DEFAULTS.password);
    fillIn('.t-person-email', PEOPLE_DEFAULTS.email);
    fillIn('.t-person-first-name', PEOPLE_DEFAULTS.first_name);
    fillIn('.t-person-last-name', PEOPLE_DEFAULTS.last_name);
    fillIn('.t-person-role', PEOPLE_DEFAULTS.role);//TODO: make true select with multiple options
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL); 
        assert.equal(store.find('person').length, 1);
        assert.equal(store.findOne('person').get('id'), 1);
        assert.equal(store.findOne('person').get('username'), PEOPLE_DEFAULTS.username);
        assert.equal(store.findOne('person').get('password'), PEOPLE_DEFAULTS.password);
        assert.equal(store.findOne('person').get('email'), PEOPLE_DEFAULTS.email);
        assert.equal(store.findOne('person').get('role'), PEOPLE_DEFAULTS.role);
        assert.equal(store.findOne('person').get('first_name'), PEOPLE_DEFAULTS.first_name);
        assert.equal(store.findOne('person').get('last_name'), PEOPLE_DEFAULTS.last_name);
        assert.deepEqual(store.findOne('person').get('phone_numbers'), PEOPLE_DEFAULTS.phone_numbers);
        assert.deepEqual(store.findOne('person').get('addresses'), PEOPLE_DEFAULTS.addresses);
        assert.equal(store.findOne('person').get('status'), PEOPLE_DEFAULTS.status);
        assert.equal(store.findOne('person').get('location'), PEOPLE_DEFAULTS.location);
    });
});

test('validation works and when hit save, we do same post', (assert) => {
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
    fillIn('.t-person-email', PEOPLE_DEFAULTS.email);
    fillIn('.t-person-role', PEOPLE_DEFAULTS.role);//TODO: make true select with multiple options
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL); 
    });
});
