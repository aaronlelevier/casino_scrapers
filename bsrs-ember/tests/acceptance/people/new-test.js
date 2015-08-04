import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = "/admin/people";
const PEOPLE_NEW_URL = PEOPLE_URL + '/new';
const SAVE_BTN = '.t-save-btn';

var application, store, payload;

module('sco Acceptance | people-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            username: PEOPLE_DEFAULTS.username,
            password: PEOPLE_DEFAULTS.password,
            // first_name: PEOPLE_DEFAULTS.first_name,
            // middle_initial: PEOPLE_DEFAULTS.middle_initial,
            // last_name: PEOPLE_DEFAULTS.last_name,
            // location: PEOPLE_DEFAULTS.location,
            // status: PEOPLE_DEFAULTS.status,
            role: PEOPLE_DEFAULTS.role,
            // email: PEOPLE_DEFAULTS.email,
            // phone_numbers: PEOPLE_DEFAULTS.phone_numbers,
            // addresses: PEOPLE_DEFAULTS.addresses
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + PEOPLE_URL + "/";
        xhr(endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.empty());
    },
    afterEach() {
        payload = null;
        Ember.run(application, 'destroy');
    }
});

test('visiting /people/new', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + PEOPLE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(PEOPLE_URL);
    click('.t-person-new');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.equal(store.find('person').get('length'), 1);
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    fillIn('.t-person-password', PEOPLE_DEFAULTS.password);
    fillIn('.t-person-role', PEOPLE_DEFAULTS.role);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('person').get('length'), 1);
        var person = store.find('person').objectAt(0);
        assert.equal(person.get('id'), UUID.value);
        assert.equal(person.get('username'), PEOPLE_DEFAULTS.username);
        assert.equal(person.get('password'), PEOPLE_DEFAULTS.password);
        assert.equal(person.get('role'), PEOPLE_DEFAULTS.role);
        assert.ok(person.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    var url = PREFIX + PEOPLE_URL + '/';
    xhr( url,'POST',JSON.stringify(payload),{},201,response );
    visit(PEOPLE_URL);
    click('.t-person-new');
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':hidden'));
        assert.ok(find('.t-password-validation-error').is(':hidden'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':visible'));
        assert.ok(find('.t-password-validation-error').is(':visible'));
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL);
        assert.ok(find('.t-username-validation-error').is(':hidden'));
    });
    fillIn('.t-person-password', PEOPLE_DEFAULTS.password);
    fillIn('.t-person-role', PEOPLE_DEFAULTS.role);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    visit(PEOPLE_NEW_URL);
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_NEW_URL);
            assert.equal(find('.t-person-username').val(), PEOPLE_DEFAULTS.username);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(PEOPLE_NEW_URL);
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            var person = store.find('person', {id: UUID.value});
            assert.equal(person.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            var person = store.find('person', {id: UUID.value});
            assert.equal(person.get('length'), 0);
            assert.equal(find('tr.t-person-data').length, 0);
        });
    });
});

