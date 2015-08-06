import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

const PREFIX = config.APP.NAMESPACE;
const LOCATION_URL = '/admin/locations';
const DETAIL_URL = LOCATION_URL + '/' + LOCATION_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';

var application, store;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + LOCATION_URL + '/';
        var location_list_data = LOCATION_FIXTURES.list(); 
        var location_detail_data = LOCATION_FIXTURES.detail(); 
        xhr(endpoint, 'GET', null, {}, 200, location_list_data);
        xhr(endpoint + LOCATION_DEFAULTS.idOne + '/', 'GET', null, {}, 200, location_detail_data);
    },
    afterEach() {
       Ember.run(application, 'destroy'); 
    }
});

test('clicking on a locations name will redirect them to the detail view', (assert) => {
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
    click('.t-location-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('visiting admin/location', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location').objectAt(0);
        assert.ok(location.get('isNotDirty'));
        assert.equal(find('.t-location-name').val(), LOCATION_DEFAULTS.storeName);
        assert.equal(find('.t-location-number').val(), LOCATION_DEFAULTS.storeNumber);
    });
    var response = LOCATION_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    var payload = LOCATION_FIXTURES.put({id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeNameTwo});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeNameTwo);
    andThen(() => {
        var location = store.find('location').objectAt(0);
        assert.ok(location.get('isDirty'));
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('when editing name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-name', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid name');
    });
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeNameTwo);
    var url = PREFIX + DETAIL_URL + "/";
    var response = LOCATION_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    var payload = LOCATION_FIXTURES.put({id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeNameTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
    click('.t-location-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeNameTwo);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-location-name').val(), LOCATION_DEFAULTS.storeNameTwo);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeNameTwo);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            var location = store.find('location', LOCATION_DEFAULTS.idOne);
            assert.equal(location.get('name'), LOCATION_DEFAULTS.storeName);
        });
    });
});
