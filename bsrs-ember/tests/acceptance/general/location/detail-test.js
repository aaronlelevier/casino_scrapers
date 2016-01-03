import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
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
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = `${BASE_URL}/index`;
const DETAIL_URL = BASE_URL + '/' + LD.idOne;

let application, store, endpoint, list_xhr, url, original_uuid, run = Ember.run;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        let location_list_data = LF.list();
        let location_detail_data = LF.detail();
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, location_list_data);
        xhr(endpoint + LD.idOne + '/', 'GET', null, {}, 200, location_detail_data);
        url = `${PREFIX}${DETAIL_URL}/`;
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
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
        assert.equal(find('.t-input-multi-email').find('select:eq(0)').val(), ETD.workId);
        assert.equal(find('.t-input-multi-email').find('select:eq(1)').val(), ETD.personalId);
        assert.equal(find('.t-input-multi-email').find('select:eq(0) option:selected').text(), t(ETD.workEmail));
        assert.equal(find('.t-input-multi-email').find('select:eq(1) option:selected').text(), t(ETD.personalEmail));
        assert.equal(find('.t-input-multi-email').find('input').length, 2);
        assert.equal(find('.t-input-multi-email').find('input:eq(0)').val(), ED.emailOne);
        assert.equal(find('.t-input-multi-email').find('input:eq(1)').val(), ED.emailTwo);
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
        assert.equal(page.statusInput(), t(LDS.openName));
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
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        let location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
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
    xhr(`${PREFIX}${BASE_URL}/${LD.idOne}/`, 'DELETE', null, {}, 204, {});
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
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});

/* PHONE NUMBER AND ADDRESS */
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
        assert.equal(currentURL(), LOCATION_URL);
    });
});

test('newly added email without a valid email are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-email-btn:eq(0)');
    andThen(() => {
        assert.equal(store.find('email').get('length'), 3);
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(4)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-new-entry:eq(4)', '');
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
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
        assert.equal(currentURL(), LOCATION_URL);
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
    var response = LF.detail(LD.idOne);
    var payload = LF.put({id: LD.idOne});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('phonenumber').get('length'), 2);
    });
});

test('emails without a valid email are ignored and removed on save', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-email-btn:eq(0)');
    andThen(() => {
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(4)', '34');
    andThen(() => {
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(find('.t-input-multi-email-validation-format-error:not(:hidden):eq(0)').text().trim(), 'invalid email');
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
        assert.equal(visible_errors.length, 1);
        assert.equal(store.find('email').get('length'), 3);
    });
    fillIn('.t-new-entry:eq(4)', '');
    var response = LF.detail(LD.idOne);
    var payload = LF.put({id: LD.idOne});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('email').get('length'), 2);
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
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('address').get('length'), 3);
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
    var response = LF.detail(LD.idOne);
    var payload = LF.put({id: LD.idOne});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(store.find('address').get('length'), 2);
    });
});

test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var phone_numbers = PNF.put({id: PND.idOne, type: PNTD.mobileId});
    var payload = LF.put({id: LD.idOne, phone_numbers: phone_numbers});
    fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
    });
});

test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var emails = EF.put({id: ED.idOne, type: ETD.personalId});
    var payload = LF.put({id: LD.idOne, emails: emails});
    fillIn('.t-multi-email-type:eq(0)', ETD.personalId);
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
    });
});

test('when you change a related address type it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var addresses = AF.put({id: AD.idOne, type: ATD.shippingId});
    var payload = LF.put({id: LD.idOne, addresses: addresses});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    fillIn('.t-address-type:eq(0)', ATD.shippingId);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
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
            assert.equal(currentURL(), LOCATION_URL);
            var location = store.find('location', LD.idOne);
            var phone_numbers = store.find('phonenumber', LD.idOne);
            assert.equal(phone_numbers.source[0].get('type'), PNTD.officeId);
        });
    });
});

test('when user changes an attribute on email and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-multi-email-type:eq(0)', ETD.personalId);
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
            var location = store.find('location', LD.idOne);
            var email = store.find('email', LD.idOne);
            assert.equal(email.source[0].get('type'), ETD.workId);
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
            assert.equal(currentURL(), LOCATION_URL);
            var location = store.find('location', LD.idOne);
            var addresses = store.find('address', LD.idOne);
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
            assert.equal(currentURL(), LOCATION_URL);
            var location = store.find('location', LD.idOne);
            var phone_numbers = store.find('phonenumber', LD.idOne);
            assert.equal(phone_numbers.source[0].get('type'), PNTD.officeId);
        });
    });
});

test('when user removes a email clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    visit(DETAIL_URL);
    click('.t-del-email-btn:eq(0)');
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
            var location = store.find('location', LD.idOne);
            var emails = store.find('email', LD.idOne);
            assert.equal(emails.source[0].get('type'), ETD.workId);
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
            assert.equal(currentURL(), LOCATION_URL);
            var location = store.find('location', LD.idOne);
            var addresses = store.find('address', LD.idOne);
            assert.equal(addresses.source[0].get('type'), ATD.officeId);
        });
    });
});

