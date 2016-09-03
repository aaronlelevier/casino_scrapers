import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
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
import CD from 'bsrs-ember/vendor/defaults/country';
import CF from 'bsrs-ember/vendor/country_fixtures';
import SD from 'bsrs-ember/vendor/defaults/state';
import SF from 'bsrs-ember/vendor/state_fixtures';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location';
import random from 'bsrs-ember/models/random';
import { options, multiple_options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${LD.idOne}`;
const LOCATION_PUT_URL = PREFIX + DETAIL_URL + '/';

let store, list_xhr, url;

const CHILDREN = '.t-location-children-select';
const CHILDREN_DROPDOWN = '.ember-basic-dropdown-content > .ember-power-select-options';
const PARENTS = '.t-location-parent-select';
const PARENTS_MULTIPLE_OPTION = `.t-location-parent-select .ember-power-select-trigger > .ember-power-select-multiple-options`;

moduleForAcceptance('Acceptance | location detail-test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    let location_list_data = LF.list();
    let location_detail_data = LF.detail();
    list_xhr = xhr(`${LOCATIONS_URL}?page=1`, 'GET', null, {}, 200, location_list_data);
    xhr(`${LOCATIONS_URL}${LD.idOne}/`, 'GET', null, {}, 200, location_detail_data);
    url = `${PREFIX}${DETAIL_URL}/`;
  },
});

test('clicking on a locations name will redirect them to the detail view', (assert) => {
  page.visit();
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
  page.visitDetail();
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
    assert.equal(find('.t-address-type-select:eq(0)').text().trim(), t(ATD.officeName));
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-address').val(), AD.streetOne);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city').val(), AD.cityOne);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code').val(), AD.zipOne);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').text().trim(), CD.name);
    assert.equal(find('.t-address-type-select:eq(1)').text().trim(), t(ATD.shippingName));
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-address').val(), AD.streetTwo);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city').val(), AD.cityTwo);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code').val(), AD.zipTwo);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').text().trim(), CD.nameTwo);
    assert.equal(page.statusInput, t(LDS.openName));
  });
  fillIn('.t-location-name', LD.storeNameTwo);
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.statusClickDropdown();
  andThen(() => {
    assert.equal(page.statusOptionLength, 3);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('status_fk'), LDS.openId);
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.ok(location.get('statusIsNotDirty'));
  });
  page.statusClickOptionTwo();
  andThen(() => {
    assert.equal(page.statusOptionLength, 0);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('status_fk'), LDS.openId);
    assert.equal(location.get('status.id'), LDS.closedId);
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.ok(location.get('statusIsDirty'));
  });
  let list = LF.list();
  list.results[0].name = LD.storeNameTwo;
  xhr(LOCATIONS_URL + '?page=1', 'GET', null, {}, 200, list);
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
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(),DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(list_xhr);
  page.visitDetail();
  fillIn('.t-location-name', LD.storeNameTwo);
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionTwo();
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
      assert.equal(find('.t-location-name').val(), LD.storeNameTwo);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  fillIn('.t-location-name', LD.storeNameTwo);
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionTwo();
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      let location = store.find('location', LD.idOne);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

/* jshint ignore:start */
test('when click delete, modal displays and when click ok, location is deleted and removed from store', async assert => {
  await page.visitDetail();
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'location'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${PREFIX}${BASE_URL}/${LD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      assert.equal(store.find('location', LD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});
/* jshint ignore:end */

test('changing location level will update related location level locations array and clear out parent and children power selects', (assert) => {
  page.visitDetail();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    let location_level = store.find('location-level', LLD.idOne);
    let location_level_two = store.find('location-level', LLD.idThree);
    assert.deepEqual(location_level_two.get('locations'), []);
    assert.equal(location.get('location_level_fk'), LLD.idOne);
    assert.deepEqual(location_level.get('locations'), [LD.idZero, LD.idOne, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
    assert.equal(page.locationLevelInput.split(' +')[0].trim().split(' ')[0], LLD.nameCompany);
    assert.equal(find(`${PARENTS_MULTIPLE_OPTION} > li`).length, 2);
  });
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionLossRegion();
  andThen(() => {
    let location_level_two = store.find('location-level', LLD.idLossRegion);
    let location_level = store.find('location-level', LLD.idOne);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('location_level_fk'), LLD.idOne);
    assert.deepEqual(location_level_two.get('locations'), [LD.idOne]);
    assert.deepEqual(location_level.get('locations'), [LD.idZero, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.ok(location_level.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location_level_two.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('parents').get('length'), 0);
    assert.equal(location.get('children').get('length'), 0);
    //TODO: this is not working
    // assert.equal(find(`${PARENTS_MULTIPLE_OPTION} > li`).length, 1);
  });
  let response = LF.detail(LD.idOne);
  let payload = LF.put({location_level: LLD.idLossRegion, parents: [], children: []});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

/* PHONE NUMBER AND ADDRESS AND EMAILS*/
test('newly added phone numbers without a valid number are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(store.find('phonenumber').get('length'), 2);
  });
  click('.t-btn-add:eq(0)');
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
    assert.equal(store.find('phonenumber').get('length'), 2);
  });
});

test('newly added email without a valid email are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
  page.visitDetail();
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
    assert.equal(store.find('email').get('length'), 2);
  });
});

test('newly added addresses without a valid name are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
  page.visitDetail();
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
    assert.equal(store.find('address').get('length'), 2);
  });
});

test('phone numbers without a valid number are ignored and removed on save', (assert) => {
  page.visitDetail();
  click('.t-btn-add:eq(0)');
  andThen(() => {
    let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
    assert.equal(visible_errors.length, 0);
  });
  fillIn('.t-new-entry:eq(2)', '34');
  andThen(() => {
    let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
    assert.equal(visible_errors.length, 1);
    assert.equal(find('.t-input-multi-phone-validation-format-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_ph);
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
  page.visitDetail();
  click('.t-add-email-btn:eq(0)');
  andThen(() => {
    let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
    assert.equal(visible_errors.length, 0);
  });
  fillIn('.t-new-entry:eq(4)', '34');
  andThen(() => {
    let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
    assert.equal(visible_errors.length, 1);
    assert.equal(find('.t-input-multi-email-validation-format-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_email);
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

test('address without a valid address or zip code are ignored and removed on save', (assert) => {
  page.visitDetail();
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
    assert.equal(find('.t-input-multi-address-validation-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_street);
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
    assert.equal(find('.t-input-multi-address-zip-validation-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_zip);
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
  page.visitDetail();
  var phone_numbers = PNF.put({id: PND.idOne, type: PNTD.mobileId});
  var payload = LF.put({id: LD.idOne, phone_numbers: phone_numbers});
  fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

test('when you change a related emails type it will be persisted correctly', (assert) => {
  page.visitDetail();
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
  page.visitDetail();
  var addresses = AF.put({id: AD.idOne, type: ATD.shippingId});
  var payload = LF.put({id: LD.idOne, addresses: addresses});
  xhr(url,'PUT',JSON.stringify(payload),{},200);
  selectChoose('.t-address-type-select:eq(0)', ATD.shippingNameText);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  page.visitDetail();
  fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      var location = store.find('location', LD.idOne);
      var phone_numbers = store.find('phonenumber', LD.idOne);
      assert.equal(phone_numbers._source[0].get('type'), PNTD.officeId);
    });
  });
});

test('when user changes an attribute on email and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  page.visitDetail();
  fillIn('.t-multi-email-type:eq(0)', ETD.personalId);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      var location = store.find('location', LD.idOne);
      var email = store.find('email', LD.idOne);
      assert.equal(email._source[0].get('type'), ETD.workId);
    });
  });
});

test('when user changes an attribute on address and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  page.visitDetail();
  selectChoose('.t-address-type-select:eq(0)', ATD.shippingNameText);
  andThen(() => {
    assert.equal(page.addressTypeSelectedOne, ATD.shippingNameText);
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      assert.equal(store.find('location', LD.idOne).get('addresses').objectAt(0).get('address_type.id'), ATD.idOne);
    });
  });
});

test('when user removes a phone number clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  page.visitDetail();
  click('.t-del-btn:eq(0)');
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      var location = store.find('location', LD.idOne);
      var phone_numbers = store.find('phonenumber', LD.idOne);
      assert.equal(phone_numbers._source[0].get('type'), PNTD.officeId);
    });
  });
});

test('when user removes a email clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  page.visitDetail();
  click('.t-del-email-btn:eq(0)');
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      var location = store.find('location', LD.idOne);
      var emails = store.find('email', LD.idOne);
      assert.equal(emails._source[0].get('type'), ETD.workId);
    });
  });
});

test('when user removes an address clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(store.find('location', LD.idOne).get('addresses').get('length'), 2);
  });
  click('.t-del-address-btn:eq(0)');
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_URL);
      assert.equal(store.find('location', LD.idOne).get('addresses').get('length'), 2);
    });
  });
});

test('when you deep link to the location detail view you can remove a new phone number', (assert) => {
  page.visitDetail();
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
  page.visitDetail();
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
  page.visitDetail();
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

test('when you deep link to the location detail view you can change the phone number type and add a new phone number', (assert) => {
  random.uuid = function() { return UUID.value; };
  page.visitDetail();
  fillIn('.t-input-multi-phone select:eq(0)', PNTD.mobileId);
  click('.t-btn-add:eq(0)');
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
  page.visitDetail();
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
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  click('.t-add-address-btn:eq(0)');
  selectChoose('.t-address-type-select:eq(2)', ATD.officeNameText);
  fillIn('.t-address-address:eq(2)', AD.streetThree);
  andThen(() => {
    assert.equal(page.addressTypeSelectedThree, ATD.officeNameText);
  });
  var addresses = AF.put({id: AD.idOne, type: ATD.idOne});
  var response = LF.detail(LD.idOne);
  run(function() {
    addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree});
  });
  var payload = LF.put({id: LD.idOne, status: LD.status, addresses: addresses});
  xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
    var location = store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('addresses').objectAt(2).get('type'), ATD.officeId);
    assert.ok(location.get('addresses').objectAt(0).get('isNotDirty'));
  });
});

/*LOCATION TO CHILDREN M2M*/
test('clicking and typing into power select for location will fire off xhr request for all locations children', (assert) => {
  page.visitDetail();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.apple), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(CHILDREN, 'a');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
    assert.equal(page.childrenOptionLength, 3);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(1)`).text().trim(), LD.storeNameParent);
  });
  page.childrenClickApple();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 3);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
    assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
    assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
    assert.equal(page.childrenTwoSelected.indexOf(LD.storeNameThree), 2);
    assert.equal(page.childrenThreeSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  selectSearch(CHILDREN, '');
  andThen(() => {
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  selectSearch(CHILDREN, 'a');
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 3);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
    assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
    assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
    assert.equal(page.childrenTwoSelected.indexOf(LD.storeNameThree), 2);
    assert.equal(page.childrenThreeSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  //search specific children
  let location_endpoint_2 = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=BooNdocks/`;
  let response_2 = { 'results': [LF.get_no_related('abc123', LD.boondocks)] };
  xhr(location_endpoint_2, 'GET', null, {}, 200, response_2);
  selectSearch(CHILDREN, 'BooNdocks');
  andThen(() => {
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), LD.boondocks);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 3);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
    assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
    assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
    assert.equal(page.childrenTwoSelected.indexOf(LD.storeNameThree), 2);
    assert.equal(page.childrenThreeSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.childrenClickOptionOne();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 4);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
    assert.equal(location.get('children').objectAt(1).get('name'), LD.storeNameThree);
    assert.equal(location.get('children').objectAt(2).get('name'), LD.apple);
    assert.equal(location.get('children').objectAt(3).get('name'), LD.boondocks);
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
    assert.equal(page.childrenTwoSelected.indexOf(LD.storeNameThree), 2);
    assert.equal(page.childrenThreeSelected.indexOf(LD.apple), 2);
    assert.equal(page.childrenFourSelected.indexOf(LD.boondocks), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let response_put = LF.detail(LD.idOne);
  let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree, LD.unusedId, 'abc123']});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('can remove and add back same children and save empty children', (assert) => {
  page.visitDetail();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('childrenIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.childrenOneRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('childrenIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.baseStoreName), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(CHILDREN, 'a');
  andThen(() => {
    assert.equal(page.childrenOptionLength, 3);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('location_children_fks').length, 2);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('childrenIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.childrenClickOptionStoreNameOne();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('location_children_fks').length, 2);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('childrenIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.childrenTwoRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('childrenIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=d/`;
  xhr(location_endpoint, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch(CHILDREN, 'd');
  page.childrenClickOptionStoreNameTwo();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('location_children_fks').length, 2);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('childrenIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
  let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree]});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('starting with multiple children, can remove all children (while not populating options) and add back', (assert) => {
  page.visitDetail();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.equal(location.get('location_children_fks').length, 2);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  page.childrenTwoRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  page.childrenOneRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 0);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=d/`;
  xhr(location_endpoint, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch(CHILDREN, 'd');
  page.childrenClickOptionStoreNameTwo();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=g/`;
  const response = LF.search_power_select();
  response.results.push(LF.get(LD.idThree, LD.storeNameThree));
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(CHILDREN, 'g');
  page.childrenClickOptionStoreNameThree();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree]});
  ajax(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
  page.visitDetail();
  page.childrenClickDropdown();
  selectSearch(CHILDREN, '');
  andThen(() => {
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
    assert.equal(page.childrenOptionLength, 1);
    assert.equal(find(`${CHILDREN_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  let response = LF.detail(LD.idOne);
  let payload = LF.put({id: LD.idOne, children: [LD.idTwo, LD.idThree]});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

/*PARENTS*/
test('clicking and typing into power select for location will fire off xhr request for all location parents', (assert) => {
  page.visitDetail();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${LD.idOne}/location__icontains=a/`;
  let response = { 'results': [LF.get_no_related(LD.unusedId, LD.apple), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  page.parentsClickDropdown();
  selectSearch(PARENTS, 'a');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsOptionLength, 3);
    assert.equal(find(`${options} > li:eq(1)`).text().trim(), LD.storeNameParent);
  });
  page.parentsClickApple();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 3);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
    assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
    assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsTwoSelected.indexOf(LD.storeNameParentTwo), 2);
    assert.equal(page.parentsThreeSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  selectSearch(PARENTS, '');
  andThen(() => {
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${options} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  selectSearch(PARENTS, 'a');
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 3);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
    assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
    assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsTwoSelected.indexOf(LD.storeNameParentTwo), 2);
    assert.equal(page.parentsThreeSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  //search specific parents
  let location_endpoint_2 = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${LD.idOne}/location__icontains=BooNdocks/`;
  let response_2 = {'results': [LF.get_no_related('abc123', LD.boondocks)]};
  xhr(location_endpoint_2, 'GET', null, {}, 200, response_2);
  selectSearch(PARENTS, 'BooNdocks');
  andThen(() => {
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${options} > li:eq(0)`).text().trim(), LD.boondocks);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 3);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
    assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
    assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsTwoSelected.indexOf(LD.storeNameParentTwo), 2);
    assert.equal(page.parentsThreeSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.parentsClickOptionOne();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 4);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
    assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
    assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
    assert.equal(location.get('parents').objectAt(3).get('name'), LD.boondocks);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsTwoSelected.indexOf(LD.storeNameParentTwo), 2);
    assert.equal(page.parentsThreeSelected.indexOf(LD.apple), 2);
    assert.equal(page.parentsFourSelected.indexOf(LD.boondocks), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let response_put = LF.detail(LD.idOne);
  let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo, LD.unusedId, 'abc123']});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('can remove and add back same parents and save empty parents', (assert) => {
  page.visitDetail();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('parentsIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.parentsTwoRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('parentsIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${LD.idOne}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.baseStoreName), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(PARENTS, 'a');
  andThen(() => {
    assert.equal(page.parentsOptionLength, 3);
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('parentsIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.parentsClickOptionStoreNameOne();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('parentsIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.parentsTwoRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('parentsIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${LD.idOne}/location__icontains=p/`;
  response = LF.search_power_select();
  response.results.push(...[LF.get_no_related(LD.unusedId, LD.baseStoreName), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]);
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(PARENTS, 'p');
  page.parentsClickOptionStoreNameTwo();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('parentsIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
  let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo]});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('starting with multiple parents, can remove all parents (while not populating options) and add back', (assert) => {
  page.visitDetail();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  page.parentsTwoRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  page.parentsOneRemove();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 0);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${LD.idOne}/location__icontains=p/`;
  let response = LF.search_power_select();
  response.results.push(...[LF.get_no_related(LD.unusedId, LD.baseStoreName), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]);
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(PARENTS, 'p');
  page.parentsClickOptionStoreNameTwo();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParentTwo), 2);
  });
  selectSearch(PARENTS, 'p');
  page.parentsClickOptionStoreNameFirst();
  andThen(() => {
    let location = store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo]});
  ajax(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('clicking and typing into power select for location will not filter if spacebar pressed', (assert) => {
  page.visitDetail();
  page.parentsClickDropdown();
  selectSearch(PARENTS, '');
  andThen(() => {
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${options} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  let response = LF.detail(LD.idOne);
  let payload = LF.put({id: LD.idOne, parents: [LD.idParent, LD.idParentTwo]});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('fill out an address for a Person including Country and State', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  click('.t-del-address-btn:eq(0)');
  andThen(() => {
    // # of delete button's is the # of address input widgets
    assert.equal(Ember.$('.t-del-address-btn').length, 1);
  });
  page.addressAddressFill(AD.streetOne);
  page.addressCityFill(AD.cityOne);
  page.addressPostalCodeFill(AD.zipOne);
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
  // // PUT
  let payload = LF.put({id: LD.idOne, status: LDS.openId});
  payload.addresses.splice(1,1);
  payload.addresses[0] = {
    id: AD.idTwo,
    type: ATD.idTwo,
    address: AD.streetOne,
    city: AD.cityOne,
    state: stateId,
    postal_code: AD.zipOne,
    country: countryId,
  };
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});
  