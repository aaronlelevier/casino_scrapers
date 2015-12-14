import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import SD from 'bsrs-ember/vendor/defaults/status';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import RD from 'bsrs-ember/vendor/defaults/role';
import RF from 'bsrs-ember/vendor/role_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PD_PUT from 'bsrs-ember/vendor/defaults/person-put';
import PERSON_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import AF from 'bsrs-ember/vendor/address_fixtures';
import AD from 'bsrs-ember/vendor/defaults/address';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/person';
import selectize from 'bsrs-ember/tests/pages/selectize';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const POWER_SELECT_LENGTH = 10;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const BASE_LOCATION_URL = BASEURLS.base_locations_url;
const PEOPLE_URL = `${BASE_PEOPLE_URL}/index`;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;
const LETTER_A = {keyCode: 65};
const LETTER_M = {keyCode: 77};
const BACKSPACE = {keyCode: 8};
const LOCATION = '.t-person-locations-select > .ember-basic-dropdown-trigger';
const LOCATION_DROPDOWN = '.t-person-locations-select-dropdown > .ember-power-select-options';
const LOCATIONS = `${LOCATION} > .ember-power-select-multiple-option`;
const LOCATION_ONE = `${LOCATIONS}:eq(0)`;
const LOCATION_SEARCH = '.ember-power-select-trigger-multiple-input';

var application, store, list_xhr, people_detail_data, endpoint, detail_xhr, original_uuid, url;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_PEOPLE_URL + '/';
        var people_list_data = PF.list();
        people_detail_data = PF.detail(PD.id);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
        detail_xhr = xhr(endpoint + PD.id + '/', 'GET', null, {}, 200, people_detail_data);
        original_uuid = random.uuid;
        url = `${PREFIX}${DETAIL_URL}/`;
    },
    afterEach() {
        random.uuid = original_uuid;
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
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(find('.t-person-username').val(), PD.username);
        assert.equal(find('.t-person-first-name').val(), PD.first_name);
        assert.equal(find('.t-person-middle-initial').val(), PD.middle_initial);
        assert.equal(find('.t-person-last-name').val(), PD.last_name);
        assert.equal(find('.t-person-title').val(), PD.title);
        assert.equal(find('.t-person-employee_id').val(), PD.employee_id);
        assert.equal(find('.t-input-multi-phone').find('select:eq(0)').val(), PNTD.officeId);
        assert.equal(find('.t-input-multi-phone').find('select:eq(1)').val(), PNTD.mobileId);
        assert.equal(find('.t-input-multi-phone').find('select:eq(0) option:selected').text(), t(PNTD.officeName));
        assert.equal(find('.t-input-multi-phone').find('select:eq(1) option:selected').text(), t(PNTD.mobileName));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
        assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), PND.numberOne);
        assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), PND.numberTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group').length, 2);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type').val(), ATD.officeId);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type option:selected').text(), t(ATD.officeName));
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-address').val(), AD.streetOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city').val(), AD.cityOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-state').val(), AD.stateTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code').val(), AD.zipOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').val(), AD.countryOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type').val(), ATD.shippingId);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type option:selected').text(), t(ATD.shippingName));
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-address').val(), AD.streetTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city').val(), AD.cityTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-state').val(), AD.stateTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code').val(), AD.zipTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').val(), AD.countryTwo);
        assert.equal(page.statusInput(), SD.activeName);
        assert.equal(find('.t-locale-select').find('.t-locale-option:eq(0)').val(), "");
        assert.equal(find('.t-locale-select').find('.t-locale-option:eq(1)').val(), "en");
        assert.equal(find('.t-locale-select').find('.t-locale-option:eq(2)').val(), "es");
        assert.equal(find(".t-locale-select option:selected").val(), PD.locale);
        assert.equal(page.roleInput(), RD.nameOne);
        assert.equal(find('.t-amount').val(), PD.auth_amount);
        assert.equal(find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol);
    });
    var response = PF.detail(PD.id);
    var payload = PF.put({id: PD.id, username: PD_PUT.username, first_name: PD_PUT.first_name,
                                      middle_initial: PD_PUT.middle_initial, last_name: PD_PUT.last_name, title: PD_PUT.title,
    employee_id: PD_PUT.employee_id, auth_amount: PD_PUT.auth_amount, locale: PD.locale_id });
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-person-username', PD_PUT.username);
    fillIn('.t-person-first-name', PD_PUT.first_name);
    fillIn('.t-person-middle-initial', PD_PUT.middle_initial );
    fillIn('.t-person-last-name', PD_PUT.last_name);
    fillIn('.t-person-title', PD_PUT.title);
    fillIn('.t-person-employee_id', PD_PUT.employee_id);
    fillIn('.t-amount', PD_PUT.auth_amount);
    fillIn('.t-locale-select', PD_PUT.locale);
    andThen(() => {
        var person = store.find('person', PD.id);
        assert.ok(person.get('isDirty'));
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    generalPage.save();
    andThen(() => {
        var person = store.find('person', PD.id);
        assert.equal(currentURL(), PEOPLE_URL);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when editing username to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-person-username', '');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-username-validation-error').text().trim(), 'invalid username');
    });
    fillIn('.t-person-username', PD_PUT.username);
    var response = PF.detail(PD.id);
    var payload = PF.put({id: PD.id, username: PD_PUT.username});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        var person = store.find('person', PD.id);
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when changing password to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    click('.t-person-change-password');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-password-validation-error').text().trim(), 'invalid password');
    });
    fillIn('.t-person-password', PD.password);
    let url = PREFIX + DETAIL_URL + '/';
    let response = PF.detail(PD.id);
    let payload = PF.put({id: PD.id, username: PD.username, password: PD.password});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        let person = store.find('person', PD.id);
        assert.equal(person.get('password'), '');
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('payload does not include password if blank or undefined', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-person-username', PD.sorted_username);
    let response = PF.detail(PD.id);
    let payload = PF.put({id: PD.id, username: PD.sorted_username});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        let person = store.find('person', PD.id);
        assert.equal(person.get('password'), '');
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
    generalPage.cancel();
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
    generalPage.cancel();
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
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(store.find('phonenumber').get('length'), 3);
    });
    fillIn('.t-new-entry:eq(2)', '');
    var response = PF.detail(PD.id);
    var payload = PF.put({id: PD.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
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
    generalPage.save();
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
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(visible_zip_errors.length, 1);
        assert.equal(store.find('address').get('length'), 3);
    });
    fillIn('.t-address-postal-code:eq(2)', '');
    var response = PF.detail(PD.id);
    var payload = PF.put({id: PD.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('address').get('length'), 2);
    });
});

