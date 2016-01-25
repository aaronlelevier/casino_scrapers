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
import {address_put_payload, new_put_payload} from 'bsrs-ember/tests/helpers/payloads/location';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_URL + '/index';
const LOCATION_NEW_URL = BASE_URL + '/new/1';
const DJANGO_LOCATION_URL = PREFIX + '/admin/locations/';
const DETAIL_URL = BASE_URL + '/' + LD.idOne;
const DJANGO_LOCATION_NEW_URL = PREFIX + DJANGO_LOCATION_URL + LD.idOne + '/';

let application, store, payload, list_xhr, original_uuid;

module('Acceptance | location-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(DJANGO_LOCATION_URL + '?page=1', "GET", null, {}, 200, LOCATION_FIXTURES.empty());
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
        assert.equal(store.find('location').get('length'), 2);
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
        assert.equal(store.find('location').get('length'), 2);
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
    visit(LOCATION_NEW_URL);
    fillIn('.t-location-name', LD.storeName);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
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
    visit(LOCATION_NEW_URL);
    fillIn('.t-location-name', LD.storeName);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 2);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_URL);
            let locations = store.find('location');
            assert.equal(locations.get('length'), 1);
            assert.equal(find('tr.t-grid-data').length, 1);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    visit(LOCATION_NEW_URL);
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('location').get('length'), 1);
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
    visit(LOCATION_NEW_URL);
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
    visit(LOCATION_NEW_URL);
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
    visit(LOCATION_NEW_URL);
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
    visit(LOCATION_NEW_URL);
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
    visit(LOCATION_NEW_URL);
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
    visit(LOCATION_NEW_URL);
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
    visit(LOCATION_NEW_URL);
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
        assert.equal(find('.t-input-multi-address-validation-error:not(:hidden):eq(0)').text().trim(), 'invalid address');
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
        assert.equal(find('.t-input-multi-address-zip-validation-error:not(:hidden):eq(0)').text().trim(), 'invalid postal code');
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

// test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
//     visit(LOCATION_NEW_URL);
//     var phone_numbers = PNF.put({id: PND.idOne, type: PNTD.mobileId});
//     var payload = LF.put({id: LD.idOne, phone_numbers: phone_numbers});
//     fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(),LOCATION_URL);
//     });
// });

// test('when you change a related emails type it will be persisted correctly', (assert) => {
//     visit(LOCATION_NEW_URL);
//     var emails = EF.put({id: ED.idOne, type: ETD.personalId});
//     var payload = LF.put({id: LD.idOne, emails: emails});
//     fillIn('.t-multi-email-type:eq(0)', ETD.personalId);
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(),LOCATION_URL);
//     });
// });

test('when you change a related address type it will be persisted correctly', (assert) => {
    visit(LOCATION_NEW_URL);
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

// test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
//     visit(LOCATION_NEW_URL);
//     fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_URL);
//             var location = store.find('location', LD.idOne);
//             var phone_numbers = store.find('phonenumber', LD.idOne);
//             assert.equal(phone_numbers.source[0].get('type'), PNTD.officeId);
//         });
//     });
// });

// test('when user changes an attribute on email and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
//     visit(LOCATION_NEW_URL);
//     fillIn('.t-multi-email-type:eq(0)', ETD.personalId);
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_URL);
//             var location = store.find('location', LD.idOne);
//             var email = store.find('email', LD.idOne);
//             assert.equal(email.source[0].get('type'), ETD.workId);
//         });
//     });
// });

// test('when user changes an attribute on address and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
//     visit(LOCATION_NEW_URL);
//     fillIn('.t-address-type:eq(0)', ATD.shippingId);
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_URL);
//             var location = store.find('location', LD.idOne);
//             var addresses = store.find('address', LD.idOne);
//             assert.equal(addresses.source[0].get('type'), ATD.officeId);
//         });
//     });
// });

// test('when user removes a phone number clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
//     visit(LOCATION_NEW_URL);
//     click('.t-del-btn:eq(0)');
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_URL);
//             var location = store.find('location', LD.idOne);
//             var phone_numbers = store.find('phonenumber', LD.idOne);
//             assert.equal(phone_numbers.source[0].get('type'), PNTD.officeId);
//         });
//     });
// });

