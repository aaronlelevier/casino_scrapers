import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/status';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_DEFAULTS_PUT from 'bsrs-ember/vendor/defaults/person-put';
import PERSON_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
import PHONE_NUMBER_FIXTURES from 'bsrs-ember/vendor/phone_number_fixtures';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';
import PHONE_NUMBER_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import ADDRESS_FIXTURES from 'bsrs-ember/vendor/address_fixtures';
import ADDRESS_DEFAULTS from 'bsrs-ember/vendor/defaults/address';
import ADDRESS_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const BASE_LOCATION_URL = BASEURLS.base_locations_url;
const PEOPLE_URL = BASE_PEOPLE_URL + '/index';
const DETAIL_URL = BASE_PEOPLE_URL + '/' + PEOPLE_DEFAULTS.id;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const LETTER_A = {keyCode: 65};
const BACKSPACE = {keyCode: 8};

var application, store, list_xhr, people_detail_data, endpoint, detail_xhr;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_PEOPLE_URL + '/';
        var people_list_data = PEOPLE_FIXTURES.list();
        people_detail_data = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
        detail_xhr = xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking a persons name will redirect to the given detail view', (assert) => {
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
    click('.t-grid-data:eq(1)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('when you deep link to the person detail view you get bound attrs', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(find('.t-person-username').val(), PEOPLE_DEFAULTS.username);
        assert.equal(find('.t-person-first-name').val(), PEOPLE_DEFAULTS.first_name);
        assert.equal(find('.t-person-middle-initial').val(), PEOPLE_DEFAULTS.middle_initial);
        assert.equal(find('.t-person-last-name').val(), PEOPLE_DEFAULTS.last_name);
        assert.equal(find('.t-person-title').val(), PEOPLE_DEFAULTS.title);
        assert.equal(find('.t-person-employee_id').val(), PEOPLE_DEFAULTS.employee_id);
        assert.equal(find('.t-input-multi-phone').find('select:eq(0)').val(), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
        assert.equal(find('.t-input-multi-phone').find('select:eq(1)').val(), PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
        assert.equal(find('.t-input-multi-phone').find('select:eq(0) option:selected').text(), t(PHONE_NUMBER_TYPES_DEFAULTS.officeName));
        assert.equal(find('.t-input-multi-phone').find('select:eq(1) option:selected').text(), t(PHONE_NUMBER_TYPES_DEFAULTS.mobileName));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
        assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), PHONE_NUMBER_DEFAULTS.numberOne);
        assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), PHONE_NUMBER_DEFAULTS.numberTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group').length, 2);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type').val(), ADDRESS_TYPES_DEFAULTS.officeId);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type option:selected').text(), t(ADDRESS_TYPES_DEFAULTS.officeName));
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-address').val(), ADDRESS_DEFAULTS.streetOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city').val(), ADDRESS_DEFAULTS.cityOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-state').val(), ADDRESS_DEFAULTS.stateTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code').val(), ADDRESS_DEFAULTS.zipOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').val(), ADDRESS_DEFAULTS.countryOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type').val(), ADDRESS_TYPES_DEFAULTS.shippingId);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type option:selected').text(), t(ADDRESS_TYPES_DEFAULTS.shippingName));
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-address').val(), ADDRESS_DEFAULTS.streetTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city').val(), ADDRESS_DEFAULTS.cityTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-state').val(), ADDRESS_DEFAULTS.stateTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code').val(), ADDRESS_DEFAULTS.zipTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').val(), ADDRESS_DEFAULTS.countryTwo);
        assert.equal(find('.t-statuses-select').find('.t-status-option:eq(0)').val(), STATUS_DEFAULTS.activeId);
        assert.equal(find('.t-statuses-select').find('.t-status-option:eq(1)').val(), STATUS_DEFAULTS.inactiveId);
        assert.equal(find('.t-statuses-select').find('.t-status-option:eq(2)').val(), STATUS_DEFAULTS.expiredId);
        assert.equal(find('.t-locale-select').find('.t-locale-option:eq(0)').val(), "");
        assert.equal(find('.t-locale-select').find('.t-locale-option:eq(1)').val(), "en");
        assert.equal(find('.t-locale-select').find('.t-locale-option:eq(2)').val(), "es");
        assert.equal(find(".t-locale-select option:selected").val(), PEOPLE_DEFAULTS.locale);
        assert.equal(find('.t-person-role-select option:eq(0)').val(), 'Select One');
        assert.equal(find('.t-person-role-select option:eq(1)').val(), ROLE_DEFAULTS.idOne);
        assert.equal(find('.t-person-role-select option:eq(2)').val(), ROLE_DEFAULTS.idTwo);
        assert.equal(find(".t-person-role-select option:selected").val(), ROLE_DEFAULTS.idOne);
        assert.equal(find('.t-amount').val(), PEOPLE_DEFAULTS.auth_amount);
        assert.equal(find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol);
    });
    var url = PREFIX + DETAIL_URL + '/';
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, username: PEOPLE_DEFAULTS_PUT.username, first_name: PEOPLE_DEFAULTS_PUT.first_name,
                                      middle_initial: PEOPLE_DEFAULTS_PUT.middle_initial, last_name: PEOPLE_DEFAULTS_PUT.last_name, title: PEOPLE_DEFAULTS_PUT.title,
    employee_id: PEOPLE_DEFAULTS_PUT.employee_id, auth_amount: PEOPLE_DEFAULTS_PUT.auth_amount, locale: PEOPLE_DEFAULTS.locale_id });
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-person-username', PEOPLE_DEFAULTS_PUT.username);
    fillIn('.t-person-first-name', PEOPLE_DEFAULTS_PUT.first_name);
    fillIn('.t-person-middle-initial', PEOPLE_DEFAULTS_PUT.middle_initial );
    fillIn('.t-person-last-name', PEOPLE_DEFAULTS_PUT.last_name);
    fillIn('.t-person-title', PEOPLE_DEFAULTS_PUT.title);
    fillIn('.t-person-employee_id', PEOPLE_DEFAULTS_PUT.employee_id);
    fillIn('.t-amount', PEOPLE_DEFAULTS_PUT.auth_amount);
    fillIn('.t-locale-select', PEOPLE_DEFAULTS_PUT.locale);
    andThen(() => {
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isDirty'));
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    click(SAVE_BTN);
    andThen(() => {
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('person').get('length'), 11);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when editing username to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-person-username', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-username-validation-error').text().trim(), 'invalid username');
    });
    fillIn('.t-person-username', PEOPLE_DEFAULTS_PUT.username);
    var url = PREFIX + DETAIL_URL + '/';
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, username: PEOPLE_DEFAULTS_PUT.username});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('newly added phone numbers without a valid number are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-btn:eq(0)');
    andThen(() => {
        assert.equal(store.find('phonenumber').get('length'), 3);
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(2)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-new-entry:eq(2)', '');
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('newly added addresses without a valid name are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        assert.equal(store.find('address').get('length'), 3);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-address-address:eq(2)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-address-address:eq(2)', '');
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('address').get('length'), 3);
    });
});

