import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

const PREFIX = config.APP.NAMESPACE;
const LOCATION_LEVEL_URL = '/admin/location-levels';
const DJANGO_LOCATION_LEVEL_URL = '/admin/location_levels/';
const DETAIL_URL = LOCATION_LEVEL_URL + '/' + LOCATION_DEFAULTS.idOne;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_LOCATION_LEVEL_URL + LOCATION_DEFAULTS.idOne + '/';
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const CANCEL_BTN = '.t-cancel-btn';

var application, store;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        var location_list_data = LOCATION_LEVEL_FIXTURES.list(); 
        var location_detail_data = LOCATION_LEVEL_FIXTURES.detail(); 
        xhr(PREFIX + DJANGO_LOCATION_LEVEL_URL, 'GET', null, {}, 200, location_list_data);
        xhr(DJANGO_DETAIL_URL, 'GET', null, {}, 200, location_detail_data);
    },
    afterEach() {
       Ember.run(application, 'destroy'); 
    }
});

test('clicking on a location levels name will redirect them to the detail view', (assert) => {
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
    click('.t-location-level-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('visiting admin/location', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location-level').objectAt(0);
        assert.ok(location.get('isNotDirty'));
        assert.equal(find('.t-location-level-name').val(), LOCATION_DEFAULTS.nameCompany);
    });
    var response = LOCATION_LEVEL_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    var payload = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.nameRegion});
    xhr(DJANGO_DETAIL_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-location-level-name', LOCATION_DEFAULTS.nameRegion);
    andThen(() => {
        var location = store.find('location-level').objectAt(0);
        assert.ok(location.get('isDirty'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        var location = store.find('location-level').objectAt(0);
        assert.ok(location.get('isNotDirty'));
    });
});

test('when editing name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid Name');
    });
    fillIn('.t-location-level-name', LOCATION_DEFAULTS.nameCompany);
    var response = LOCATION_LEVEL_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    var payload = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.nameCompany});
    xhr(DJANGO_DETAIL_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
    click('.t-location-level-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    click(CANCEL_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', LOCATION_DEFAULTS.nameRegion);
    click(CANCEL_BTN);
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
    fillIn('.t-location-level-name', LOCATION_DEFAULTS.nameRegion);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_LEVEL_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            var location_level = store.find('location-level', LOCATION_DEFAULTS.idOne);
            assert.equal(location_level.get('name'), LOCATION_DEFAULTS.nameCompany);
        });
    });
});

test('when click delete, location level is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(DJANGO_DETAIL_URL, 'DELETE', null, {}, 204, {});
    click('.t-delete-btn');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});
