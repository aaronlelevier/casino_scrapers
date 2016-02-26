import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
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
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location';
import random from 'bsrs-ember/models/random';
import {parents_payload, children_payload, email_payload, phone_number_payload, address_put_payload, new_put_payload} from 'bsrs-ember/tests/helpers/payloads/location';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_URL + '/index';
const LOCATION_NEW_URL = BASE_URL + '/new/1';
const DJANGO_LOCATION_URL = PREFIX + '/admin/locations/';
const DETAIL_URL = BASE_URL + '/' +UUID.value;
const DJANGO_LOCATION_NEW_URL = PREFIX + DJANGO_LOCATION_URL +UUID.value + '/';
const CHILDREN = '.t-location-children-select > .ember-basic-dropdown-trigger';
const CHILDREN_DROPDOWN = '.t-location-children-select-dropdown > .ember-power-select-options';
const CHILDREN_SEARCH = '.t-location-children-select-trigger > .ember-power-select-trigger-multiple-input';
const PARENTS = '.t-location-parent-select > .ember-basic-dropdown-trigger';
const PARENTS_DROPDOWN = '.t-location-parent-select-dropdown > .ember-power-select-options';
const PARENTS_SEARCH = '.t-location-parent-select-trigger > .ember-power-select-trigger-multiple-input';
const PARENTS_MULTIPLE_OPTION = '.t-location-parent-select-trigger > .ember-power-select-multiple-option';

let application, store, payload, list_xhr, original_uuid;

module('Acceptance | location-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(DJANGO_LOCATION_URL + '?page=1', "GET", null, {}, 201, LOCATION_FIXTURES.empty());
        payload = {
            id: UUID.value,
            name: LD.storeName,
            number: LD.storeNumber,
            location_level: LLD.idOne,
            children: [],
            parents: [],
            emails: [],
            phone_numbers: [],
            addresses: []
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

test('visiting /location/new', (assert) => {
    visit(LOCATION_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.equal(store.find('location').get('length'), 1);
        const location = store.find('location', UUID.value);
        assert.ok(location.get('new'));
        assert.notOk(location.get('name'));
        assert.notOk(location.get('number'));
    });
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        assert.equal(page.locationLevelInput().split(' +')[0].split(' ')[0], LLD.nameCompany);
    });
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 201, response);
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
    visit(LOCATION_URL);
    click('.t-add-new');
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-number-validation-error').is(':visible'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    fillIn('.t-location-name', LD.storeName);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':visible'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    fillIn('.t-location-number', LD.storeNumber);
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':visible'));
    });
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-number-validation-error').is(':hidden'));
        assert.ok(find('.t-location-level-validation-error').is(':hidden'));
    });
    let response = Ember.$.extend(true, {}, payload);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 201, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(list_xhr);
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-location-name').val(), LD.storeName);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_URL);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 0);
            assert.equal(find('tr.t-grid-data').length, 0);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    page.visitNew();
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('location').get('length'), 0);
    });
});

test('adding a new location should allow for another new location to be created after the first is persisted', (assert) => {
    let location_count;
    random.uuid = original_uuid;
    payload.id = 'abc123';
    patchRandomAsync(0);
    visit(LOCATION_URL);
    click('.t-add-new');
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
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

/* PHONE NUMBER AND ADDRESS */
test('newly added phone numbers without a valid number are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    page.visitNew();
    click('.t-add-btn:eq(0)');
    andThen(() => {
        assert.equal(store.find('phonenumber').get('length'), 1);
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-new-entry:eq(0)', '');
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('phonenumber').get('length'), 0);
    });
});

test('newly added email without a valid email are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    page.visitNew();
    click('.t-add-email-btn:eq(0)');
    andThen(() => {
        assert.equal(store.find('email').get('length'), 1);
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-new-entry:eq(0)', '');
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('email').get('length'), 0);
    });
});

test('newly added addresses without a valid name are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    page.visitNew();
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        assert.equal(store.find('address').get('length'), 1);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-address-address:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-address-address:eq(0)', '');
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('address').get('length'), 0);
    });
});

test('phone numbers without a valid number are ignored and removed on save', (assert) => {
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    click('.t-add-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-phone-validation-format-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_ph);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(store.find('phonenumber').get('length'), 1);
    });
    fillIn('.t-new-entry:eq(0)', '');
    var response = LF.detail(LD.idOne);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(new_put_payload), {}, 201, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('phonenumber').get('length'), 0);
    });
});

test('emails without a valid email are ignored and removed on save', (assert) => {
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    click('.t-add-email-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-email-validation-format-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_email);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(store.find('email').get('length'), 1);
    });
    fillIn('.t-new-entry:eq(0)', '');
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(new_put_payload), {}, 201, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('email').get('length'), 0);
    });
});

test('newly added addresses without a valid name are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    page.visitNew();
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        assert.equal(store.find('address').get('length'), 1);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-address-address:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-address-address:eq(0)', '');
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('address').get('length'), 0);
    });
});