test('phone numbers without a valid number are ignored and removed on save', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(2)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-phone-validation-format-error:not(:hidden):eq(0)').text().trim(), 'invalid phone number');
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(store.find('phonenumber').get('length'), 3);
    });
    fillIn('.t-new-entry:eq(2)', '');
    var url = PREFIX + DETAIL_URL + "/";
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('phonenumber').get('length'), 2);
    });
});

test('address without a valid address or zip code are ignored and removed on save', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
        assert.equal(visible_zip_errors.length, 0);
    });
    fillIn('.t-address-address:eq(2)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-address-validation-error:not(:hidden):eq(0)').text().trim(), 'invalid address');
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(visible_zip_errors.length, 0);
        assert.equal(store.find('address').get('length'), 3);
    });
    fillIn('.t-address-address:eq(2)', '');
    fillIn('.t-address-postal-code:eq(2)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-address-zip-validation-error:not(:hidden):eq(0)').text().trim(), 'invalid postal code');
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(visible_zip_errors.length, 1);
        assert.equal(store.find('address').get('length'), 3);
    });
    fillIn('.t-address-postal-code:eq(2)', '');
    var url = PREFIX + DETAIL_URL + "/";
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('address').get('length'), 2);
    });
});

test('when editing phone numbers and addresses to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-person-username', '');
    click('.t-add-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(2)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-phone-validation-format-error:not(:hidden):eq(0)').text().trim(), 'invalid phone number');
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-phone-validation-format-error:not(:hidden):eq(0)').text().trim(), 'invalid phone number');
    });
    fillIn('.t-new-entry:eq(2)', '515-222-3333');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    fillIn('.t-address-address:eq(2)', ADDRESS_DEFAULTS.streetThree);
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-address-address:eq(2)', '');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-address-address:eq(2)', ADDRESS_DEFAULTS.streetThree);
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        let visible_address_errors = find('.t-input-multi-address-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
        assert.equal(visible_address_errors.length, 0);
    });
    fillIn('.t-address-postal-code:eq(2)', ADDRESS_DEFAULTS.zipOne);
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-address-postal-code:eq(2)', '');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-address-postal-code:eq(2)', ADDRESS_DEFAULTS.zipOne);
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-username-validation-error:not(:hidden)').length, 1);
    });
    var url = PREFIX + DETAIL_URL + "/";
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id});
    payload.phone_numbers.push({id: 'abc123', number: '515-222-3333', type: PHONE_NUMBER_TYPES_DEFAULTS.officeId});
    payload.addresses.push({id: 'abc123', type: ADDRESS_TYPES_DEFAULTS.officeId, address: ADDRESS_DEFAULTS.streetThree, postal_code: ADDRESS_DEFAULTS.zipOne});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-person-username', PEOPLE_DEFAULTS.username);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
    click('.t-grid-data:eq(1)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var url = PREFIX + DETAIL_URL + "/";
    var phone_numbers = PHONE_NUMBER_FIXTURES.put({id: PHONE_NUMBER_DEFAULTS.idOne, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileId});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, phone_numbers: phone_numbers});
    fillIn('.t-multi-phone-type:eq(0)', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when you change a related address type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var url = PREFIX + DETAIL_URL + "/";
    var addresses = ADDRESS_FIXTURES.put({id: ADDRESS_DEFAULTS.idOne, type: ADDRESS_TYPES_DEFAULTS.shippingId});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, addresses: addresses});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    fillIn('.t-address-type:eq(0)', ADDRESS_TYPES_DEFAULTS.shippingId);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when you change a related role it will be persisted correctly', (assert) => {
    let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idTwo;
    xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
    visit(DETAIL_URL);
    andThen(() => {
        clearxhr(detail_xhr);
        //refreshModel will call findById in people repo
        let people_detail_data_two = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
        people_detail_data_two.role = ROLE_DEFAULTS.idTwo;
        xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        andThen(() => {
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('role_fk'), ROLE_DEFAULTS.idOne);
            assert.equal(person.get('locations').get('length'), 1);
            assert.equal(person.get('locations').objectAt(0).get('id'), LOCATION_DEFAULTS.idOne);
        });
        fillIn('.t-person-role-select', ROLE_DEFAULTS.idTwo);
        andThen(() => {
            assert.equal(currentURL(), DETAIL_URL + '?role_change=' + ROLE_DEFAULTS.idTwo);
        });
        var url = PREFIX + DETAIL_URL + "/";
        var role = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: [PEOPLE_DEFAULTS.id]});
        var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, role: role.id});
        payload.locations = [];
        xhr(url,'PUT',JSON.stringify(payload),{},200);
        click(SAVE_BTN);
        andThen(() => {
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('role_fk'), ROLE_DEFAULTS.idTwo);
            assert.equal(person.get('locations').get('length'), 0);
            assert.equal(currentURL(), PEOPLE_URL);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-person-username', PEOPLE_DEFAULTS_PUT.username);
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
            assert.equal(find('.t-person-username').val(), PEOPLE_DEFAULTS_PUT.username);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-person-username', PEOPLE_DEFAULTS_PUT.username);
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('username'), PEOPLE_DEFAULTS.username);
        });
    });
});

