import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = `${BASE_URL}/index`;
const DETAIL_URL = BASE_URL + '/' + LD.idOne;

let application, store, endpoint, list_xhr;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        let location_list_data = LF.list();
        let location_detail_data = LF.detail();
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
        xhr(endpoint + LD.idOne + '/', 'GET', null, {}, 200, location_detail_data);
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
        let location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.equal(location.get('location_level').get('id'), LLD.idOne);
        assert.equal(find('.t-location-name').val(), LD.baseStoreName);
        assert.equal(find('.t-location-number').val(), LD.storeNumber);
        assert.equal(page.statusInput(), LDS.openName);
    });
    fillIn('.t-location-name', LD.storeNameTwo);
    andThen(() => {
        let location = store.find('location', LD.idOne);
        assert.ok(location.get('isDirty'));
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    page.statusClickDropdown();
    andThen(() => {
        assert.equal(page.statusOptionLength(), 3);
        let location = store.find('location', LD.idOne);
        assert.equal(location.get('status_fk'), LDS.openId);
        assert.equal(location.get('status.id'), LDS.openId);
        assert.ok(location.get('isDirty'));
        assert.ok(location.get('isDirtyOrRelatedDirty'));
        assert.ok(location.get('statusIsNotDirty'));
    });
    page.statusClickOptionTwo();
    andThen(() => {
        assert.equal(page.statusOptionLength(), 0);
        let location = store.find('location', LD.idOne);
        assert.equal(location.get('status_fk'), LDS.openId);
        assert.equal(location.get('status.id'), LDS.closedId);
        assert.ok(location.get('isDirty'));
        assert.ok(location.get('isDirtyOrRelatedDirty'));
        assert.ok(location.get('statusIsDirty'));
    });
    let list = LF.list();
    list.results[0].name = LD.storeNameTwo;
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    let response = LF.detail(LD.idOne);
    let payload = LF.put({id: LD.idOne, name: LD.storeNameTwo, status: LDS.closedId});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        let location = store.find('location', LD.idOne);
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
    fillIn('.t-location-name', LD.storeNameTwo);
    let url = PREFIX + DETAIL_URL + "/";
    let response = LF.detail(LD.idOne);
    let payload = LF.put({id: LD.idOne, name: LD.storeNameTwo});
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
    fillIn('.t-location-name', LD.storeNameTwo);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionTwo();
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-location-name').val(), LD.storeNameTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-name', LD.storeNameTwo);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionTwo();
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_URL);
            let location = store.find('location', LD.idOne);
            assert.equal(location.get('name'), LD.storeName);
        });
    });
});

test('when click delete, location is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + LD.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('location', LD.idOne).get('length'), undefined);
    });
});

test('changing location level will update related location level locations array', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let location = store.find('location', LD.idOne);
        let location_level = store.find('location-level', LLD.idOne);
        let location_level_two = store.find('location-level', LLD.idThree);
        assert.deepEqual(location_level_two.get('locations'), []);
        assert.equal(location.get('location_level_fk'), LLD.idOne);
        assert.deepEqual(location_level.get('locations'), [LD.idOne]);
        assert.equal(page.locationLevelInput().split(' +')[0].trim().split(' ')[0], LLD.nameCompany);
    });
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionTwo();
    andThen(() => {
        let location_level_two = store.find('location-level', LLD.idLossRegion);
        let location_level = store.find('location-level', LLD.idOne);
        let location = store.find('location', LD.idOne);
        assert.equal(location.get('location_level_fk'), LLD.idOne);
        // assert.deepEqual(location_level_two.get('locations'), [LD.idOne]);
        assert.deepEqual(location_level.get('locations'), []);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
        assert.ok(location_level.get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(location_level_two.get('isNotDirtyOrRelatedNotDirty'));
    });
    let response = LF.detail(LD.idOne);
    let payload = LF.put({location_level: LLD.idLossRegion});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});