test('when editing phone numbers and addresses to invalid, it checks for validation', (assert) => {
    random.uuid = function() { return UUID.value; };
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
    generalPage.save();
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
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    fillIn('.t-address-address:eq(2)', AD.streetThree);
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-address-address:eq(2)', '');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-address-address:eq(2)', AD.streetThree);
    andThen(() => {
        let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
        let visible_address_errors = find('.t-input-multi-address-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
        assert.equal(visible_address_errors.length, 0);
    });
    fillIn('.t-address-postal-code:eq(2)', AD.zipOne);
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-address-postal-code:eq(2)', '');
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-address-postal-code:eq(2)', AD.zipOne);
    andThen(() => {
        let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-username-validation-error:not(:hidden)').length, 1);
    });
    var response = PF.detail(PD.id);
    var payload = PF.put({id: PD.id});
    payload.phone_numbers.push({id: 'abc123', number: '515-222-3333', type: PNTD.officeId});
    payload.addresses.push({id: 'abc123', type: ATD.officeId, address: AD.streetThree, postal_code: AD.zipOne});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-person-username', PD.username);
    generalPage.save();
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
        const person = store.find('person', PD.idOne);
        assert.equal(person.get('role.id'), RD.idOne);
        assert.equal(person.get('role_fk'), RD.idOne);
        assert.ok(person.get('roleIsNotDirty'));
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var phone_numbers = PNF.put({id: PND.idOne, type: PNTD.mobileId});
    var payload = PF.put({id: PD.id, phone_numbers: phone_numbers});
    fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when you change a related address type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var addresses = AF.put({id: AD.idOne, type: ATD.shippingId});
    var payload = PF.put({id: PD.id, addresses: addresses});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    fillIn('.t-address-type:eq(0)', ATD.shippingId);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when you change a related role it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        clearxhr(detail_xhr);
        //refreshModel will call findById in people repo
        let people_detail_data_two = PF.detail(PD.id);
        people_detail_data_two.role = RD.idTwo;
        xhr(endpoint + PD.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        andThen(() => {
            let person = store.find('person', PD.id);
            assert.equal(person.get('role_fk'), RD.idOne);
            assert.equal(person.get('locations').get('length'), 1);
            assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
        });
        page.roleClickDropdown();
        page.roleClickOptionTwo();
        andThen(() => {
            assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
        });
        var role = RF.put({id: RD.idTwo, name: RD.nameTwo, people: [PD.id]});
        var payload = PF.put({id: PD.id, role: role.id});
        payload.locations = [];
        xhr(url,'PUT',JSON.stringify(payload),{},200);
        generalPage.save();
        andThen(() => {
            assert.equal(currentURL(), PEOPLE_URL);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-person-username', PD_PUT.username);
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
            assert.equal(find('.t-person-username').val(), PD_PUT.username);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-person-username', PD_PUT.username);
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PD.id);
            assert.equal(person.get('username'), PD.username);
        });
    });
});

