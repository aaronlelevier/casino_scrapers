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
import { options, multiple_options } from 'bsrs-ember/tests/helpers/power-select-terms';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + LLD.idOne;
const DISTRICT_DETAIL_URL = BASE_URL + '/' + LLD.idDistrict;
const LOCATION_LEVEL = '.t-location-level-children-select > .ember-basic-dropdown-trigger';
const LOCATION_LEVEL_DROPDOWN = options;
const LOCATION_LEVEL_SEARCH = '.ember-power-select-trigger-multiple-input';

var application, store, endpoint, endpoint_detail, list_xhr, detail_xhr, location_level_district_detail_data;

module('Acceptance | detail-test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
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
  click('.t-grid-data:eq(0)');
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
    assert.equal(page.childrenOptionLength, 7);
    assert.ok(location_level.get('isDirty'));
  });
  let list = LLF.list();
  list.results[0].name = LLD.nameRegion;
  xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    let location_level = store.find('location-level', LLD.idOne);
    assert.equal(location_level.get('name'), LLD.nameAnother);
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
  click('.t-grid-data:eq(0)');
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
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(find('.t-location-name').val(), LLD.storeNameTwo);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(page.childrenSelectedCount, 7);
    const ll = store.find('location-level', LLD.idOne);
    assert.ok(ll.get('isNotDirtyOrRelatedNotDirty'));
  });
  fillIn('.t-location-level-name', LLD.nameRegion);
  page.childrenOneRemove();
  andThen(() => {
    assert.equal(page.childrenSelectedCount, 6);
    const ll = store.find('location-level', LLD.idOne);
    assert.ok(ll.get('isDirtyOrRelatedDirty'));
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_LEVEL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
      let location_level = store.find('location-level', LLD.idOne);
      assert.equal(location_level.get('name'), LLD.nameCompany);
      assert.equal(location_level.get('children_fks').length, 7);
    });
  });
});

/* jshint ignore:start */
test('when click delete, modal displays and when click ok, location-level is deleted and removed from store', async assert => {
  await visit(DETAIL_URL);
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'location-level'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(endpoint_detail, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_LEVEL_URL);
      assert.equal(store.find('location-level', LLD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});
/* jshint ignore:end */

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
  page.childrenClickDropdown();
  page.childrenClickOptionFirst();
  let children = LLD.companyChildren;
  let payload = LLF.put({id: LLD.idOne, name: LLD.nameCompany, children: children});
  xhr(endpoint_detail, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
  });
});

test('deep linking with an xhr with a 404 status code will show up in the error component (llevel)', (assert) => {
  clearxhr(detail_xhr);
  clearxhr(list_xhr);
  const exception = `This record does not exist.`;
  xhr(`${endpoint}${LLD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
