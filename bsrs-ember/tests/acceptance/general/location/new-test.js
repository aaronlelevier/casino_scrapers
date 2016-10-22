import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import ED from 'bsrs-ember/vendor/defaults/email';
import EF from 'bsrs-ember/vendor/email_fixtures';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import AD from 'bsrs-ember/vendor/defaults/address';
import AF from 'bsrs-ember/vendor/address_fixtures';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import CF from 'bsrs-ember/vendor/country_fixtures';
import SF from 'bsrs-ember/vendor/state_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location';
import random from 'bsrs-ember/models/random';
import {parents_payload, children_payload, email_payload, phone_number_payload, address_put_payload, new_put_payload} from 'bsrs-ember/tests/helpers/payloads/location';
import { options, multiple_options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_URL + '/index';
const LOCATION_NEW_URL = BASE_URL + '/new/1';
const DETAIL_URL = BASE_URL + '/' + UUID.value;
const DJANGO_LOCATION_NEW_URL = PREFIX + LOCATIONS_URL +UUID.value + '/';
const CHILDREN = '.t-location-children-select';
const CHILDREN_DROPDOWN = '.ember-basic-dropdown-content > .ember-power-select-options';
const PARENTS = '.t-location-parent-select';
const PARENTS_DROPDOWN = '.ember-basic-dropdown-content > .ember-power-select-options';
const PARENTS_MULTIPLE_OPTION = `.t-location-parent-select > .ember-power-select-trigger > .ember-power-select-multiple-options`;

let store, payload, list_xhr;

moduleForAcceptance('Acceptance | location-new', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${LOCATIONS_URL}?page=1`, "GET", null, {}, 201, LOCATION_FIXTURES.list());
    payload = {
      id: UUID.value,
      name: LD.storeName,
      status: LD.status,
      number: LD.storeNumber,
      location_level: LLD.idOne,
      children: [],
      parents: [],
      emails: [],
      phone_numbers: [],
      addresses: []
    };
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    payload = null;
  }
});

test('visiting /location/new', (assert) => {
  page.visit();
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_NEW_URL);
    const location = store.find('location', UUID.value);
    assert.ok(location.get('new'));
    assert.notOk(location.get('name'));
    assert.notOk(location.get('number'));
  });
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  andThen(() => {
    assert.equal(page.locationLevelInput.split(' +')[0].split(' ')[0], LLD.nameCompany);
  });
  let response = Ember.$.extend(true, {}, payload);
  xhr(LOCATIONS_URL, 'POST', JSON.stringify(payload), {}, 201, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    let location = store.find('location', UUID.value);
    assert.equal(location.get('new'), undefined);
    assert.equal(location.get('name'), LD.storeName);
    assert.equal(location.get('number'), LD.storeNumber);
    assert.equal(location.get('location_level').get('id'), LLD.idOne);
    assert.equal(location.get('location_level_fk'), LLD.idOne);
    assert.ok(location.get('isNotDirty'));
  });
});

test('validation works and when hit save, we do same post', (assert) => {
  page.visit();
  click('.t-add-new');
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(page.nameValidationErrorVisible);
    assert.notOk(page.numberValidationErrorVisible);
    assert.notOk(page.llevelValidationErrorVisible);
    assert.notOk(page.statusValidationErrorVisible);
  });
  page.nameFillIn(LD.storeName);
  page.numberFillIn(LD.storeNumber);
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(page.nameValidationErrorVisible);
    assert.notOk(page.numberValidationErrorVisible);
  });
  page.nameFillIn('');
  page.numberFillIn('');
  triggerEvent('.t-location-name', 'keyup', {keyCode: 32});
  triggerEvent('.t-location-number', 'keyup', {keyCode: 32});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 2);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.location.name'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.location.number'));
    assert.ok(page.nameValidationErrorVisible);
    assert.ok(page.numberValidationErrorVisible);
  });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
  clearxhr(list_xhr);
  page.visitNew();
  fillIn('.t-location-name', LD.storeName);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_NEW_URL);
      assert.equal(find('.t-location-name').val(), LD.storeName);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
  page.visitNew();
  fillIn('.t-location-name', LD.storeName);
  generalPage.cancel();
  let initLocationCount;
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
      let locations = store.find('location');
      initLocationCount = locations.get('length');
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
      let locations = store.find('location');
      assert.equal(locations.get('length'), initLocationCount-1);
      assert.equal(find('tr.t-grid-data').length, 10);
    });
  });
});

test('when user enters new form and doesnt enter data, only has boostrapped location(s)', (assert) => {
  page.visitNew();
  generalPage.cancel();
  andThen(() => {
    assert.equal(store.find('location').get('length'), 1);
  });
});

test('adding a new location should allow for another new location to be created after the first is persisted', (assert) => {
  let location_count;
  uuidReset();
  payload.id = 'abc123';
  patchRandomAsync(0);
  page.visit();
  click('.t-add-new');
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  xhr(LOCATIONS_URL, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    location_count = store.find('location').get('length');
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_NEW_URL);
    assert.equal(store.find('location').get('length'), location_count + 1);
    assert.equal(find('.t-location-name').val(), '');
  });
});

test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
  page.visitNew();
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  generalPage.clickAddPhoneNumber();
  andThen(() => {
    assert.equal(find('.t-add-phone-number-btn').length, 1);
  });
  selectChoose('.t-phone-number-type-select', PNTD.officeNameValue);
  var phone_numbers = PNF.put({id: PND.idOne, type: PNTD.officeId});
  page.phonenumberFillIn(PND.numberOne);
  xhr(LOCATIONS_URL, 'POST', JSON.stringify(phone_number_payload), {}, 201);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

test('when you change a related emails type it will be persisted correctly', (assert) => {
  page.visitNew();
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  page.clickAddEmail();
  andThen(() => {
    assert.equal(find('.t-add-email-btn').length, 1);
  });
  selectChoose('.t-email-type-select', ETD.workName);
  page.emailFillIn(ED.emailOne);
  xhr(LOCATIONS_URL, 'POST', JSON.stringify(email_payload), {}, 201);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

test('when you change a related address type it will be persisted correctly', (assert) => {
  page.visitNew();
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  page.clickAddAddress();
  page.addressFillIn(AD.streetOne);
  page.addressCityFill(AD.cityOne);
  page.addressPostalCodeFillIn(AD.zipOne);
  andThen(() => {
    assert.equal(page.addressAddressValue, AD.streetOne);
    assert.equal(page.addressCityValue, AD.cityOne);
    assert.equal(page.addressPostalCodeValue, AD.zipOne);
  });
  // Country
  let keyword = 'a';
  let countryListResults = CF.list_power_select();
  let countryId = countryListResults.results[0].id;
  let countryName = countryListResults.results[0].name;
  xhr(`/api/countries/tenant/?search=${keyword}`, 'GET', null, {}, 200, countryListResults);
  selectSearch('.t-address-country', keyword);
  selectChoose('.t-address-country', countryName);
  andThen(() => {
    assert.equal(page.countrySelectedOne, countryName);
  });
  // State
  keyword = 'a';
  let stateListResults = SF.list_power_select();
  let stateId = stateListResults.results[0].id;
  let stateName = stateListResults.results[0].name;
  xhr(`/api/states/tenant/?search=${keyword}`, 'GET', null, {}, 200, stateListResults);
  selectSearch('.t-address-state', keyword);
  selectChoose('.t-address-state', stateName);
  andThen(() => {
    assert.equal(page.stateSelectedOne, stateName);
  });
  address_put_payload.addresses[0].state = stateId;
  address_put_payload.addresses[0].postal_code = AD.zipOne;
  address_put_payload.addresses[0].country = countryId;
  xhr(LOCATIONS_URL, 'POST', JSON.stringify(address_put_payload), {}, 201);
  selectChoose('.t-address-type-select:eq(0)', ATD.shippingNameText);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

/*LOCATION TO CHILDREN M2M*/
test('clicking and typing into power select for location will fire off xhr request for all children locations', (assert) => {
  page.visitNew();
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${UUID.value}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.apple)]};
  ajax(location_endpoint, 'GET', null, {}, 201, response);
  selectSearch(CHILDREN, 'a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_NEW_URL);
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
  });
  page.childrenClickApple();
  andThen(() => {
    let location = store.find('location', UUID.value);
    assert.equal(location.get('children').get('length'), 1);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.apple);
    assert.equal(page.childrenSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  selectSearch(CHILDREN, '');
  andThen(() => {
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  //search specific children
  let location_endpoint_2 = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${UUID.value}/location__icontains=BooNdocks/`;
  let response_2 = {'results': [LF.get_no_related('abc123', LD.boondocks)]};
  xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
  selectSearch(CHILDREN, 'BooNdocks');
  andThen(() => {
    assert.equal(page.childrenSelected.indexOf(LD.apple), 2);
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), LD.boondocks);
    let location = store.find('location', UUID.value);
    assert.equal(location.get('children').get('length'), 1);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.apple);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.childrenClickOptionOne();
  andThen(() => {
    let location = store.find('location', UUID.value);
    assert.equal(location.get('children').get('length'), 2);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.apple);
    assert.equal(location.get('children').objectAt(1).get('name'), LD.boondocks);
    assert.equal(page.childrenSelected.indexOf(LD.apple), 2);
    assert.equal(page.childrenTwoSelected.indexOf(LD.boondocks), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  xhr(LOCATIONS_URL,'POST',JSON.stringify(children_payload),{},201);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('can add and remove all children (while not populating options) and add back', (assert) => {
  page.visitNew();
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('children').get('length'), 0);
    assert.equal(location.get('location_children_fks').length, 0);
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${UUID.value}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.apple)]};
  ajax(location_endpoint, 'GET', null, {}, 201, response);
  selectSearch(CHILDREN, 'a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_NEW_URL);
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
  });
  page.childrenClickApple();
  //search specific children
  let location_endpoint_2 = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${UUID.value}/location__icontains=BooNdocks/`;
  let response_2 = LF.list_power_select();
  response_2.results.push(LF.get('abc123', LD.boondocks));
  xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
  selectSearch(CHILDREN, 'BooNdocks');
  page.childrenClickOptionOne();
  page.childrenTwoRemove();
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.childrenOneRemove();
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('children').get('length'), 0);
  });
  selectSearch(CHILDREN, 'a');
  page.childrenClickApple();
  selectSearch(CHILDREN, 'BooNdocks');
  page.childrenClickOptionOne();
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  ajax(LOCATIONS_URL, 'POST', JSON.stringify(children_payload), {}, 201);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
  clearxhr(list_xhr);
  page.visitNew();
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  selectSearch(CHILDREN, '');
  andThen(() => {
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
});

/*PARENTS*/
test('clicking and typing into power select for location will fire off xhr request for all location', (assert) => {
  page.visitNew();
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('parents').get('length'), 0);
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${UUID.value}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.apple)]};
  ajax(location_endpoint, 'GET', null, {}, 201, response);
  selectSearch(PARENTS, 'a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_NEW_URL);
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
  });
  page.parentsClickApple();
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('parents').get('length'), 1);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.apple);
    assert.equal(page.parentsSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  selectSearch(PARENTS, '');
  andThen(() => {
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  //search specific parents
  let location_endpoint_2 = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${UUID.value}/location__icontains=BooNdocks/`;
  let response_2 = {'results': [LF.get_no_related('abc123', LD.boondocks)]};
  xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
  selectSearch(PARENTS, 'BooNdocks');
  andThen(() => {
    assert.equal(page.parentsSelected.indexOf(LD.apple), 2);
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), LD.boondocks);
    let location = store.find('location',UUID.value);
    assert.equal(location.get('parents').get('length'), 1);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.apple);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.parentsClickOptionOne();
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('parents').get('length'), 2);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.apple);
    assert.equal(location.get('parents').objectAt(1).get('name'), LD.boondocks);
    assert.equal(page.parentsSelected.indexOf(LD.apple), 2);
    assert.equal(page.parentsTwoSelected.indexOf(LD.boondocks), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  xhr(LOCATIONS_URL, 'POST', JSON.stringify(parents_payload), {}, 201, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('starting with multiple parents, can remove all parents (while not populating options) and add back', (assert) => {
  page.visitNew();
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('parents').get('length'), 0);
    assert.equal(location.get('location_parents_fks').length, 0);
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${UUID.value}/location__icontains=a/`;
  let response = { 'results': [LF.get_no_related(LD.unusedId, LD.apple)] };
  ajax(location_endpoint, 'GET', null, {}, 201, response);
  selectSearch(PARENTS, 'a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_NEW_URL);
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
  });
  page.parentsClickApple();
  //search specific parents
  let location_endpoint_2 = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${UUID.value}/location__icontains=BooNdocks/`;
  let response_2 = LF.list_power_select();
  response_2.results.push(LF.get('abc123', LD.boondocks));
  xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
  selectSearch(PARENTS, 'BooNdocks');
  page.parentsClickOptionOne();
  page.parentsTwoRemove();
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.apple), 2);
  });
  page.parentsOneRemove();
  andThen(() => {
    let location = store.find('location',UUID.value);
    assert.equal(location.get('parents').get('length'), 0);
  });
  selectSearch(PARENTS, 'a');
  page.parentsClickApple();
  selectSearch(PARENTS, 'BooNdocks');
  page.parentsClickOptionOne();
  fillIn('.t-location-name', LD.storeName);
  fillIn('.t-location-number', LD.storeNumber);
  ajax(LOCATIONS_URL, 'POST', JSON.stringify(parents_payload), {}, 201);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
  clearxhr(list_xhr);
  page.visitNew();
  selectChoose('.t-location-level-select', LLD.nameCompany);
  selectChoose('.t-location-status-select', LDS.openNameTranslated);
  selectSearch(PARENTS, '');
  andThen(() => {
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
});