test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PD.id);
            var phone_numbers = store.find('phonenumber', PD.id);
            assert.equal(phone_numbers.source[0].get('type'), PNTD.officeId);
        });
    });
});

test('when user changes an attribute on address and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-address-type:eq(0)', ATD.shippingId);
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PD.id);
            var addresses = store.find('address', PD.id);
            assert.equal(addresses.source[0].get('type'), ATD.officeId);
        });
    });
});

test('when user removes a phone number clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    click('.t-del-btn:eq(0)');
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PD.id);
            var phone_numbers = store.find('phonenumber', PD.id);
            assert.equal(phone_numbers.source[0].get('type'), PNTD.officeId);
        });
    });
});

test('when user removes an address clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    click('.t-del-address-btn:eq(0)');
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
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', PD.id);
            var addresses = store.find('address', PD.id);
            assert.equal(addresses.source[0].get('type'), ATD.officeId);
        });
    });
});

test('currency helper displays correct currency format', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    var symbol = '$';
    andThen(() => {
        assert.equal(find('.t-amount').val(), PD.auth_amount);
    });
});

test('when click delete, person is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_PEOPLE_URL + '/' + PD.id + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when you deep link to the person detail view you can add a new phone number', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry:eq(2)', PND.numberThree);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-phone').find('input').length, 3);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var phone_numbers = PNF.put();
    var response = PF.detail(PD.id);
    phone_numbers.push({id: UUID.value, number: PND.numberThree, type: PNTD.officeId});
    var payload = PF.put({id: PD.id, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can add a new address', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    andThen(() => {
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-add-address-btn:eq(0)');
    fillIn('.t-address-address:eq(2)', AD.streetThree);
    andThen(() => {
        assert.equal(find('.t-input-multi-address').find('input').length, 6);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var addresses = AF.put();
    var response = PF.detail(PD.id);
    addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree});
    var payload = PF.put({id: PD.id, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can remove a new phone number', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-del-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-phone').find('input').length, 1);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var phone_numbers = PNF.put();
    var response = PF.detail(PD.id);
    var payload = PF.put({id: PD.id, phone_numbers: [phone_numbers[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can remove a new address', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-del-address-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-address').find('input').length, 2);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var addresses = AF.put();
    var response = PF.detail(PD.id);
    var payload = PF.put({id: PD.id, addresses: [addresses[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and remove a new phone number', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-add-btn:eq(0)');
    click('.t-del-btn:eq(2)');
    andThen(() => {
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and remove a new address', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-add-address-btn:eq(0)');
    click('.t-del-address-btn:eq(2)');
    andThen(() => {
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the person detail view you can change the phone number type and add a new phone number', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    fillIn('.t-input-multi-phone select:eq(0)', PNTD.mobileId);
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry:eq(2)', PND.numberThree);
    var phone_numbers = PNF.put();
    phone_numbers[0].type = PNTD.mobileId;
    var response = PF.detail(PD.id);
    phone_numbers.push({id: UUID.value, number: PND.numberThree, type: PNTD.officeId});
    var payload = PF.put({id: PD.id, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('phone_numbers').objectAt(0).get('type'), PNTD.mobileId);
        assert.equal(person.get('phone_numbers').objectAt(2).get('type'), PNTD.officeId);
        assert.ok(person.get('phone_numbers').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can change the address type and can add new address with default type', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    fillIn('.t-input-multi-address .t-address-group:eq(0) select:eq(0)', ATD.shippingId);
    click('.t-add-address-btn:eq(0)');
    fillIn('.t-address-address:eq(2)', AD.streetThree);
    var addresses = AF.put();
    addresses[0].type = ATD.shippingId;
    var response = PF.detail(PD.id);
    addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree});
    var payload = PF.put({id: PD.id, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('addresses').objectAt(0).get('type'), ATD.shippingId);
        assert.equal(person.get('addresses').objectAt(2).get('type'), ATD.officeId);
        assert.ok(person.get('addresses').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and save a new phone number with validation', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    click('.t-add-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    var phone_numbers = PNF.put();
    phone_numbers[0].type = PNTD.mobileId;
    var response = PF.detail(PD.id);
    phone_numbers.push({id: UUID.value, number: PND.numberThree, type: PNTD.officeId});
    var payload = PF.put({id: PD.id, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-input-multi-phone select:eq(0)', PNTD.mobileId);
    fillIn('.t-new-entry:eq(2)', PND.numberThree);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('phone_numbers').objectAt(0).get('type'), PNTD.mobileId);
        assert.equal(person.get('phone_numbers').objectAt(2).get('type'), PNTD.officeId);
        assert.ok(person.get('phone_numbers').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can add and save a new address with validation', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    click('.t-add-address-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    var addresses = AF.put();
    addresses[0].type = ATD.shippingId;
    var response = PF.detail(PD.id);
    addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree});
    var payload = PF.put({id: PD.id, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-input-multi-address select:eq(0)', ATD.shippingId);
    fillIn('.t-address-address:eq(2)', AD.streetThree);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var person = store.find('person', PD.id);
        assert.ok(person.get('isNotDirty'));
        assert.equal(person.get('addresses').objectAt(0).get('type'), ATD.shippingId);
        assert.equal(person.get('addresses').objectAt(2).get('type'), ATD.officeId);
        assert.ok(person.get('addresses').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the person detail view you can alter the role and rolling back will reset it', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        clearxhr(detail_xhr);
        //refreshModel will call findById in people repo
        let people_detail_data_two = PF.detail(PD.id);
        people_detail_data_two.role = RD.idTwo;
        xhr(`${endpoint}${PD.idOne}/`, 'GET', null, {}, 200, people_detail_data_two);
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PD.id);
        andThen(() => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
            assert.equal(page.roleInput(), RD.nameOne);
            assert.equal(person.get('role.id'), RD.idOne);
        });
        page.roleClickDropdown();
        page.roleClickOptionTwo();
        andThen(() => {
            assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
            assert.equal(page.roleInput(), RD.nameTwo);
            var person = store.find('person', PD.idOne);
            assert.ok(person.get('isDirtyOrRelatedDirty'));
            assert.equal(person.get('role.id'), RD.idTwo);
        });
        generalPage.cancel();
        andThen(() => {
            waitFor(() => {
                assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
                assert.ok(generalPage.modalIsVisible());
            });
        });
        generalPage.clickModalRollback();
        andThen(() => {
            waitFor(() => {
                assert.equal(currentURL(), PEOPLE_URL);
                var person = store.find('person', PD.id);
                assert.equal(person.get('role.id'), RD.idOne);
                var actual_role = store.find('role', RD.idOne);
                assert.ok(actual_role.get('isNotDirty'));
                assert.ok(person.get('isNotDirty'));
                assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
                var previous_role = store.find('role', RD.idTwo);
                assert.ok(Ember.$.inArray(person.get('id'), previous_role.get('people')) === -1);
                assert.ok(previous_role.get('isNotDirty'));
            });
        });
    });
});

test('when you deep link to the person detail view you can alter the role and change it back without dirtying the person model', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        clearxhr(detail_xhr);
        //refreshModel will call findById in people repo
        let people_detail_data_two = PF.detail(PD.id);
        people_detail_data_two.role = RD.idTwo;
        let first_role_change = xhr(endpoint + PD.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        assert.equal(currentURL(), DETAIL_URL);
        var person = store.find('person', PD.id);
        andThen(() => {
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
            assert.equal(page.roleInput(), RD.nameOne);
            assert.equal(person.get('role.id'), RD.idOne);
        });
        page.roleClickDropdown();
        page.roleClickOptionTwo();
        andThen(() => {
            assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
            assert.equal(page.roleInput(), RD.nameTwo);
            var person = store.find('person', PD.id);
            assert.ok(person.get('isDirtyOrRelatedDirty'));
            assert.equal(person.get('role.id'), RD.idTwo);
        });
        andThen(() => {
            clearxhr(first_role_change);
            let people_detail_data_three = PF.detail(PD.id);
            people_detail_data_three.role = RD.idOne;
            xhr(endpoint + PD.id + '/', 'GET', null, {}, 200, people_detail_data_three);
            page.roleClickDropdown();
            page.roleClickOptionOne();
            andThen(() => {
                assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idOne);
                assert.equal(page.roleInput(), RD.nameOne);
                var person = store.find('person', PD.idOne);
                assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
                assert.equal(person.get('role.id'), RD.idOne);
            });
        });
        generalPage.cancel();
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
        var person = store.find('person', PD.id);
        assert.ok(person.get('id') !== PERSON_CURRENT_DEFAULTS.id);
        assert.equal(find('.t-person-first-name').val(), PD.first_name);
        assert.equal(find('.t-locale-select option:selected').val(), PD.locale);
        assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
        fillIn('.t-locale-select', PD.locale2);
        andThen(() => {
            assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
        });
    });
});


test('when you change a related role it will change the related locations as well', (assert) => {
    clearxhr(list_xhr);
    let people_list_data_mod = PF.list();
    people_list_data_mod.results[0].role = RD.idTwo;
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data_mod);
    visit(DETAIL_URL);
    let url = PREFIX + DETAIL_URL + "/";
    let role = RF.put({id: RD.idTwo, name: RD.nameTwo, people: [PD.id]});
    let payload = PF.put({id: PD.id, role: role.id, locations: []});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    andThen(() => {
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), 1);
        });
        let locations_endpoint = `${PREFIX}/admin/locations/?location_level=${LLD.idOne}&name__icontains=a`;
        xhr(locations_endpoint, 'GET', null, {}, 200, LF.list());
        page.locationClickDropdown();
        fillIn(LOCATION_SEARCH, 'a');
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), POWER_SELECT_LENGTH);
            assert.equal(page.locationOptionLength(), POWER_SELECT_LENGTH);
            let person = store.find('person', PD.idOne);
            assert.equal(person.get('locationsIsDirty'), false);
        });
        clearxhr(detail_xhr);
        let people_detail_data_two = PF.detail(PD.id);
        xhr(endpoint + PD.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        page.roleClickDropdown();
        page.roleClickOptionTwo();
        andThen(() => {
            let person = store.find('person', PD.id);
            assert.equal(person.get('locationsIsDirty'), false);
            assert.equal(person.get('isDirtyOrRelatedDirty'), true);
            assert.equal(person.get('role.id'), RD.idTwo);
        });
        generalPage.save();
        andThen(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            let person = store.find('person', PD.id);
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
});

test('when you change a related role it will change the related locations as well with no search criteria that was cleared out by user', (assert) => {
    clearxhr(list_xhr);
    let people_list_data_mod = PF.list();
    people_list_data_mod.results[0].role = RD.idTwo;
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data_mod);
    visit(DETAIL_URL);
    let url = PREFIX + DETAIL_URL + "/";
    let role = RF.put({id: RD.idTwo, name: RD.nameTwo, people: [PD.id]});
    let payload = PF.put({id: PD.id, role: role.id, locations: []});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    andThen(() => {
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), 1);
        });
        let locations_endpoint = `${PREFIX}/admin/locations/?location_level=${LLD.idOne}&name__icontains=a`;
        xhr(locations_endpoint, 'GET', null, {}, 200, LF.list());
        page.locationClickDropdown();
        fillIn(LOCATION_SEARCH, 'a');
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), POWER_SELECT_LENGTH);
            assert.equal(page.locationOptionLength(), POWER_SELECT_LENGTH);
        });
        fillIn(LOCATION_SEARCH, '');
        andThen(() => {
            let locations = store.find('location');
            assert.equal(locations.get('length'), POWER_SELECT_LENGTH);
            assert.equal(page.locationOptionLength(), 1);
            assert.equal(find(LOCATION_DROPDOWN).text().trim(), GLOBALMSG.power_search);
        });
        clearxhr(detail_xhr);
        let people_detail_data_two = PF.detail(PD.id);
        people_detail_data_two.role = RD.idTwo;
        xhr(endpoint + PD.id + '/', 'GET', null, {}, 200, people_detail_data_two);
        page.roleClickDropdown();
        page.roleClickOptionTwo();
        andThen(() => {
            let person = store.find('person', PD.id);
            assert.equal(person.get('role.id'), RD.idTwo);
            let locations = store.find('location');
            assert.equal(locations.get('length'), POWER_SELECT_LENGTH);
        });
        generalPage.save();
        andThen(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            let person = store.find('person', PD.id);
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        });
    });
});