test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-multi-phone-type:eq(0)', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            var phone_numbers = store.find('phonenumber', PEOPLE_DEFAULTS.id);
            assert.equal(phone_numbers.source[0].get('type'), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
        });
    });
});

test('when user changes an attribute on address and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-address-type:eq(0)', ADDRESS_TYPES_DEFAULTS.shippingId);
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            var addresses = store.find('address', PEOPLE_DEFAULTS.id);
            assert.equal(addresses.source[0].get('type'), ADDRESS_TYPES_DEFAULTS.officeId);
        });
    });
});

test('when user removes a phone number clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    click('.t-del-btn:eq(0)');
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            var phone_numbers = store.find('phonenumber', PEOPLE_DEFAULTS.id);
            assert.equal(phone_numbers.source[0].get('type'), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
        });
    });
});

test('when user removes an address clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    click('.t-del-address-btn:eq(0)');
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            var addresses = store.find('address', PEOPLE_DEFAULTS.id);
            assert.equal(addresses.source[0].get('type'), ADDRESS_TYPES_DEFAULTS.officeId);
        });
    });
});

test('currency helper displays correct currency format', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    var symbol = '$';
    andThen(() => {
        assert.equal(find('.t-amount').val(), PEOPLE_DEFAULTS.auth_amount);
    });
});

