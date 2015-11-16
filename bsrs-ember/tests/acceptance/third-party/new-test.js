import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import THIRD_PARTY_FIXTURES from 'bsrs-ember/vendor/third_party_fixtures';
import THIRD_PARTY_DEFAULTS from 'bsrs-ember/vendor/defaults/third-party';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_third_parties_url;
const THIRD_PARTY_URL = BASE_URL + '/index';
const THIRD_PARTY_NEW_URL = BASE_URL + '/new';
const DJANGO_THIRD_PARTY_URL = PREFIX + '/admin/third-parties/';
const DETAIL_URL = BASE_URL + '/' + THIRD_PARTY_DEFAULTS.idOne;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_THIRD_PARTY_URL + THIRD_PARTY_DEFAULTS.idOne + '/';

let application, original_uuid, store, payload, list_xhr;

module('Acceptance | third-party-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(`${DJANGO_THIRD_PARTY_URL}?page=1`, "GET", null, {}, 200, THIRD_PARTY_FIXTURES.empty());
        payload = {
            id: UUID.value,
            name: THIRD_PARTY_DEFAULTS.nameOne,
            number: THIRD_PARTY_DEFAULTS.numberOne,
            status: THIRD_PARTY_DEFAULTS.statusActive
        };
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
    },
    afterEach() {
        payload = null;
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('visit /third-parties/new and do a create', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_THIRD_PARTY_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    visit(THIRD_PARTY_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
        assert.equal(store.find('third-party').get('length'), 1);
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameOne);
    fillIn('.t-third-party-number', THIRD_PARTY_DEFAULTS.numberOne);
    fillIn('.t-third-party-status', THIRD_PARTY_DEFAULTS.statusActive);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
        assert.equal(store.find('third-party').get('length'), 1);
        let third_party = store.find('third-party', UUID.value);
        assert.equal(third_party.get('id'), UUID.value);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameOne);
        assert.equal(third_party.get('number'), THIRD_PARTY_DEFAULTS.numberOne);
        assert.equal(third_party.get('status'), THIRD_PARTY_DEFAULTS.statusActive);
        assert.ok(third_party.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_THIRD_PARTY_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    visit(THIRD_PARTY_URL);
    click('.t-add-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
        assert.ok(find('.t-status-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-number-validation-error').is(':visible'));
        assert.ok(find('.t-status-validation-error').is(':visible'));
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
        assert.ok(find('.t-number-validation-error').is(':visible'));
        assert.ok(find('.t-status-validation-error').is(':visible'));
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameOne);
    fillIn('.t-third-party-number', THIRD_PARTY_DEFAULTS.numberOne);
    fillIn('.t-third-party-status', THIRD_PARTY_DEFAULTS.statusActive);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(THIRD_PARTY_NEW_URL);
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameOne);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
            assert.equal(find('.t-third-party-name').val(), THIRD_PARTY_DEFAULTS.nameOne);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(THIRD_PARTY_NEW_URL);
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.storeName);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let third_party = store.find('third-party', {id: UUID.value});
            assert.equal(third_party.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), THIRD_PARTY_URL);
            let third_party = store.find('third-party', {id: UUID.value});
            assert.equal(third_party.get('length'), 0);
            assert.equal(find('tr.t-grid-data').length, 0);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    visit(THIRD_PARTY_NEW_URL);
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('third-party').get('length'), 0);
    });
});