/*PERSON TO LOCATION ONE TO MANY*/
test('deep link to person and clicking in the person-locations-select component will fire off xhr to get locations with one location to start with', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 1);
        assert.equal(page.locationOneSelected().indexOf(LD.storeName), 2);
    });
    page.locationClickDropdown();
    andThen(() => {
        assert.equal(page.locationOptionLength(), 1);
        assert.equal(find(LOCATION_DROPDOWN).text().trim(), GLOBALMSG.power_search);
    });
    let locations_endpoint = `${PREFIX}/admin/locations/?location_level=${LLD.idOne}&name__icontains=ABC1234`;
    xhr(locations_endpoint, 'GET', null, {}, 200, LF.list());
    fillIn(LOCATION_SEARCH, 'ABC1234');
    andThen(() => {
        assert.equal(page.locationOptionLength(), POWER_SELECT_LENGTH);
    });
    page.locationClickOptionTwo();
    andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 2);
        assert.equal(page.locationOneSelected().indexOf(LD.storeName), 2);
        assert.equal(page.locationTwoSelected().indexOf('ABC1234'), 2);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    page.locationClickDropdown();
    fillIn(LOCATION_SEARCH, '');
    andThen(() => {
        assert.equal(page.locationOptionLength(), 1);
        assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
        let person = store.find('person', PD.idOne);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne, LD.gridLocSelect]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('can remove and add back same location', (assert) => {
    visit(DETAIL_URL);
    page.locationOneRemove();
    andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 0);
    });
    let locations_endpoint = `${PREFIX}/admin/locations/?location_level=${LLD.idOne}&name__icontains=a`;
    xhr(locations_endpoint, 'GET', null, {}, 200, LF.list());
    fillIn(LOCATION_SEARCH, 'a');
    page.locationClickOptionOneEq();
    andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 1);
        assert.equal(page.locationOneSelected().indexOf(LD.storeName), 2);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('starting with multiple locations, can remove all locations (while not populating options) and add back', (assert) => {
    people_detail_data.locations = [...people_detail_data.locations, LF.get(LD.idTwo)];
    people_detail_data.locations[1].name = LD.storeNameTwo;
    visit(DETAIL_URL);
    andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 2);
        assert.equal(page.locationOneSelected().indexOf(LD.storeName), 2);
        assert.equal(page.locationTwoSelected().indexOf(LD.storeNameTwo), 2);
    });
    page.locationOneRemove();
    page.locationOneRemove();
    andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 0);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    let locations_endpoint = `${PREFIX}/admin/locations/?location_level=${LLD.idOne}&name__icontains=a`;
    xhr(locations_endpoint, 'GET', null, {}, 200, LF.list());
    page.locationClickDropdown();
    fillIn(LOCATION_SEARCH, 'a');
    page.locationClickOptionOneEq();
    andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 1);
        assert.equal(page.locationOneSelected().indexOf(LD.storeName), 2);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('clicking and typing into power select for people will not filter if spacebar pressed', (assert) => {
    visit(DETAIL_URL);
    fillIn(LOCATION_SEARCH, '');
    andThen(() => {
        assert.equal(page.locationOptionLength(), 1);
        assert.equal(find(LOCATION_DROPDOWN).text().trim(), GLOBALMSG.power_search);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = PF.detail(PD.idOne);
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when you deep link to the person detail view you can alter the locations and rolling back will reset it', (assert) => {
    clearxhr(detail_xhr);
    visit(DETAIL_URL);
    people_detail_data = PF.detail(PD.id);
    people_detail_data.locations = [];
    page.locationClickDropdown();
    andThen(() => {
        assert.equal(page.locationOptionLength(), 1);
        assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
        let person = store.find('person', PD.id);
        assert.equal(person.get('locations').get('length'), 0);
        var previous_location_m2m = store.find('person-location', {person_pk: PD.id});
        assert.deepEqual(person.get('person_location_fks'), []);
        assert.equal(previous_location_m2m.get('length'), 0);
    });
    xhr(endpoint + PD.id + '/', 'GET', null, {}, 200, people_detail_data);
    let locations_endpoint = `${PREFIX}/admin/locations/?location_level=${LLD.idOne}&name__icontains=ABC1234`;
    xhr(locations_endpoint, 'GET', null, {}, 200, LF.list());
    fillIn(LOCATION_SEARCH, 'ABC1234');
    page.locationClickOptionTwo();
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            let person = store.find('person', PD.id);
            assert.equal(person.get('locations').get('length'), 1);
            assert.ok(person.get('isNotDirty'));
            assert.ok(person.get('isDirtyOrRelatedDirty'));
            var previous_location_m2m = store.find('person-location', {person_pk: PD.id});
            assert.deepEqual(person.get('person_location_fks'), []);
            assert.equal(previous_location_m2m.get('length'), 1);
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            let person = store.find('person', PD.id);
            assert.equal(person.get('locations').get('length'), 0);
            assert.ok(person.get('isNotDirty'));
            assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
            var previous_location_m2m = store.find('person-location', {person_pk: PD.id});
            assert.deepEqual(person.get('person_location_fks'), []);
            assert.equal(previous_location_m2m.get('length'), 1);
            assert.ok(previous_location_m2m.objectAt(0).get('removed'), true);
        });
    });
});

/* STATUS */
test('can change status to inactive for person and save (power select)', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(page.statusInput(), SD.activeName);
    });
    page.statusClickDropdown();
    andThen(() => {
        assert.equal(page.statusOptionLength(), 3);
        assert.equal(page.statusOne(), SD.activeName);
        assert.equal(page.statusTwo(), SD.inactiveName);
        assert.equal(page.statusThree(), SD.expiredName);
        const person = store.find('person', PD.idOne);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    page.statusClickOptionTwo();
    andThen(() => {
        const person = store.find('person', PD.idOne);
        assert.equal(person.get('status_fk'), SD.activeId);
        assert.equal(person.get('status.id'), SD.inactiveId);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
        assert.equal(page.statusInput(), SD.inactiveName);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let payload = PF.put({id: PD.idOne, status: SD.inactiveId});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});