test('when click delete, person is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_PEOPLE_URL + '/' + PEOPLE_DEFAULTS.id + '/', 'DELETE', null, {}, 204, {});
    click('.t-delete-btn');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when you deep link to the person detail view you can add a new phone number', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry:eq(2)', PHONE_NUMBER_DEFAULTS.numberThree);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-phone').find('input').length, 3);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var phone_numbers = PHONE_NUMBER_FIXTURES.put();
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    phone_numbers.push({id: UUID.value, number: PHONE_NUMBER_DEFAULTS.numberThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can add a new address', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-add-address-btn:eq(0)');
    fillIn('.t-address-address:eq(2)', ADDRESS_DEFAULTS.streetThree);
    andThen(() => {
        assert.equal(find('.t-input-multi-address').find('input').length, 6);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var addresses = ADDRESS_FIXTURES.put();
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    addresses.push({id: UUID.value, type: ADDRESS_TYPES_DEFAULTS.officeId, address: ADDRESS_DEFAULTS.streetThree});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can remove a new phone number', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-del-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-phone').find('input').length, 1);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var phone_numbers = PHONE_NUMBER_FIXTURES.put();
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, phone_numbers: [phone_numbers[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can remove a new address', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-del-address-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-address').find('input').length, 2);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var addresses = ADDRESS_FIXTURES.put();
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, addresses: [addresses[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and remove a new phone number', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-add-btn:eq(0)');
    click('.t-del-btn:eq(2)');
    andThen(() => {
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and remove a new address', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-add-address-btn:eq(0)');
    click('.t-del-address-btn:eq(2)');
    andThen(() => {
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can change the phone number type and add a new phone number', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-input-multi-phone select:eq(0)', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry:eq(2)', PHONE_NUMBER_DEFAULTS.numberThree);
    var phone_numbers = PHONE_NUMBER_FIXTURES.put();
    phone_numbers[0].type = PHONE_NUMBER_TYPES_DEFAULTS.mobileId;
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    phone_numbers.push({id: UUID.value, number: PHONE_NUMBER_DEFAULTS.numberThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('phone_numbers').objectAt(0).get('type'), PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
        assert.equal(person.get('phone_numbers').objectAt(2).get('type'), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
        assert.ok(person.get('phone_numbers').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can change the address type and can add new address with default type', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-input-multi-address .t-address-group:eq(0) select:eq(0)', ADDRESS_TYPES_DEFAULTS.shippingId);
    click('.t-add-address-btn:eq(0)');
    fillIn('.t-address-address:eq(2)', ADDRESS_DEFAULTS.streetThree);
    var addresses = ADDRESS_FIXTURES.put();
    addresses[0].type = ADDRESS_TYPES_DEFAULTS.shippingId;
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    addresses.push({id: UUID.value, type: ADDRESS_TYPES_DEFAULTS.officeId, address: ADDRESS_DEFAULTS.streetThree});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('addresses').objectAt(0).get('type'), ADDRESS_TYPES_DEFAULTS.shippingId);
        assert.equal(person.get('addresses').objectAt(2).get('type'), ADDRESS_TYPES_DEFAULTS.officeId);
        assert.ok(person.get('addresses').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and save a new phone number with validation', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    var phone_numbers = PHONE_NUMBER_FIXTURES.put();
    phone_numbers[0].type = PHONE_NUMBER_TYPES_DEFAULTS.mobileId;
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    phone_numbers.push({id: UUID.value, number: PHONE_NUMBER_DEFAULTS.numberThree, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-input-multi-phone select:eq(0)', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    fillIn('.t-new-entry:eq(2)', PHONE_NUMBER_DEFAULTS.numberThree);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('phone_numbers').objectAt(0).get('type'), PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
        assert.equal(person.get('phone_numbers').objectAt(2).get('type'), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
        assert.ok(person.get('phone_numbers').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and save a new address with validation', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    var addresses = ADDRESS_FIXTURES.put();
    addresses[0].type = ADDRESS_TYPES_DEFAULTS.shippingId;
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    addresses.push({id: UUID.value, type: ADDRESS_TYPES_DEFAULTS.officeId, address: ADDRESS_DEFAULTS.streetThree});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-input-multi-address select:eq(0)', ADDRESS_TYPES_DEFAULTS.shippingId);
    fillIn('.t-address-address:eq(2)', ADDRESS_DEFAULTS.streetThree);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('addresses').objectAt(0).get('type'), ADDRESS_TYPES_DEFAULTS.shippingId);
        assert.equal(person.get('addresses').objectAt(2).get('type'), ADDRESS_TYPES_DEFAULTS.officeId);
        assert.ok(person.get('addresses').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can alter the role and rolling back will reset it', (assert) => {
    let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idTwo;
    xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
    visit(DETAIL_URL);
    andThen(() => {
        clearxhr(detail_xhr);
        //refreshModel will call findById in people repo
        let people_detail_data_two = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
        people_detail_data_two.role = ROLE_DEFAULTS.idTwo;
        xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        andThen(() => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
            assert.equal(find('.t-person-role-select option:selected').val(), ROLE_DEFAULTS.idOne);
            assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
        });
        fillIn('.t-person-role-select', ROLE_DEFAULTS.idTwo);
        andThen(() => {
            assert.equal(currentURL(), DETAIL_URL + '?role_change=' + ROLE_DEFAULTS.idTwo);
            assert.equal(find('.t-person-role-select option:selected').val(), ROLE_DEFAULTS.idTwo);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.ok(person.get('isDirtyOrRelatedDirty'));
            assert.equal(person.get('role.id'), ROLE_DEFAULTS.idTwo);
        });
        click('.t-cancel-btn');
        andThen(() => {
            waitFor(() => {
                assert.equal(currentURL(), DETAIL_URL + '?role_change=' + ROLE_DEFAULTS.idTwo);
                assert.equal(find('.t-modal').is(':visible'), true);
            });
        });
        click('.t-modal-footer .t-modal-rollback-btn');
        andThen(() => {
            waitFor(() => {
                assert.equal(currentURL(), PEOPLE_URL);
                var person = store.find('person', PEOPLE_DEFAULTS.id);
                assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
                var actual_role = store.find('role', ROLE_DEFAULTS.idOne);
                assert.ok(actual_role.get('isNotDirty'));
                assert.ok(person.get('isNotDirty'));
                assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
                var previous_role = store.find('role', ROLE_DEFAULTS.idTwo);
                assert.ok(Ember.$.inArray(person.get('id'), previous_role.get('people')) === -1);
                assert.ok(previous_role.get('isNotDirty'));
            });
        });
    });
});

test('when you deep link to the person detail view you can alter the role and change it back without dirtying the person model', (assert) => {
    let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idTwo;
    let first_location_xhr = xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
    visit(DETAIL_URL);
    andThen(() => {
        clearxhr(detail_xhr);
        //refreshModel will call findById in people repo
        let people_detail_data_two = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
        people_detail_data_two.role = ROLE_DEFAULTS.idTwo;
        let first_role_change = xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        andThen(() => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
            assert.equal(find('.t-person-role-select option:selected').val(), ROLE_DEFAULTS.idOne);
            assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
        });
        fillIn('.t-person-role-select', ROLE_DEFAULTS.idTwo);
        andThen(() => {
            assert.equal(currentURL(), DETAIL_URL + '?role_change=' + ROLE_DEFAULTS.idTwo);
            assert.equal(find('.t-person-role-select option:selected').val(), ROLE_DEFAULTS.idTwo);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.ok(person.get('isDirtyOrRelatedDirty'));
            assert.equal(person.get('role.id'), ROLE_DEFAULTS.idTwo);
        });
        andThen(() => {
            clearxhr(first_role_change);
            clearxhr(first_location_xhr);
            let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idOne;
            xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
            let people_detail_data_three = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
            people_detail_data_three.role = ROLE_DEFAULTS.idOne;
            xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data_three);
            fillIn('.t-person-role-select', ROLE_DEFAULTS.idOne);
            andThen(() => {
                assert.equal(currentURL(), DETAIL_URL + '?role_change=' + ROLE_DEFAULTS.idOne);
                assert.equal(find('.t-person-role-select option:selected').val(), ROLE_DEFAULTS.idOne);
                var person = store.find('person', PEOPLE_DEFAULTS.id);
                assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
                assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
            });
        });
        click('.t-cancel-btn');
        andThen(() => {
            assert.equal(currentURL(), PEOPLE_URL);
        });
    });
});

test('when changing the locale for a user (not current user), the language is not updated on the site', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.ok(person.get('id') !== PERSON_CURRENT_DEFAULTS.id);
        assert.equal(find('.t-person-first-name').val(), PEOPLE_DEFAULTS.first_name);
        assert.equal(find('.t-locale-select option:selected').val(), PEOPLE_DEFAULTS.locale);
        assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
        fillIn('.t-locale-select', PEOPLE_DEFAULTS.locale2);
        andThen(() => {
            assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
        });
    });
});

test('when you deep link to the person detail view you can add and save a location', (assert) => {
    clearxhr(detail_xhr);
    visit(DETAIL_URL);
    people_detail_data = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    people_detail_data.locations = [];
    xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data);
    let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idOne + '&name__icontains=a';
    xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, locations: [LOCATION_DEFAULTS.idOne]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    andThen(() => {
        let person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(person.get('locations').get('length'), 0);
        let person_location = store.find('person-location', {person_pk: PEOPLE_DEFAULTS.id});
        assert.equal(person_location.get('length'), 0);
    });
    fillIn('.selectize-input input', 'a');
    triggerEvent('.selectize-input input', 'keyup', LETTER_A);
    click('.t-person-locations-select div.option:eq(0)');
    andThen(() => {
        //selectize updates passed array proxy immediately.
        let person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(person.get('locations').get('length'), 1);
        //add_locations method
        let person_location = store.find('person-location', {person_pk: PEOPLE_DEFAULTS.id});
        assert.equal(person_location.get('length'), 1);
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        let person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(person.get('locations').get('length'), 1);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(person.get('locations').objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    });
});

test('when you deep link to the person detail view you can remove a location', (assert) => {
    clearxhr(detail_xhr);
    visit(DETAIL_URL);
    people_detail_data = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data);
    andThen(() => {
        let person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(person.get('locations').get('length'), 1);
        let person_location = store.find('person-location', {person_pk: PEOPLE_DEFAULTS.id});
        assert.equal(person_location.get('length'), 1);
    });
    click('div.item > a.remove:eq(0)');
    andThen(() => {
        let person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(person.get('locations').get('length'), 0);
        let person_location = store.find('person-location', {person_pk: PEOPLE_DEFAULTS.id});
        assert.ok(person_location.objectAt(0).get('removed'));
    });
    let response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    let payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, locations: []});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        let person = store.find('person', PEOPLE_DEFAULTS.id);
        assert.equal(person.get('locations').get('length'), 0);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can alter the locations and rolling back will reset it', (assert) => {
    clearxhr(detail_xhr);
    visit(DETAIL_URL);
    people_detail_data = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    people_detail_data.locations = [];
    xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data);
    let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idOne + '&name__icontains=a';
    xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
    fillIn('.selectize-input input', 'a');
    triggerEvent('.selectize-input input', 'keyup', LETTER_A);
    click('.t-person-locations-select div.option:eq(0)');
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL + '?search=a');
            assert.equal(find('.t-modal').is(':visible'), true);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('locations').get('length'), 0);
            assert.ok(person.get('isNotDirty'));
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
            var previous_location_m2m = store.find('person-location', {person_pk: PEOPLE_DEFAULTS.id});
            assert.deepEqual(person.get('person_location_fks'), []);
            assert.equal(previous_location_m2m.get('length'), 1);
            assert.ok(previous_location_m2m.objectAt(0).get('removed'), true);
        });
    });
});