test('address without a valid address or zip code are ignored and removed on save', (assert) => {
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
        assert.equal(visible_zip_errors.length, 0);
    });
    fillIn('.t-address-address:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-address-validation-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_street);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(visible_zip_errors.length, 0);
        assert.equal(store.find('address').get('length'), 1);
    });
    fillIn('.t-address-address:eq(0)', '');
    fillIn('.t-address-postal-code:eq(0)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-address-zip-validation-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_zip);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(visible_zip_errors.length, 1);
        assert.equal(store.find('address').get('length'), 1);
    });
    fillIn('.t-address-postal-code:eq(0)', '');
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(new_put_payload), {}, 201, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('address').get('length'), 0);
    });
});

test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    var phone_numbers = PNF.put({id: PND.idOne, type: PNTD.officeId});
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry:eq(0)', PND.numberOne);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(phone_number_payload), {}, 201);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
    });
});

test('when you change a related emails type it will be persisted correctly', (assert) => {
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    click('.t-add-email-btn:eq(0)');
    fillIn('.t-new-entry:eq(0)', ED.emailOne);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(email_payload), {}, 201);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
    });
});

test('when you change a related address type it will be persisted correctly', (assert) => {
    page.visitNew();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    click('.t-add-address-btn:eq(0)');
    fillIn('.t-address-address:eq(0)', '34 2nd St');
    xhr(DJANGO_LOCATION_URL,'POST',JSON.stringify(address_put_payload),{},201);
    fillIn('.t-address-type:eq(0)', ATD.shippingId);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
    });
});

/*LOCATION TO CHILDREN M2M*/
test('clicking and typing into power select for location will fire off xhr request for all children locations', (assert) => {
    page.visitNew();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    let location_endpoint = `${PREFIX}/admin/locations/get-level-children/${LLD.idOne}/${UUID.value}/?name__icontains=a`;
    let response = LF.search();
    response.results.push(LF.get(LD.unusedId, LD.apple));
    ajax(location_endpoint, 'GET', null, {}, 201, response);
    page.childrenClickDropdown();
    fillIn(`${CHILDREN_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.equal(page.childrenOptionLength(), 1);
        assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
    });
    page.childrenClickApple();
    andThen(() => {
        let location = store.find('location', UUID.value);
        assert.equal(location.get('children').get('length'), 1);
        assert.equal(location.get('children').objectAt(0).get('name'), LD.apple);
        assert.equal(page.childrenSelected().indexOf(LD.apple), 2);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    page.childrenClickDropdown();
    fillIn(`${CHILDREN_SEARCH}`, '');
    andThen(() => {
        assert.equal(page.childrenOptionLength(), 1);
        assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
    });
    //search specific children
    page.childrenClickDropdown();
    let location_endpoint_2 = `${PREFIX}/admin/locations/get-level-children/${LLD.idOne}/${UUID.value}/?name__icontains=BooNdocks`;
    let response_2 = LF.list();
    response_2.results.push(LF.get('abc123', LD.boondocks));
    xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
    fillIn(`${CHILDREN_SEARCH}`, 'BooNdocks');
    andThen(() => {
        assert.equal(page.childrenSelected().indexOf(LD.apple), 2);
        assert.equal(page.childrenOptionLength(), 1);
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
        assert.equal(page.childrenSelected().indexOf(LD.apple), 2);
        assert.equal(page.childrenTwoSelected().indexOf(LD.boondocks), 2);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    xhr(DJANGO_LOCATION_URL,'POST',JSON.stringify(children_payload),{},201);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('can add and remove all children (while not populating options) and add back', (assert) => {
    page.visitNew();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        let location = store.find('location',UUID.value);
        assert.equal(location.get('children').get('length'), 0);
        assert.equal(location.get('location_children_fks').length, 0);
    });
    let location_endpoint = `${PREFIX}/admin/locations/get-level-children/${LLD.idOne}/${UUID.value}/?name__icontains=a`;
    let response = LF.search();
    response.results.push(LF.get(LD.unusedId, LD.apple));
    ajax(location_endpoint, 'GET', null, {}, 201, response);
    page.childrenClickDropdown();
    fillIn(`${CHILDREN_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.equal(page.childrenOptionLength(), 1);
        assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
    });
    page.childrenClickApple();
    //search specific children
    page.childrenClickDropdown();
    let location_endpoint_2 = `${PREFIX}/admin/locations/get-level-children/${LLD.idOne}/${UUID.value}/?name__icontains=BooNdocks`;
    let response_2 = LF.list();
    response_2.results.push(LF.get('abc123', LD.boondocks));
    xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
    fillIn(`${CHILDREN_SEARCH}`, 'BooNdocks');
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
    page.childrenClickDropdown();
    fillIn(`${CHILDREN_SEARCH}`, 'a');
    page.childrenClickApple();
    fillIn(`${CHILDREN_SEARCH}`, 'BooNdocks');
    page.childrenClickOptionOne();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    ajax(DJANGO_LOCATION_URL, 'POST', JSON.stringify(children_payload), {}, 201);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
    clearxhr(list_xhr);
    page.visitNew();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    page.childrenClickDropdown();
    fillIn(`${CHILDREN_SEARCH}`, ' ');
    andThen(() => {
        assert.equal(page.childrenOptionLength(), 1);
        assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.no_results);
    });
});

