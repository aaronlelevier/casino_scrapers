import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const DJANGO_LOCATION_LEVEL_URL = '/admin/location_levels/';
const DETAIL_URL = BASE_URL + '/' + LOCATION_LEVEL_DEFAULTS.idOne;
const DISTRICT_DETAIL_URL = BASE_URL + '/' + LOCATION_LEVEL_DEFAULTS.idDistrict;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_LOCATION_LEVEL_URL + LOCATION_LEVEL_DEFAULTS.idOne + '/';
const DJANGO_DISTRICT_DETAIL_URL = PREFIX + DJANGO_LOCATION_LEVEL_URL + LOCATION_LEVEL_DEFAULTS.idDistrict + '/';
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const CANCEL_BTN = '.t-cancel-btn';

let application, store, endpoint, list_xhr, detail_xhr, location_level_district_detail_data;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        let location_list_data = LOCATION_LEVEL_FIXTURES.list();
        let location_detail_data = LOCATION_LEVEL_FIXTURES.detail();
        location_level_district_detail_data = LOCATION_LEVEL_FIXTURES.detail_district();
        endpoint = PREFIX + DJANGO_LOCATION_LEVEL_URL;
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, location_list_data);
        detail_xhr = xhr(DJANGO_DETAIL_URL, 'GET', null, {}, 200, location_detail_data);
    },
    afterEach() {
       Ember.run(application, 'destroy');
       detail_xhr = null;
       list_xhr = null;
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

test('visiting admin/location-level', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let location = store.find('location-level').objectAt(0);
        assert.ok(location.get('isNotDirty'));
        assert.equal(find('.t-location-level-name').val(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    });
    let response = LOCATION_LEVEL_FIXTURES.detail(LOCATION_LEVEL_DEFAULTS.idOne);
    let payload = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameAnother, children: LOCATION_LEVEL_DEFAULTS.companyChildren});
    xhr(DJANGO_DETAIL_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameAnother);
    andThen(() => {
        let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        assert.equal(location_level.get('children_fks').length, 7);
        assert.equal(location_level.get('children').get('length'), 7);
        assert.equal(find('.t-location-level-location-level-select > div.option').length, 0);
        assert.equal(find('.items > div.item').length, 7);
        assert.ok(location_level.get('isDirty'));
    });
    let list = LOCATION_LEVEL_FIXTURES.list();
    list.results[0].name = LOCATION_LEVEL_DEFAULTS.nameRegion;
    xhr(endpoint, 'GET', null, {}, 200, list);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        assert.equal(location_level.get('name'), LOCATION_LEVEL_DEFAULTS.nameRegion);
        assert.ok(location_level.get('isNotDirty'));
    });
});

test('a location level child can be selected and persisted', (assert) => {
    clearxhr(list_xhr);
    clearxhr(detail_xhr);
    xhr(DJANGO_DISTRICT_DETAIL_URL, 'GET', null, {}, 200, location_level_district_detail_data);
    visit(DISTRICT_DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DISTRICT_DETAIL_URL);
        let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idDistrict);
        assert.equal(location_level.get('children_fks').length, 2);
        assert.equal(location_level.get('children').get('length'), 2);
    });
    let response = LOCATION_LEVEL_FIXTURES.detail(LOCATION_LEVEL_DEFAULTS.idDistrict);
    let children = LOCATION_LEVEL_DEFAULTS.districtChildren;
    children.unshift(LOCATION_LEVEL_FIXTURES.idOne);
    let payload = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_LEVEL_DEFAULTS.idDistrict, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, children: children});
    xhr(DJANGO_DISTRICT_DETAIL_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
    click('.selectize-input input');
    click('.t-location-level-location-level-select div.option:eq(0)');//TODO: assert.async shows district as an option on dropdown.  Should be company
    andThen(() => {
        let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idDistrict);
        assert.equal(location_level.get('children_fks').length, 3);
        assert.equal(location_level.get('children').get('length'), 3);
        assert.equal(find('.t-location-level-location-level-select > div.option').length, 0);
        assert.equal(find('.items > div.item').length, 3);
        assert.ok(location_level.get('isDirty'));
    });
    let list = LOCATION_LEVEL_FIXTURES.list();
    let children_array = LOCATION_LEVEL_DEFAULTS.districtChildren;
    children_array.push(children_array.shift());
    list.results[0].children = children_array;
    xhr(endpoint, 'GET', null, {}, 200, list);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idDistrict);
        assert.deepEqual(location_level.get('children_fks'), children_array);
        assert.ok(location_level.get('isNotDirty'));
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
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    let response = LOCATION_LEVEL_FIXTURES.detail(LOCATION_LEVEL_DEFAULTS.idOne);
    let payload = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children: LOCATION_LEVEL_DEFAULTS.companyChildren});
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
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
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
            assert.equal(find('.t-location-name').val(), LOCATION_LEVEL_DEFAULTS.storeNameTwo);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
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
            let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
            assert.equal(location_level.get('name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
        });
    });
});

// test('sco when click delete, location level is deleted and removed from store', (assert) => {
//     visit(DETAIL_URL);
//     xhr(DJANGO_DETAIL_URL, 'DELETE', null, {}, 204, {});
//     click('.t-delete-btn');
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_LEVEL_URL);
//     });
// });
