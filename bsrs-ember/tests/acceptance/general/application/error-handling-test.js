import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location';
import trim from 'bsrs-ember/utilities/trim';

const PREFIX = config.APP.NAMESPACE;
const LOC_URL = BASEURLS.base_locations_url;
const LOCATION_URL = `${LOC_URL}/index`;
const DETAIL_URL = `${LOC_URL}/${LD.idOne}`;
const LOCATION_NEW_URL = `${LOC_URL}/new/1`;
const DJANGO_LOCATION_URL = `${PREFIX}/admin/locations/`;

var application, store, payload, new_xhr, list_xhr, originalLoggerError, originalTestAdapterException;

moduleForAcceptance('Acceptance | error handling test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    new_xhr = xhr(DJANGO_LOCATION_URL + '?page=1', "GET", null, {}, 200, LF.empty());
    payload = {id: UUID.value, name: LD.storeName, number: LD.storeNumber, status: LD.status, location_level: LLD.idOne, children: [], parents: [], emails: [], phone_numbers: [], addresses: []};
    originalLoggerError = Ember.Logger.error;
    originalTestAdapterException = Ember.Test.adapter.exception;
    Ember.Logger.error = function() {};
    Ember.Test.adapter.exception = function() {};
  },
  afterEach() {
    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalTestAdapterException;
    
  }
});

// test('xhr with a 400 status code will show up in the form and display django error', (assert) => {
//     visit(LOCATION_URL);
//     click('.t-add-new');
//     fillIn('.t-location-name', LD.storeName);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_NEW_URL);
//     });
//     fillIn('.t-location-number', LD.storeNumber);
//     page.locationLevelClickDropdown();
//     page.locationLevelClickOptionOne();
//     page.statusClickDropdown();
//     page.statusClickOptionOne();
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//         assert.ok(find('.t-number-validation-error').is(':hidden'));
//         assert.ok(find('.t-location-level-validation-error').is(':hidden'));
//     });
//     const exception = `A Location exists with these values: {\'number\': ${LD.storeNumber}}.`;
//     ajax(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 400, {'non_field_errors':[exception]});
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_NEW_URL);
//         assert.ok(find('.t-ajax-error').is(':visible'));
//         assert.equal(find('.t-ajax-error').text().trim(), exception);
//         assert.ok(!find('.t-application-error').is(':visible'));
//         assert.equal(find('.t-application-error').text().trim(), '');
//     });
// });

// test('xhr with a 400 status code shows multiple errors and will clear any previous django error', (assert) => {
//     visit(LOCATION_URL);
//     click('.t-add-new');
//     fillIn('.t-location-name', LD.storeName);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_NEW_URL);
//     });
//     fillIn('.t-location-number', LD.storeNumber);
//     page.locationLevelClickDropdown();
//     page.locationLevelClickOptionOne();
//     page.statusClickDropdown();
//     page.statusClickOptionOne();
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//         assert.ok(find('.t-number-validation-error').is(':hidden'));
//         assert.ok(find('.t-location-level-validation-error').is(':hidden'));
//     });
//     const exception = `A Location exists with these values: {\'number\': ${LD.storeNumber}}.`;
//     ajax(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 400, {'non_field_errors':[exception]});
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_NEW_URL);
//         assert.ok(find('.t-ajax-error').is(':visible'));
//         assert.equal(find('.t-ajax-error').text().trim(), exception);
//     });
//     const exception_two = 'second error';
//     const exception_three = 'broken thing';
//     ajax(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 400, {'non_field_errors':[exception_two], 'other_thing': exception_three});
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), LOCATION_NEW_URL);
//         assert.ok(find('.t-ajax-error').is(':visible'));
//         assert.equal(trim(find('.t-ajax-error').text().trim()), `${exception_two} ${exception_three}`);
//     });
// });

//test('xhr with a 500 status code will not show up in the form and or display django error', (assert) => {
//    visit(LOCATION_URL);
//    click('.t-add-new');
//    fillIn('.t-location-name', LD.storeName);
//    generalPage.save();
//    andThen(() => {
//        assert.equal(currentURL(), LOCATION_NEW_URL);
//    });
//    fillIn('.t-location-number', LD.storeNumber);
//    page.locationLevelClickDropdown();
//    page.locationLevelClickOptionOne();
//    page.statusClickDropdown();
//    page.statusClickOptionOne();
//    andThen(() => {
//        assert.ok(find('.t-name-validation-error').is(':hidden'));
//        assert.ok(find('.t-number-validation-error').is(':hidden'));
//        assert.ok(find('.t-location-level-validation-error').is(':hidden'));
//    });
//    const exception = `A Location exists with these values: {\'number\': ${LD.storeNumber}}.`;
//    ajax(DJANGO_LOCATION_URL, 'POST', JSON.stringify(payload), {}, 500, {'non_field_errors':[exception]});
//    generalPage.save();
//    andThen(() => {
//        assert.equal(currentURL(), LOCATION_NEW_URL);
//        assert.ok(!find('.t-ajax-error').is(':visible'));
//        assert.equal(find('.t-ajax-error').text().trim(), '');
//        //TODO: bubble up to a component or the application route
//        // assert.ok(find('.t-application-error').is(':visible'));
//        // assert.equal(find('.t-application-error').text().trim(), exception);
//    });
//});

test('xhr with a 404 status code will show up in the error component and transition to 404 page', (assert) => {
  clearxhr(new_xhr);
  const exception = `This record does not exist.`;
  let json = [LF.generate_list(LD.unusedId)];
  let response = {'count':1,'next':null,'previous':null,'results': json};
  const endpoint = `${PREFIX}${LOC_URL}/`;
  list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, response);
  visit(LOCATION_URL);
  xhr(`${endpoint}${LD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});

test('deep linking with an xhr with a 404 status code will show up in the error component', (assert) => {
  clearxhr(new_xhr);
  const exception = `This record does not exist.`;
  const endpoint = `${PREFIX}${LOC_URL}/`;
  xhr(`${endpoint}${LD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