test('deep link to person and clicking in the person-locations-select component will fire off xhr to get locations with one location to start with', (assert) => {
    clearxhr(list_xhr);
    let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idOne + '&name__icontains=a';
    xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
    visit(DETAIL_URL);
    andThen(() => {
        let locations = store.find('location');
        assert.equal(locations.get('length'), 1);
        assert.equal(find('div.item').length, 1);
        assert.equal(find('div.option').length, 0);
    });
    fillIn('.selectize-input input', 'a');
    triggerEvent('.selectize-input input', 'keyup', LETTER_A);
    andThen(() => {
        let filterFunc = function(location) {
            let location_level_fk = location.get('location_level').get('id');
            return location_level_fk === LOCATION_LEVEL_DEFAULTS.idOne;
        };
        let locations = store.find('location', filterFunc, ['id', 'location_level']);
        assert.equal(locations.get('length'), 10);
        assert.equal(find('div.item').length, 1);
        assert.equal(find('div.option').length, 9);
    });
});

test('when you change a related role it will change the related locations as well', (assert) => {
    clearxhr(list_xhr);
    let people_list_data_mod = PEOPLE_FIXTURES.list();
    people_list_data_mod.results[0].role = ROLE_DEFAULTS.idTwo;
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data_mod);
    visit(DETAIL_URL);
    let url = PREFIX + DETAIL_URL + "/";
    let role = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: [PEOPLE_DEFAULTS.id]});
    let payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, role: role.id, locations: []});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    andThen(() => {
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), 1);
            assert.equal(find('div.item').length, 1);
            assert.equal(find('div.option').length, 0);
        });
        let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idOne + '&name__icontains=a';
        xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
        fillIn('.selectize-input input', 'a');
        triggerEvent('.selectize-input input', 'keyup', LETTER_A);
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), 10);
            assert.equal(find('div.item').length, 1);
            assert.equal(find('div.option').length, 9);
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('locationsIsDirty'), false);
        });
        clearxhr(detail_xhr);
        let people_detail_data_two = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
        xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        let locations_endpoint_role_change = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idTwo + '&name__icontains=a';
        xhr(locations_endpoint_role_change, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
        fillIn('.t-person-role-select', ROLE_DEFAULTS.idTwo);
        andThen(() => {
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('locationsIsDirty'), false);
            assert.equal(person.get('isDirtyOrRelatedDirty'), true);
            assert.equal(person.get('role.id'), ROLE_DEFAULTS.idTwo);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 10);
            assert.equal(find('div.item').length, 0);
            assert.equal(find('div.option').length, 0);
        });
        click(SAVE_BTN);
        andThen(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
});

