import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + LOCATION_DEFAULTS.idOne;

let application, store, endpoint, list_xhr;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        let location_list_data = LOCATION_FIXTURES.list();
        let location_detail_data = LOCATION_FIXTURES.detail();
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
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
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('visiting admin/location', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let location = store.find('location', LOCATION_DEFAULTS.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.equal(location.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
        assert.equal(find('.t-location-name').val(), LOCATION_DEFAULTS.baseStoreName);
        assert.equal(find('.t-location-number').val(), LOCATION_DEFAULTS.storeNumber);
    });
    let response = LOCATION_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    let payload = LOCATION_FIXTURES.put({id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeNameTwo});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeNameTwo);
    andThen(() => {
        let location = store.find('location', LOCATION_DEFAULTS.idOne);
        assert.ok(location.get('isDirty'));
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    let list = LOCATION_FIXTURES.list();
    list.results[0].name = LOCATION_DEFAULTS.storeNameTwo;
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        let location = store.find('location', LOCATION_DEFAULTS.idOne);
        assert.ok(location.get('isNotDirty'));
    });
});

test('when editing name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-name', '');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid Name');
    });
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeNameTwo);
    let url = PREFIX + DETAIL_URL + "/";
    let response = LOCATION_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    let payload = LOCATION_FIXTURES.put({id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeNameTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-location-name', LOCATION_DEFAULTS.storeNameTwo);
    generalPage.cancel();
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
    fillIn('.t-location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    generalPage.cancel();
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
            let location = store.find('location', LOCATION_DEFAULTS.idOne);
            assert.equal(location.get('name'), LOCATION_DEFAULTS.storeName);
        });
    });
});

test('when click delete, location is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + LOCATION_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('location', LOCATION_DEFAULTS.idOne).get('length'), undefined);
    });
});

test('changing location level will update related location level locations array', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        let location = store.find('location', LOCATION_DEFAULTS.idOne);
        assert.equal(location.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
        assert.deepEqual(location_level.get('locations'), [LOCATION_DEFAULTS.idOne]);
    });
    fillIn('.t-location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    andThen(() => {
        let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
        let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        let location = store.find('location', LOCATION_DEFAULTS.idOne);
        assert.equal(location.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
        assert.deepEqual(location_level_two.get('locations'), [LOCATION_DEFAULTS.idOne]);
        assert.deepEqual(location_level.get('locations'), []);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
        assert.ok(location_level.get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(location_level_two.get('isNotDirtyOrRelatedNotDirty'));
    });
    let response = LOCATION_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    let payload = LOCATION_FIXTURES.put({location_level: LOCATION_LEVEL_DEFAULTS.idTwo});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('changing location level to none will dirty the location model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level', 'Select One');
    andThen(() => {
        let location = store.find('location', LOCATION_DEFAULTS.idOne);
        assert.equal(location.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    let response = LOCATION_FIXTURES.detail(LOCATION_DEFAULTS.idOne);
    let payload = LOCATION_FIXTURES.put({location_level: undefined});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});
