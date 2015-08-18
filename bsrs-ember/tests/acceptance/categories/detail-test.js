import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_CATEGORY_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = '/admin/categories';
const DETAIL_URL = CATEGORIES_URL + '/' + CATEGORY_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';

var application, store;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        var category_detail_data = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.id);
        var endpoint = PREFIX + CATEGORIES_URL + '/';
        xhr(endpoint + CATEGORY_DEFAULTS.id + '/', 'GET', null, {}, 200, category_detail_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

// test('clicking a categories name will redirect to the given detail view', (assert) => {
//     visit(BASE_CATEGORY_URL);
//     andThen(() => {
//         assert.equal(currentURL(), BASE_CATEGORY_URL);
//     });
//     click('.t-category-data:eq(0)');
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//     });
// });

// test('when you deep link to the person detail view you get bound attrs', (assert) => {
//     visit(DETAIL_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         var person = store.find('person', CATEGORY_DEFAULTS.id);
//         assert.ok(person.get('isNotDirty'));
//         assert.equal(find('.t-person-username').val(), CATEGORY_DEFAULTS.username);
//         assert.equal(find('.t-person-first-name').val(), CATEGORY_DEFAULTS.first_name);
//         assert.equal(find('.t-person-middle-initial').val(), CATEGORY_DEFAULTS.middle_initial);
//         assert.equal(find('.t-person-last-name').val(), CATEGORY_DEFAULTS.last_name);
//         assert.equal(find('.t-person-title').val(), CATEGORY_DEFAULTS.title);
//         assert.equal(find('.t-person-employee_id').val(), CATEGORY_DEFAULTS.employee_id);
//         assert.equal(find('.t-input-multi-phone').find('select:eq(0)').val(), PHONE_NUMBER_TYPES_DEFAULTS.officeId);
//         assert.equal(find('.t-input-multi-phone').find('select:eq(1)').val(), PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
//         assert.equal(find('.t-input-multi-phone').find('select:eq(0) option:selected').text(), t(PHONE_NUMBER_TYPES_DEFAULTS.officeName));
//         assert.equal(find('.t-input-multi-phone').find('select:eq(1) option:selected').text(), t(PHONE_NUMBER_TYPES_DEFAULTS.mobileName));
//         assert.equal(find('.t-input-multi-phone').find('input').length, 2);
//         assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), PHONE_NUMBER_DEFAULTS.numberOne);
//         assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), PHONE_NUMBER_DEFAULTS.numberTwo);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group').length, 2);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type').val(), ADDRESS_TYPES_DEFAULTS.officeId);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type option:selected').text(), t(ADDRESS_TYPES_DEFAULTS.officeName));
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address').val(), ADDRESS_DEFAULTS.streetOne);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city').val(), ADDRESS_DEFAULTS.cityOne);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-state').val(), ADDRESS_DEFAULTS.stateTwo);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code').val(), ADDRESS_DEFAULTS.zipOne);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').val(), ADDRESS_DEFAULTS.countryOne);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type').val(), ADDRESS_TYPES_DEFAULTS.shippingId);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type option:selected').text(), t(ADDRESS_TYPES_DEFAULTS.shippingName));
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address').val(), ADDRESS_DEFAULTS.streetTwo);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city').val(), ADDRESS_DEFAULTS.cityTwo);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-state').val(), ADDRESS_DEFAULTS.stateTwo);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code').val(), ADDRESS_DEFAULTS.zipTwo);
//         assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').val(), ADDRESS_DEFAULTS.countryTwo);
//         assert.equal(find('.t-statuses-select').find('.t-status-option:eq(0)').val(), STATUS_DEFAULTS.activeId);
//         assert.equal(find('.t-statuses-select').find('.t-status-option:eq(1)').val(), STATUS_DEFAULTS.inactiveId);
//         assert.equal(find('.t-statuses-select').find('.t-status-option:eq(2)').val(), STATUS_DEFAULTS.expiredId);
//         assert.equal(find('.t-person-role-select option:eq(0)').val(), 'Select One');
//         assert.equal(find('.t-person-role-select option:eq(1)').val(), ROLE_DEFAULTS.idOne);
//         assert.equal(find('.t-person-role-select option:eq(2)').val(), ROLE_DEFAULTS.idTwo);
//         assert.equal(find(".t-person-role-select option:selected").val(), ROLE_DEFAULTS.idOne);
//         assert.equal(find('.t-person-auth_amount').val(), CATEGORY_DEFAULTS.auth_amount);
//         assert.equal(find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol);
//     });
//     var url = PREFIX + DETAIL_URL + '/';
//     var response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.id);
//     var payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.id, username: CATEGORY_DEFAULTS_PUT.username, first_name: CATEGORY_DEFAULTS_PUT.first_name,
//                                       middle_initial: CATEGORY_DEFAULTS_PUT.middle_initial, last_name: CATEGORY_DEFAULTS_PUT.last_name, title: CATEGORY_DEFAULTS_PUT.title,
//                                         employee_id: CATEGORY_DEFAULTS_PUT.employee_id, auth_amount: CATEGORY_DEFAULTS_PUT.auth_amount});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
//     fillIn('.t-person-username', CATEGORY_DEFAULTS_PUT.username);
//     fillIn('.t-person-first-name', CATEGORY_DEFAULTS_PUT.first_name);
//     fillIn('.t-person-middle-initial', CATEGORY_DEFAULTS_PUT.middle_initial );
//     fillIn('.t-person-last-name', CATEGORY_DEFAULTS_PUT.last_name);
//     fillIn('.t-person-title', CATEGORY_DEFAULTS_PUT.title);
//     fillIn('.t-person-employee_id', CATEGORY_DEFAULTS_PUT.employee_id);
//     fillIn('.t-person-auth_amount', CATEGORY_DEFAULTS_PUT.auth_amount);
//     andThen(() => {
//         var person = store.find('person', CATEGORY_DEFAULTS.id);
//         assert.ok(person.get('isDirty'));
//         assert.ok(person.get('isDirtyOrRelatedDirty'));
//     });
//     click(SAVE_BTN);
//     andThen(() => {
//         var person = store.find('person', CATEGORY_DEFAULTS.id);
//         assert.equal(currentURL(), CATEGORIES_URL);
//         assert.equal(store.find('person').get('length'), 10);
//         assert.ok(person.get('isNotDirty'));
//         assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
//     });
// });