test('when you deep link to the location detail view you can add a new phone number', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry:eq(2)', PND.numberThree);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-phone').find('input').length, 3);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    var phone_numbers = PNF.put();
    var response = LF.detail(LD.idOne);
    run(function() {
        phone_numbers.push({id: UUID.value, number: PND.numberThree, type: PNTD.officeId});
    });
    var payload = LF.put({id: LD.idOne, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can add a new email', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-email').find('input').length, 2);
    });
    click('.t-add-email-btn:eq(0)');
    fillIn('.t-new-entry:eq(4)', ED.emailThree);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-email').find('input').length, 3);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    var email = EF.put();
    var response = LF.detail(LD.idOne);
    run(function() {
        email.push({id: UUID.value, email: ED.emailThree, type: ETD.workId});
    });
    var payload = LF.put({id: LD.idOne, emails: email});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can add a new address', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    andThen(() => {
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-add-address-btn:eq(0)');
    fillIn('.t-address-address:eq(2)', AD.streetThree);
    andThen(() => {
        assert.equal(find('.t-input-multi-address').find('input').length, 6);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    var addresses = AF.put();
    var response = LF.detail(LD.idOne);
    run(function() {
        addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree});
    });
    var payload = LF.put({id: LD.idOne, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can remove a new phone number', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-del-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-phone').find('input').length, 1);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    var phone_numbers = PNF.put();
    var response = LF.detail(LD.idOne);
    var payload = LF.put({id: LD.idOne, phone_numbers: [phone_numbers[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can remove a new email', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-email').find('input').length, 2);
    });
    click('.t-del-email-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-email').find('input').length, 1);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    var email = EF.put();
    var response = LF.detail(LD.idOne);
    var payload = LF.put({id: LD.idOne, emails: [email[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can remove a new address', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-del-address-btn:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-input-multi-address').find('input').length, 2);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isDirtyOrRelatedDirty'));
    });
    var addresses = AF.put();
    var response = LF.detail(LD.idOne);
    var payload = LF.put({id: LD.idOne, addresses: [addresses[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can add and remove a new phone number', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-add-btn:eq(0)');
    click('.t-del-btn:eq(2)');
    andThen(() => {
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can add and remove a new email', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-email').find('input').length, 2);
    });
    click('.t-add-email-btn:eq(0)');
    click('.t-del-email-btn:eq(2)');
    andThen(() => {
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can add and remove a new address', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(find('.t-input-multi-address').find('input').length, 4);
    });
    click('.t-add-address-btn:eq(0)');
    click('.t-del-address-btn:eq(2)');
    andThen(() => {
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('when you deep link to the location detail view you can change the phone number type and add a new phone number', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    fillIn('.t-input-multi-phone select:eq(0)', PNTD.mobileId);
    click('.t-add-btn:eq(0)');
    fillIn('.t-new-entry:eq(2)', PND.numberThree);
    var phone_numbers = PNF.put();
    phone_numbers[0].type = PNTD.mobileId;
    var response = LF.detail(LD.idOne);
    run(function() {
        phone_numbers.push({id: UUID.value, number: PND.numberThree, type: PNTD.officeId});
    });
    var payload = LF.put({id: LD.idOne, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.equal(location.get('phone_numbers').objectAt(0).get('type'), PNTD.mobileId);
        assert.equal(location.get('phone_numbers').objectAt(2).get('type'), PNTD.officeId);
        assert.ok(location.get('phone_numbers').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the location detail view you can change the email type and add a new email', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    fillIn('.t-input-multi-email select:eq(0)', ETD.personalId);
    click('.t-add-email-btn:eq(0)');
    fillIn('.t-new-entry:eq(4)', ED.emailThree);
    var email = EF.put();
    email[0].type = ETD.personalId;
    var response = LF.detail(LD.idOne);
    run(function() {
        email.push({id: UUID.value, email: ED.emailThree, type: ETD.workId});
    });
    var payload = LF.put({id: LD.idOne, emails: email});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.equal(location.get('emails').objectAt(0).get('type'), ETD.personalId);
        assert.equal(location.get('emails').objectAt(2).get('type'), ETD.workId);
        assert.ok(location.get('emails').objectAt(0).get('isNotDirty'));
    });
});

test('when you deep link to the location detail view you can change the address type and can add new address with default type', (assert) => {
    random.uuid = function() { return UUID.value; };
    visit(DETAIL_URL);
    fillIn('.t-input-multi-address .t-address-group:eq(0) select:eq(0)', ATD.shippingId);
    click('.t-add-address-btn:eq(0)');
    fillIn('.t-address-address:eq(2)', AD.streetThree);
    var addresses = AF.put();
    addresses[0].type = ATD.shippingId;
    var response = LF.detail(LD.idOne);
    run(function() {
        addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree});
    });
    var payload = LF.put({id: LD.idOne, addresses: addresses});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        var location = store.find('location', LD.idOne);
        assert.ok(location.get('isNotDirty'));
        assert.equal(location.get('addresses').objectAt(0).get('type'), ATD.shippingId);
        assert.equal(location.get('addresses').objectAt(2).get('type'), ATD.officeId);
        assert.ok(location.get('addresses').objectAt(0).get('isNotDirty'));
    });
});
