import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LLF from 'bsrs-ember/vendor/location_level_fixtures';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location-level';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + LLD.idOne;
const DISTRICT_DETAIL_URL = BASE_URL + '/' + LLD.idDistrict;

let application, store, endpoint, endpoint_detail, list_xhr, detail_xhr, location_level_district_detail_data;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        let location_list_data = LLF.list();
        let location_detail_data = LLF.detail();
        location_level_district_detail_data = LLF.detail_district();
        endpoint = PREFIX + BASE_URL + '/';
        endpoint_detail = PREFIX + DETAIL_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
        detail_xhr = xhr(endpoint_detail, 'GET', null, {}, 200, location_detail_data);
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
    click('.t-grid-data:eq(2)');
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
        assert.equal(find('.t-location-level-name').val(), LLD.nameCompany);
    });
    let response = LLF.detail(LLD.idOne);
    let payload = LLF.put({id: LLD.idOne, name: LLD.nameAnother, children: LLD.companyChildren});
    xhr(endpoint_detail, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-location-level-name', LLD.nameAnother);
    page.childrenClickDropdown();
    andThen(() => {
        let location_level = store.find('location-level', LLD.idOne);
        assert.equal(location_level.get('children_fks').length, 7);
        assert.equal(location_level.get('children').get('length'), 7);
        assert.equal(page.childrenOptionLength(), 7);
        assert.ok(location_level.get('isDirty'));
    });
    let list = LLF.list();
    list.results[0].name = LLD.nameRegion;
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        let location_level = store.find('location-level', LLD.idOne);
        assert.equal(location_level.get('name'), LLD.nameRegion);
        assert.ok(location_level.get('isNotDirty'));
    });
});

test('a location level child can be selected and persisted', (assert) => {
    clearxhr(list_xhr);
    clearxhr(detail_xhr);
    xhr(PREFIX + DISTRICT_DETAIL_URL + '/', 'GET', null, {}, 200, location_level_district_detail_data);
    visit(DISTRICT_DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DISTRICT_DETAIL_URL);
        let location_level = store.find('location-level', LLD.idDistrict);
        assert.equal(location_level.get('children_fks').length, 2);
        assert.equal(location_level.get('children').get('length'), 2);
    });
    page.childrenClickDropdown();
    page.childrenClickOptionRegion();
    andThen(() => {
        let location_level = store.find('location-level', LLD.idDistrict);
        assert.equal(location_level.get('children_fks').length, 3);
        assert.equal(location_level.get('children').get('length'), 3);
        assert.ok(location_level.get('isDirty'));
    });
    let children = [LLD.idStore, LLD.idLossRegion, LLD.idTwo];
    let payload = LLF.put({id: LLD.idDistrict, name: LLD.nameDistrict, children: children});
    xhr(PREFIX + DISTRICT_DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, {});
    let list = LLF.list();
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        let location_level = store.find('location-level', LLD.idDistrict);
        assert.ok(location_level.get('isNotDirty'));
    });
});

test('when editing name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', '');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid Name');
    });
    fillIn('.t-location-level-name', LLD.nameRegion);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').is(':hidden'), false);
    });
    let response = LLF.detail(LLD.idOne);
    response.name = LLD.nameAnother;
    let payload = LLF.put({id: LLD.idOne, name: LLD.nameAnother, children: LLD.companyChildren});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-location-level-name', LLD.nameAnother);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
    click('.t-grid-data:eq(2)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', LLD.nameRegion);
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
            assert.equal(find('.t-location-name').val(), LLD.storeNameTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', LLD.nameRegion);
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
            assert.equal(currentURL(), LOCATION_LEVEL_URL);
            let location_level = store.find('location-level', LLD.idOne);
            assert.equal(location_level.get('name'), LLD.nameCompany);
        });
    });
});

test('when click delete, location level is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(endpoint_detail, 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(store.find('location-level', LLD.idOne).get('length'), undefined);
    });
});

/* Children */
test('can remove and add back children', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        const model = store.find('location-level', LLD.idOne);
        assert.equal(model.get('children_fks').length, 7);
    });
    //reclicking removes
    page.childrenClickDropdown();
    page.childrenClickOptionFacilityManagement();
    page.childrenClickDropdown();
    page.childrenClickOptionLossPreventionDistrict();
    andThen(() => {
        const model = store.find('location-level', LLD.idOne);
        assert.equal(model.get('children_fks').length, 5);
    });
    page.childrenClickDropdown();
    page.childrenClickOptionFacilityManagement();
    page.childrenClickDropdown();
    page.childrenClickOptionLossPreventionDistrict();
    andThen(() => {
        const model = store.find('location-level', LLD.idOne);
        assert.equal(model.get('children_fks').length, 7);
    });
    //click x button
    page.childrenOneRemove();
    andThen(() => {
        const model = store.find('location-level', LLD.idOne);
        assert.equal(model.get('children_fks').length, 6);
    });
    page.childrenClickOptionFirst();
    let children = LLD.companyChildren;
    let payload = LLF.put({id: LLD.idOne, name: LLD.nameCompany, children: children});
    xhr(endpoint_detail, 'PUT', JSON.stringify(payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});