/*PARENTS*/
test('clicking and typing into power select for location will fire off xhr request for all location', (assert) => {
    page.visitNew();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        let location = store.find('location',UUID.value);
        assert.equal(location.get('parents').get('length'), 0);
    });
    let location_endpoint = `${PREFIX}/admin/locations/get-level-parents/${LLD.idOne}/${UUID.value}/?name__icontains=a`;
    let response = LF.search();
    response.results.push(LF.get(LD.unusedId, LD.apple));
    xhr(location_endpoint, 'GET', null, {}, 201, response);
    page.parentsClickDropdown();
    fillIn(`${PARENTS_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.equal(page.parentsOptionLength(), 1);
        assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
    });
    page.parentsClickApple();
    andThen(() => {
        let location = store.find('location',UUID.value);
        assert.equal(location.get('parents').get('length'), 1);
        assert.equal(location.get('parents').objectAt(0).get('name'), LD.apple);
        assert.equal(page.parentsSelected().indexOf(LD.apple), 2);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    page.parentsClickDropdown();
    fillIn(`${PARENTS_SEARCH}`, '');
    andThen(() => {
        assert.equal(page.parentsOptionLength(), 1);
        assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
    });
    //search specific parents
    page.parentsClickDropdown();
    let location_endpoint_2 = `${PREFIX}/admin/locations/get-level-parents/${LLD.idOne}/${UUID.value}/?name__icontains=BooNdocks`;
    let response_2 = LF.list();
    response_2.results.push(LF.get('abc123', LD.boondocks));
    xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
    fillIn(`${PARENTS_SEARCH}`, 'BooNdocks');
    andThen(() => {
        assert.equal(page.parentsSelected().indexOf(LD.apple), 2);
        assert.equal(page.parentsOptionLength(), 1);
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
        assert.equal(page.parentsSelected().indexOf(LD.apple), 2);
        assert.equal(page.parentsTwoSelected().indexOf(LD.boondocks), 2);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    xhr(DJANGO_LOCATION_URL, 'POST', JSON.stringify(parents_payload), {}, 201, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('starting with multiple parents, can remove all parents (while not populating options) and add back', (assert) => {
    page.visitNew();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        let location = store.find('location',UUID.value);
        assert.equal(location.get('parents').get('length'), 0);
        assert.equal(location.get('location_parents_fks').length, 0);
    });
    let location_endpoint = `${PREFIX}/admin/locations/get-level-parents/${LLD.idOne}/${UUID.value}/?name__icontains=a`;
    let response = LF.search();
    response.results.push(LF.get(LD.unusedId, LD.apple));
    ajax(location_endpoint, 'GET', null, {}, 201, response);
    page.parentsClickDropdown();
    fillIn(`${PARENTS_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_NEW_URL);
        assert.equal(page.parentsOptionLength(), 1);
        assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), LD.apple);
    });
    page.parentsClickApple();
    //search specific parents
    page.parentsClickDropdown();
    let location_endpoint_2 = `${PREFIX}/admin/locations/get-level-parents/${LLD.idOne}/${UUID.value}/?name__icontains=BooNdocks`;
    let response_2 = LF.list();
    response_2.results.push(LF.get('abc123', LD.boondocks));
    xhr(location_endpoint_2, 'GET', null, {}, 201, response_2);
    fillIn(`${PARENTS_SEARCH}`, 'BooNdocks');
    page.parentsClickOptionOne();
    page.parentsTwoRemove();
    andThen(() => {
        let location = store.find('location',UUID.value);
        assert.equal(location.get('parents').get('length'), 1);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
        assert.equal(page.parentsSelected().indexOf(LD.apple), 2);
    });
    page.parentsOneRemove();
    andThen(() => {
        let location = store.find('location',UUID.value);
        assert.equal(location.get('parents').get('length'), 0);
    });
    page.parentsClickDropdown();
    fillIn(`${PARENTS_SEARCH}`, 'a');
    page.parentsClickApple();
    fillIn(`${PARENTS_SEARCH}`, 'BooNdocks');
    page.parentsClickOptionOne();
    fillIn('.t-location-name', LD.storeName);
    fillIn('.t-location-number', LD.storeNumber);
    ajax(DJANGO_LOCATION_URL, 'POST', JSON.stringify(parents_payload), {}, 201);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
    clearxhr(list_xhr);
    page.visitNew();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    page.parentsClickDropdown();
    fillIn(`${PARENTS_SEARCH}`, ' ');
    andThen(() => {
        assert.equal(page.parentsOptionLength(), 1);
        assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.no_results);
    });
});
