import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import StatusDefaults from 'bsrs-ember/vendor/defaults/status';
import CountryDefaults from 'bsrs-ember/vendor/defaults/country';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_DEFAULTS_PUT from 'bsrs-ember/vendor/defaults/person-put';
import PHONE_NUMBER_FIXTURES from 'bsrs-ember/vendor/phone_number_fixtures';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';
import PHONE_NUMBER_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import ADDRESS_FIXTURES from 'bsrs-ember/vendor/address_fixtures';
import ADDRESS_DEFAULTS from 'bsrs-ember/vendor/defaults/address';
import ADDRESS_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = '/admin/people';
const DETAIL_URL = PEOPLE_URL + '/' + PEOPLE_DEFAULTS.id;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';

var application, store;

module('Acceptance | detail test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    var people_list_data = PEOPLE_FIXTURES.list();
    var people_detail_data = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var endpoint = PREFIX + PEOPLE_URL + '/';
    xhr(endpoint ,'GET',null,{},200,people_list_data);
    xhr(endpoint + PEOPLE_DEFAULTS.id + '/','GET',null,{},200,people_detail_data);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('clicking a persons name will redirect to the given detail view', (assert) => {
    visit(PEOPLE_URL);

    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });

    click('.t-person-data:eq(0)');

    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
});

test('when you deep link to the person detail view you get bound attrs', (assert) => {

    visit(DETAIL_URL);

    andThen(() => {
        //TODO: verify ALL the other dynamic bits
        assert.equal(currentURL(),DETAIL_URL);
        assert.equal(find('.t-person-username').val(), PEOPLE_DEFAULTS.username);
        assert.equal(find('.t-person-first-name').val(), PEOPLE_DEFAULTS.first_name);
        assert.equal(find('.t-person-middle-initial').val(), PEOPLE_DEFAULTS.middle_initial);
        assert.equal(find('.t-person-last-name').val(), PEOPLE_DEFAULTS.last_name);
        assert.equal(find('.t-person-title').val(), PEOPLE_DEFAULTS.title);
        assert.equal(find('.t-person-emp_number').val(), PEOPLE_DEFAULTS.emp_number);
        assert.equal(find('.t-input-multi-phone').find('select:eq(0)').val(), PHONE_NUMBER_TYPES_DEFAULTS.officeType);
        assert.equal(find('.t-input-multi-phone').find('select:eq(1)').val(), PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
        assert.equal(find('.t-input-multi-phone').find('select:eq(0) option:selected').text(), 'Office');
        assert.equal(find('.t-input-multi-phone').find('select:eq(1) option:selected').text(), 'Mobile');
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
        assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), PHONE_NUMBER_DEFAULTS.numberOne);
        assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), PHONE_NUMBER_DEFAULTS.numberTwo);

        assert.equal(find('.t-input-multi-address').find('.t-address-group').length, 2);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type').val(), ADDRESS_TYPES_DEFAULTS.officeType);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type option:selected').text(), 'Office');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address').val(), ADDRESS_DEFAULTS.streetOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city').val(), ADDRESS_DEFAULTS.cityOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-state').val(), ADDRESS_DEFAULTS.stateTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code').val(), ADDRESS_DEFAULTS.zipOne);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').val(), ADDRESS_DEFAULTS.countryOne);

        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type').val(), ADDRESS_TYPES_DEFAULTS.shippingType);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type option:selected').text(), 'Shipping');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address').val(), ADDRESS_DEFAULTS.streetTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city').val(), ADDRESS_DEFAULTS.cityTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-state').val(), ADDRESS_DEFAULTS.stateTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code').val(), ADDRESS_DEFAULTS.zipTwo);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').val(), ADDRESS_DEFAULTS.countryTwo);

        assert.equal(find('.t-statuses-select').find('.t-status-option:eq(0)').val(), StatusDefaults.activeName);
        assert.equal(find('.t-statuses-select').find('.t-status-option:eq(1)').val(), StatusDefaults.inactiveName);
        assert.equal(find('.t-statuses-select').find('.t-status-option:eq(2)').val(), StatusDefaults.expiredName);

        assert.equal(find('.t-person-auth_amount').val(), PEOPLE_DEFAULTS.auth_amount);
    });

    var url = PREFIX + DETAIL_URL + '/';
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, username: PEOPLE_DEFAULTS_PUT.username, first_name: PEOPLE_DEFAULTS_PUT.first_name, middle_initial: PEOPLE_DEFAULTS_PUT.middle_initial, last_name: PEOPLE_DEFAULTS_PUT.last_name, title: PEOPLE_DEFAULTS_PUT.title, emp_number: PEOPLE_DEFAULTS_PUT.emp_number, auth_amount: PEOPLE_DEFAULTS_PUT.auth_amount});
    xhr( url,'PUT',JSON.stringify(payload),{},200,response );

    fillIn('.t-person-username', PEOPLE_DEFAULTS_PUT.username);
    fillIn('.t-person-first-name', PEOPLE_DEFAULTS_PUT.first_name);
    fillIn('.t-person-middle-initial', PEOPLE_DEFAULTS_PUT.middle_initial );
    fillIn('.t-person-last-name', PEOPLE_DEFAULTS_PUT.last_name);
    fillIn('.t-person-title', PEOPLE_DEFAULTS_PUT.title);
    fillIn('.t-person-emp_number', PEOPLE_DEFAULTS_PUT.emp_number);
    fillIn('.t-person-auth_amount', PEOPLE_DEFAULTS_PUT.auth_amount);

    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
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
    var url = PREFIX + DETAIL_URL + "/";
    var response = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, username: PEOPLE_DEFAULTS_PUT.username});
    xhr( url,'PUT',JSON.stringify(payload),{},200,response );
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
    click('.t-person-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var url = PREFIX + DETAIL_URL + "/";
    var phone_numbers = PHONE_NUMBER_FIXTURES.put({id: PHONE_NUMBER_DEFAULTS.idPut, type: PHONE_NUMBER_TYPES_DEFAULTS.mobileType});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, phone_numbers: phone_numbers});
    fillIn('.t-multi-phone-type:eq(0)', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when you change a related address type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var url = PREFIX + DETAIL_URL + "/";
    var addresses = ADDRESS_FIXTURES.put({id: ADDRESS_DEFAULTS.id, type: ADDRESS_TYPES_DEFAULTS.shippingType});
    var payload = PEOPLE_FIXTURES.put({id: PEOPLE_DEFAULTS.id, addresses: addresses});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    fillIn('.t-address-type:eq(0)', ADDRESS_TYPES_DEFAULTS.shippingType);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
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
            assert.equal(find('.t-modal').is(':hidden'), true);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            assert.equal(person.get('username'), PEOPLE_DEFAULTS.username);
        });
    });
});

test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-multi-phone-type:eq(0)', PHONE_NUMBER_TYPES_DEFAULTS.mobileType);
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
            assert.equal(find('.t-modal').is(':hidden'), true);
            var person = store.find('person', PEOPLE_DEFAULTS.id);
            var phone_numbers = store.find('phonenumber', PEOPLE_DEFAULTS.id);
            assert.equal(phone_numbers.source[0].get('type'), PHONE_NUMBER_TYPES_DEFAULTS.officeType);
        });
    });
});

test('currency helper displays correct currency format', (assert) => {
    visit(DETAIL_URL);
    var symbol = '$';
    andThen(() => {
        assert.equal(find('.t-person-auth_amount').val(), PEOPLE_DEFAULTS.auth_amount);
    });
});