// test('when user removes a email clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
//     visit(LOCATION_NEW_URL);
//     click('.t-del-email-btn:eq(0)');
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_URL);
//             var location = store.find('location', LD.idOne);
//             var emails = store.find('email', LD.idOne);
//             assert.equal(emails.source[0].get('type'), ETD.workId);
//         });
//     });
// });

// test('when user removes an address clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
//     visit(LOCATION_NEW_URL);
//     click('.t-del-address-btn:eq(0)');
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), LOCATION_URL);
//             var location = store.find('location', LD.idOne);
//             var addresses = store.find('address', LD.idOne);
//             assert.equal(addresses.source[0].get('type'), ATD.officeId);
//         });
//     });
// });


// /*LOCATION TO CHILDREN M2M*/
// test('clicking and typing into power select for location will fire off xhr request for all location', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 2);
//         assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//     });
//     let location_endpoint = `${PREFIX}/admin/locations/get-level-children/${LD.idOne}/?name__icontains=a`;
//     let response = LF.search();
//     response.results.push(LF.get(LD.unusedId, LD.apple));
//     xhr(location_endpoint, 'GET', null, {}, 200, response);
//     page.childrenClickDropdown();
//     //testing filter out new flag in repo
//     run(() => {
//         store.push('location', {id: 'testingNewFilter', name: 'watA', new: true});
//     });
//     fillIn(`${CHILDREN_SEARCH}`, 'a');
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_NEW_URL);
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//         assert.equal(page.childrenOptionLength(), 4);
//         assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(1)`).text().trim(), LD.storeNameParent);
//     });
//     page.childrenClickApple();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 3);
//         assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
//         assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
//         assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//         assert.equal(page.childrenTwoSelected().indexOf(LD.storeNameThree), 2);
//         assert.equal(page.childrenThreeSelected().indexOf(LD.apple), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.childrenClickDropdown();
//     fillIn(`${CHILDREN_SEARCH}`, '');
//     andThen(() => {
//         assert.equal(page.childrenOptionLength(), 1);
//         assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
//     });
//     fillIn(`${CHILDREN_SEARCH}`, 'a');
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 3);
//         assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
//         assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
//         assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//         assert.equal(page.childrenTwoSelected().indexOf(LD.storeNameThree), 2);
//         assert.equal(page.childrenThreeSelected().indexOf(LD.apple), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     //search specific children
//     page.childrenClickDropdown();
//     let location_endpoint_2 = `${PREFIX}/admin/locations/get-level-children/${LD.idOne}/?name__icontains=BooNdocks`;
//     let response_2 = LF.list();
//     response_2.results.push(LF.get('abc123', LD.boondocks));
//     xhr(location_endpoint_2, 'GET', null, {}, 200, response_2);
//     fillIn(`${CHILDREN_SEARCH}`, 'BooNdocks');
//     andThen(() => {
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//         assert.equal(page.childrenOptionLength(), 1);
//         assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), LD.boondocks);
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 3);
//         assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
//         assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
//         assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//         assert.equal(page.childrenTwoSelected().indexOf(LD.storeNameThree), 2);
//         assert.equal(page.childrenThreeSelected().indexOf(LD.apple), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.childrenClickOptionOne();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 4);
//         assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
//         assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
//         assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
//         assert.equal(location.get('children').objectAt(3).get('name'), LD.boondocks);
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//         assert.equal(page.childrenTwoSelected().indexOf(LD.storeNameThree), 2);
//         assert.equal(page.childrenThreeSelected().indexOf(LD.apple), 2);
//         assert.equal(page.childrenFourSelected().indexOf(LD.boondocks), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     let response_put = LF.detail(LD.idOne);
//     let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree, LD.unusedId, 'abc123']});
//     xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });

// test('can remove and add back same children and save empty children', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 2);
//         assert.ok(location.get('childrenIsNotDirty'));
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//     });
//     page.childrenOneRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 1);
//         assert.ok(location.get('childrenIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     let location_endpoint = `${PREFIX}/admin/locations/get-level-children/${LD.idOne}/?name__icontains=a`;
//     xhr(location_endpoint, 'GET', null, {}, 200, LF.search());
//     fillIn(`${CHILDREN_SEARCH}`, 'a');
//     andThen(() => {
//         assert.equal(page.childrenOptionLength(), 3);
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('location_children_fks').length, 2);
//         assert.equal(location.get('children').get('length'), 1);
//         assert.ok(location.get('childrenIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.childrenClickOptionStoreNameOne();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('location_children_fks').length, 2);
//         assert.equal(location.get('children').get('length'), 2);
//         assert.ok(location.get('childrenIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.childrenOneRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 1);
//         assert.ok(location.get('childrenIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     location_endpoint = `${PREFIX}/admin/locations/get-level-children/${LD.idOne}/?name__icontains=d`;
//     xhr(location_endpoint, 'GET', null, {}, 200, LF.search());
//     fillIn(`${CHILDREN_SEARCH}`, 'd');
//     page.childrenClickOptionStoreNameTwo();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('location_children_fks').length, 2);
//         assert.equal(location.get('children').get('length'), 2);
//         assert.ok(location.get('childrenIsNotDirty'));
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//     });
//     let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree]});
//     xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });

// test('starting with multiple children, can remove all children (while not populating options) and add back', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 2);
//         assert.equal(location.get('location_children_fks').length, 2);
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//     });
//     page.childrenTwoRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 1);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//     });
//     page.childrenOneRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 0);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     let location_endpoint = `${PREFIX}/admin/locations/get-level-children/${LD.idOne}/?name__icontains=d`;
//     xhr(location_endpoint, 'GET', null, {}, 200, LF.search());
//     fillIn(`${CHILDREN_SEARCH}`, 'd');
//     page.childrenClickOptionStoreNameTwo();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 1);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//     });
//     location_endpoint = `${PREFIX}/admin/locations/get-level-children/${LD.idOne}/?name__icontains=g`;
//     xhr(location_endpoint, 'GET', null, {}, 200, LF.search());
//     fillIn(`${CHILDREN_SEARCH}`, 'g');
//     page.childrenClickOptionStoreNameThree();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('children').get('length'), 2);
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//     });
//     let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree]});
//     ajax(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });

// test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
//     page.visitDetail();
//     page.childrenClickDropdown();
//     fillIn(`${CHILDREN_SEARCH}`, ' ');
//     andThen(() => {
//         assert.equal(page.childrenSelected().indexOf(LD.storeNameTwo), 2);
//         assert.equal(page.childrenOptionLength(), 1);
//         assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.no_results);
//     });
//     let response = LF.detail(LD.idOne);
//     let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree]});
//     xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });

// /*PARENTS*/
// test('clicking and typing into power select for location will fire off xhr request for all location', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 2);
//         assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//     });
//     let location_endpoint = `${PREFIX}/admin/locations/get-level-parents/${LD.idOne}/?name__icontains=a`;
//     let response = LF.search();
//     response.results.push(LF.get(LD.unusedId, LD.apple));
//     xhr(location_endpoint, 'GET', null, {}, 200, response);
//     page.parentsClickDropdown();
//     //testing filter out new flag in repo
//     run(() => {
//         store.push('location', {id: 'testingNewFilter', name: 'watA', new: true});
//     });
//     fillIn(`${PARENTS_SEARCH}`, 'a');
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_NEW_URL);
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//         assert.equal(page.parentsOptionLength(), 4);
//         assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(1)`).text().trim(), LD.storeNameParent);
//     });
//     page.parentsClickApple();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 3);
//         assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
//         assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
//         assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//         assert.equal(page.parentsTwoSelected().indexOf(LD.storeNameParentTwo), 2);
//         assert.equal(page.parentsThreeSelected().indexOf(LD.apple), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.parentsClickDropdown();
//     fillIn(`${PARENTS_SEARCH}`, '');
//     andThen(() => {
//         assert.equal(page.parentsOptionLength(), 1);
//         assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
//     });
//     fillIn(`${PARENTS_SEARCH}`, 'a');
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 3);
//         assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
//         assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
//         assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//         assert.equal(page.parentsTwoSelected().indexOf(LD.storeNameParentTwo), 2);
//         assert.equal(page.parentsThreeSelected().indexOf(LD.apple), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     //search specific parents
//     page.parentsClickDropdown();
//     let location_endpoint_2 = `${PREFIX}/admin/locations/get-level-parents/${LD.idOne}/?name__icontains=BooNdocks`;
//     let response_2 = LF.list();
//     response_2.results.push(LF.get('abc123', LD.boondocks));
//     xhr(location_endpoint_2, 'GET', null, {}, 200, response_2);
//     fillIn(`${PARENTS_SEARCH}`, 'BooNdocks');
//     andThen(() => {
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//         assert.equal(page.parentsOptionLength(), 1);
//         assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), LD.boondocks);
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 3);
//         assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
//         assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
//         assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//         assert.equal(page.parentsTwoSelected().indexOf(LD.storeNameParentTwo), 2);
//         assert.equal(page.parentsThreeSelected().indexOf(LD.apple), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.parentsClickOptionOne();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 4);
//         assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
//         assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
//         assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
//         assert.equal(location.get('parents').objectAt(3).get('name'), LD.boondocks);
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//         assert.equal(page.parentsTwoSelected().indexOf(LD.storeNameParentTwo), 2);
//         assert.equal(page.parentsThreeSelected().indexOf(LD.apple), 2);
//         assert.equal(page.parentsFourSelected().indexOf(LD.boondocks), 2);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     let response_put = LF.detail(LD.idOne);
//     let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo, LD.unusedId, 'abc123']});
//     xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });

// test('can remove and add back same parents and save empty parents', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 2);
//         assert.ok(location.get('parentsIsNotDirty'));
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//     });
//     page.parentsTwoRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 1);
//         assert.ok(location.get('parentsIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     let location_endpoint = `${PREFIX}/admin/locations/get-level-parents/${LD.idOne}/?name__icontains=a`;
//     xhr(location_endpoint, 'GET', null, {}, 200, LF.search());
//     fillIn(`${PARENTS_SEARCH}`, 'a');
//     andThen(() => {
//         assert.equal(page.parentsOptionLength(), 3);
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('location_parents_fks').length, 2);
//         assert.equal(location.get('parents').get('length'), 1);
//         assert.ok(location.get('parentsIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.parentsClickOptionStoreNameOne();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('location_parents_fks').length, 2);
//         assert.equal(location.get('parents').get('length'), 2);
//         assert.ok(location.get('parentsIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     page.parentsOneRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 1);
//         assert.ok(location.get('parentsIsDirty'));
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     location_endpoint = `${PREFIX}/admin/locations/get-level-parents/${LD.idOne}/?name__icontains=p`;
//     xhr(location_endpoint, 'GET', null, {}, 200, LF.search());
//     fillIn(`${PARENTS_SEARCH}`, 'p');
//     page.parentsClickOptionStoreNameTwo();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('location_parents_fks').length, 2);
//         assert.equal(location.get('parents').get('length'), 2);
//         assert.ok(location.get('parentsIsNotDirty'));
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//     });
//     let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo]});
//     xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });

// test('starting with multiple parents, can remove all parents (while not populating options) and add back', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 2);
//         assert.equal(location.get('location_parents_fks').length, 2);
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//     });
//     page.parentsTwoRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 1);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//     });
//     page.parentsOneRemove();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 0);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//     });
//     let location_endpoint = `${PREFIX}/admin/locations/get-level-parents/${LD.idOne}/?name__icontains=p`;
//     xhr(location_endpoint, 'GET', null, {}, 200, LF.search());
//     fillIn(`${PARENTS_SEARCH}`, 'p');
//     page.parentsClickOptionStoreNameTwo();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 1);
//         assert.ok(location.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParentTwo), 2);
//     });
//     fillIn(`${PARENTS_SEARCH}`, 'p');
//     page.parentsClickOptionStoreNameFirst();
//     andThen(() => {
//         let location = store.find('location', LD.idOne);
//         assert.equal(location.get('parents').get('length'), 2);
//         assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//     });
//     let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo]});
//     ajax(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });

// test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
//     page.visitDetail();
//     page.parentsClickDropdown();
//     fillIn(`${PARENTS_SEARCH}`, ' ');
//     andThen(() => {
//         assert.equal(page.parentsSelected().indexOf(LD.storeNameParent), 2);
//         assert.equal(page.parentsOptionLength(), 1);
//         assert.equal(find(`${PARENTS_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.no_results);
//     });
//     let response = LF.detail(LD.idOne);
//     let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo]});
//     xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_URL);
//     });
// });