test('when you change a related role it will change the related locations as well with no search criteria that was cleared out by user', (assert) => {
    clearxhr(list_xhr);
    let people_list_data_mod = PEOPLE_FIXTURES.list();
    people_list_data_mod.results[0].role = ROLE_DEFAULTS.idTwo;
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data_mod);
    visit(DETAIL_URL);
    let url = PREFIX + DETAIL_URL + "/";
    let role = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: [PEOPLE_DEFAULTS.id]});
    let payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, role: role.id, locations: []});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    andThen(() => {
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), 1);
            assert.equal(find('div.item').length, 1);
            assert.equal(find('div.option').length, 0);
        });
        let locations_endpoint = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idOne + '&name__icontains=a';
        xhr(locations_endpoint, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
        fillIn('.selectize-input input', 'a');
        triggerEvent('.selectize-input input', 'keyup', LETTER_A);
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), 10);
            assert.equal(find('div.item').length, 1);
            assert.equal(find('div.option').length, 9);
        });
        fillIn('.selectize-input input', '');
        triggerEvent('.selectize-input input', 'keyup', BACKSPACE);
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), 10);
            assert.equal(find('div.item').length, 1);
            assert.equal(find('div.option').length, 0);
        });
        clearxhr(detail_xhr);
        let people_detail_data_two = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
        people_detail_data_two.role = ROLE_DEFAULTS.idTwo;
        xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        let locations_endpoint_role_change = PREFIX + '/admin/locations/?location_level=' + LOCATION_LEVEL_DEFAULTS.idTwo;
        xhr(locations_endpoint_role_change, 'GET', null, {}, 200, LOCATION_FIXTURES.list());
        fillIn('.t-person-role-select', ROLE_DEFAULTS.idTwo);
        andThen(() => {
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('role.id'), ROLE_DEFAULTS.idTwo);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 10);
            assert.equal(find('div.item').length, 0);
            assert.equal(find('div.option').length, 0);
        });
        click(SAVE_BTN);
        andThen(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            let person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
});
