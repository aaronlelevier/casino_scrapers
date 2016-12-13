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
import { POWER_SELECT_OPTIONS, multiple_options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${LD.idOne}`;
const LOCATION_PUT_URL = PREFIX + DETAIL_URL + '/';

let list_xhr, url;

const CHILDREN = '.t-location-children-select';
const CHILDREN_DROPDOWN = '.ember-basic-dropdown-content > .ember-power-select-options';
const PARENTS = '.t-location-parent-select';
const PARENTS_MULTIPLE_OPTION = `.t-location-parent-select .ember-power-select-trigger > .ember-power-select-multiple-options`;

moduleForAcceptance('Acceptance | general location detail-test', {
  beforeEach() {
    let location_list_data = LF.list();
    let location_detail_data = LF.detail();
    list_xhr = xhr(`${LOCATIONS_URL}?page=1`, 'GET', null, {}, 200, location_list_data);
    xhr(`${LOCATIONS_URL}${LD.idOne}/`, 'GET', null, {}, 200, location_detail_data);
    url = `${PREFIX}${DETAIL_URL}/`;
  },
});

test('clicking on a locations name will redirect them to the detail view', function(assert) {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    assert.equal(find('.t-nav-admin-location').hasClass('active'), true);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-nav-admin-location').hasClass('active'), true);
  });
});

test('visiting admin/location', function(assert) {
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(document.title,  t('doctitle.location.single', { name: 'ABC123' }));
    let location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('location_level').get('id'), LLD.idOne);
    assert.equal(find('.t-location-name').val(), LD.baseStoreName);
    assert.equal(find('.t-location-number').val(), LD.storeNumber);
    // email
    assert.equal(find('.t-email-type-select:eq(0)').text().trim(), t(ETD.personalName));
    assert.equal(find('.t-email-type-select:eq(1)').text().trim(), t(ETD.workName));
    assert.equal(find('.t-input-multi-email').find('input').length, 2);
    assert.equal(find('.t-input-multi-email').find('input:eq(0)').val(), ED.emailOne);
    assert.equal(find('.t-input-multi-email').find('input:eq(1)').val(), ED.emailTwo);
    // phone
    assert.equal(find('.t-phone-number-type-select:eq(0)').text().trim(), t(PNTD.officeName));
    assert.equal(find('.t-phone-number-type-select:eq(1)').text().trim(), t(PNTD.mobileName));
    assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), PND.numberOne);
    assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), PND.numberTwo);
    // address
    assert.equal(find('.t-input-multi-address').find('.t-address-group').length, 2);
    assert.equal(find('.t-address-type-select:eq(0)').text().trim(), t(ATD.officeName));
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-address0').val(), AD.streetOne);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city0').val(), AD.cityOne);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code0').val(), AD.zipOne);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').text().trim(), CD.name);
    // assert.equal(find('.t-address-type-select:eq(1)').text().trim(), t(ATD.shippingName));
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-address1').val(), AD.streetTwo);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city1').val(), AD.cityTwo);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code1').val(), AD.zipTwo);
    assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').text().trim(), CD.nameTwo);
    assert.equal(page.statusInput, t(LDS.openName));
  });
  fillIn('.t-location-name', LD.storeNameTwo);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.statusClickDropdown();
  andThen(() => {
    assert.equal(page.statusOptionLength, 3);
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('status_fk'), LDS.openId);
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.ok(location.get('statusIsNotDirty'));
  });
  selectChoose('.t-location-status-select', LDS.closedNameTranslated);
  andThen(() => {
    assert.equal(page.statusOptionLength, 0);
    let location  = this.store.find('location', LD.idOne);
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
    let location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
  });
});

test('clicking cancel button will take from detail view to list view', function(assert) {
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
    let location  = this.store.find('location', LD.idOne);
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', function(assert) {
  clearxhr(list_xhr);
  page.visitDetail();
  fillIn('.t-location-name', LD.storeNameTwo);
  selectChoose('.t-location-level-select', LLD.nameRegion);
  selectChoose('.t-location-level-select', LLD.nameRegion);
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

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', function(assert) {
  page.visitDetail();
  fillIn('.t-location-name', LD.storeNameTwo);
  selectChoose('.t-location-level-select', LLD.nameRegion);
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
      let location  = this.store.find('location', LD.idOne);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

/* jshint ignore:start */
test('when click delete, modal displays and when click ok, location is deleted and removed from store', async function(assert) {
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
      assert.equal( this.store.find('location', LD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});
/* jshint ignore:end */

test('changing location level will update related location level locations array and clear out parent and children power selects', function(assert) {
  page.visitDetail();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    let location_level  = this.store.find('location-level', LLD.idOne);
    let location_level_two  = this.store.find('location-level', LLD.idThree);
    assert.deepEqual(location_level_two.get('locations'), []);
    assert.equal(location.get('location_level_fk'), LLD.idOne);
    assert.deepEqual(location_level.get('locations'), [LD.idZero, LD.idOne, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
    assert.equal(page.locationLevelInput.split(' +')[0].trim().split(' ')[0], LLD.nameCompany);
    assert.equal(find(`${PARENTS_MULTIPLE_OPTION} > li`).length, 2);
  });
  selectChoose('.t-location-level-select', LLD.nameLossPreventionRegion);
  andThen(() => {
    let location_level_two  = this.store.find('location-level', LLD.idLossRegion);
    let location_level  = this.store.find('location-level', LLD.idOne);
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('location_level_fk'), LLD.idOne);
    assert.deepEqual(location_level_two.get('locations'), [LD.idOne]);
    assert.deepEqual(location_level.get('locations'), [LD.idZero, LD.idTwo, LD.idThree, LD.idParent, LD.idParentTwo]);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.ok(location_level.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location_level_two.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('parents').get('length'), 0);
    assert.equal(location.get('children').get('length'), 0);
    assert.equal(find(`${PARENTS_MULTIPLE_OPTION} > li`).length, 0);
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

test('newly added phone numbers without a valid number are ignored and removed when user navigates away (no rollback prompt)', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  generalPage.clickAddPhoneNumber();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(page.phonenumberZeroValidationErrorVisible);
    assert.notOk(page.phonenumberOneValidationErrorVisible);
    assert.notOk(page.phonenumberTwoValidationErrorVisible);
  });
  page.phonenumberThirdFillIn('34');
  triggerEvent('.t-phonenumber-number2', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.equal($('.validated-input-error-dialog').text().trim(), t('errors.phonenumber.number'));
    assert.notOk(page.phonenumberZeroValidationErrorVisible);
    assert.notOk(page.phonenumberOneValidationErrorVisible);
    assert.ok(page.phonenumberTwoValidationErrorVisible);
  });
  page.phonenumberThirdFillIn('');
  triggerEvent('.t-phonenumber-number2', 'keyup', {keyCode: 65});
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    assert.equal( this.store.find('phonenumber').get('length'), 3);
  });
});

test('newly added emails without a valid email are ignored and removed when user navigates away (no rollback prompt)', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  page.clickAddEmail();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(generalPage.emailZeroValidationErrorVisible);
    assert.notOk(generalPage.emailOneValidationErrorVisible);
    assert.notOk(generalPage.emailTwoValidationErrorVisible);
  });
  generalPage.emailThirdFillIn('wat');
  triggerEvent('.t-email-email2', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 1);
    // TODO: rely on emberi18ncpvalidations or roll our own
    // assert.equal($('.validated-input-error-dialog').text().trim(), t('errors.email'));
    assert.notOk(generalPage.emailZeroValidationErrorVisible);
    assert.notOk(generalPage.emailOneValidationErrorVisible);
    assert.ok(generalPage.emailTwoValidationErrorVisible);
  });
  generalPage.emailThirdFillIn('');
  triggerEvent('.t-email-email2', 'keyup', {keyCode: 65});
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    assert.equal( this.store.find('email').get('length'), 3);
  });
});

test('newly added addresses without a valid address or postal_code are ignored and removed when user navigates away (no rollback prompt)', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  page.clickAddAddress();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(page.addressZeroValidationErrorVisible);
    assert.notOk(page.addressOneValidationErrorVisible);
    assert.notOk(page.addressTwoValidationErrorVisible);
    assert.notOk(page.postalCodeZeroValidationErrorVisible);
    assert.notOk(page.postalCodeOneValidationErrorVisible);
    assert.notOk(page.postalCodeTwoValidationErrorVisible);
  });
  page.addressThirdFillIn('w');
  triggerEvent('.t-address-address2', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 1);
    // TODO: rely on emberi18ncpvalidations or roll our own
    // assert.equal($('.validated-input-error-dialog').text().trim(), t('errors.address'));
    assert.notOk(page.addressZeroValidationErrorVisible);
    assert.notOk(page.addressOneValidationErrorVisible);
    assert.ok(page.addressTwoValidationErrorVisible);
    assert.notOk(page.postalCodeZeroValidationErrorVisible);
    assert.notOk(page.postalCodeOneValidationErrorVisible);
    assert.notOk(page.postalCodeTwoValidationErrorVisible);
  });
  page.addressThirdFillIn('');
  triggerEvent('.t-address-address2', 'keyup', {keyCode: 65});
  page.addressPostalCodeThirdFillIn('1');
  triggerEvent('.t-address-postal-code2', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 2);
    // TODO: rely on emberi18ncpvalidations or roll our own
    // assert.equal($('.validated-input-error-dialog').text().trim(), t('errors.address'));
    assert.notOk(page.addressZeroValidationErrorVisible);
    assert.notOk(page.addressOneValidationErrorVisible);
    assert.ok(page.addressTwoValidationErrorVisible);
    assert.notOk(page.postalCodeZeroValidationErrorVisible);
    assert.notOk(page.postalCodeOneValidationErrorVisible);
    assert.ok(page.postalCodeTwoValidationErrorVisible);
  });
  page.addressPostalCodeThirdFillIn('');
  triggerEvent('.t-address-postal-code2', 'keyup', {keyCode: 65});
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    assert.equal( this.store.find('address').get('length'), 3);
  });
});

test('invalid phone numbers prevent save and must click delete to navigate away', function(assert) {
  page.visitDetail();
  generalPage.clickAddPhoneNumber();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  page.phonenumberThirdFillIn('34');
  triggerEvent('.t-phonenumber-number2', 'keyup', {keyCode: 32});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.notOk(page.phonenumberZeroValidationErrorVisible);
    assert.notOk(page.phonenumberOneValidationErrorVisible);
    assert.ok(page.phonenumberTwoValidationErrorVisible);
    assert.equal(find('.t-save-btn').attr('disabled'), 'disabled');
  });
  click('.t-del-phone-number-btn:eq(2)');
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(page.phonenumberZeroValidationErrorVisible);
    assert.notOk(page.phonenumberOneValidationErrorVisible);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    const location  = this.store.find('location', LD.idOne);
    const fks = location.get('location_phonenumbers_fks');
    const ids = location.get('location_phonenumbers_ids');
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(fks, ids);
  });
});

test('invalid emails prevent save and must click delete to navigate away', function(assert) {
  page.visitDetail();
  page.clickAddEmail();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  generalPage.emailThirdFillIn('34');
  triggerEvent('.t-email-email2', 'keyup', {keyCode: 32});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.notOk(generalPage.emailZeroValidationErrorVisible);
    assert.notOk(generalPage.emailOneValidationErrorVisible);
    assert.ok(generalPage.emailTwoValidationErrorVisible);
    assert.equal(find('.t-save-btn').attr('disabled'), 'disabled');
  });
  click('.t-del-email-btn:eq(2)');
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(generalPage.emailZeroValidationErrorVisible);
    assert.notOk(generalPage.emailOneValidationErrorVisible);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    const location  = this.store.find('location', LD.idOne);
    const fks = location.get('location_emails_fks');
    const ids = location.get('location_emails_ids');
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(fks, ids);
  });
});

test('invalid addresss prevent save and must click delete to navigate away', function(assert) {
  page.visitDetail();
  page.clickAddAddress();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  page.addressPostalCodeThirdFillIn('53444');
  andThen(() => {
    assert.equal(find('.t-save-btn').attr('disabled'), 'disabled');
  });
  click('.t-del-address-btn:eq(2)');
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    const location  = this.store.find('location', LD.idOne);
    const fks = location.get('location_addresss_fks');
    const ids = location.get('location_addresss_ids');
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(fks, ids);
  });
});

test('when you change a related phone numbers type it will be persisted correctly', function(assert) {
  page.visitDetail();
  selectChoose('.t-phone-number-type-select', PNTD.mobileNameValue);
  const phone_numbers = PNF.put({id: PND.idOne, type: PNTD.mobileId});
  const payload = LF.put({id: LD.idOne, phone_numbers: phone_numbers});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

test('when you change a related emails type it will be persisted correctly', function(assert) {
  page.visitDetail();
  selectChoose('.t-email-type-select', ETD.workName);
  const emails = EF.put({id: ED.idOne, type: ETD.workId});
  const payload = LF.put({id: LD.idOne, emails: emails});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

test('when you change a related address type it will be persisted correctly', function(assert) {
  page.visitDetail();
  selectChoose('.t-address-type-select:eq(0)', ATD.shippingNameText);
  const addresses = AF.put({id: AD.idOne, type: ATD.shippingId});
  const payload = LF.put({id: LD.idOne, addresses: addresses});
  xhr(url,'PUT',JSON.stringify(payload),{},200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
  });
});

test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', function(assert) {
  page.visitDetail();
  selectChoose('.t-phone-number-type-select', PNTD.mobileNameValue);
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
      var location  = this.store.find('location', LD.idOne);
      var phone_number  = this.store.find('phonenumber', PND.idOne);
      assert.equal(phone_number.get('phone_number_type.id'), PNTD.officeId);
    });
  });
});

test('when user changes an attribute on email and clicks cancel we prompt them with a modal and the related model gets rolled back', function(assert) {
  page.visitDetail();
  selectChoose('.t-email-type-select', ETD.workName);
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
      var email  = this.store.find('email', ED.idOne);
      assert.equal(email.get('email_type.id'), ETD.personalId);
    });
  });
});

test('when user changes an attribute on address and clicks cancel we prompt them with a modal and the related model gets rolled back', function(assert) {
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
      assert.equal( this.store.find('location', LD.idOne).get('addresses').objectAt(0).get('address_type.id'), ATD.officeId);
    });
  });
});

test('when user removes a phone number clicks cancel we prompt them with a modal and the related model gets rolled back', function(assert) {
  page.visitDetail();
  click('.t-del-phone-number-btn:eq(0)');
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
      var location  = this.store.find('location', LD.idOne);
      var phone_number  = this.store.find('phonenumber', PND.idOne);
      assert.equal(phone_number.get('phone_number_type.id'), PNTD.officeId);
    });
  });
});

test('when user removes a email clicks cancel we prompt them with a modal and the related model gets rolled back', function(assert) {
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
      var email  = this.store.find('email', ED.idOne);
      assert.equal(email.get('email_type.id'), ETD.personalId);
    });
  });
});

test('when user removes an address clicks cancel we prompt them with a modal and the related model gets rolled back', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal( this.store.find('location', LD.idOne).get('addresses').get('length'), 2);
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
      assert.equal( this.store.find('location', LD.idOne).get('addresses').get('length'), 2);
    });
  });
});

test('when you deep link to the location detail view you can remove a new phone number', function(assert) {
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(find('.t-input-multi-phone').find('input').length, 2);
  });
  click('.t-del-phone-number-btn:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-input-multi-phone').find('input').length, 1);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
});

test('when you deep link to the location detail view you can remove a new email', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(find('.t-input-multi-email').find('input').length, 2);
  });
  click('.t-del-email-btn:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-input-multi-email').find('input').length, 1);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  var email = EF.put();
  var response = LF.detail(LD.idOne);
  var payload = LF.put({id: LD.idOne, emails: [email[1]]});
  xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('when you deep link to the location detail view you can remove a new address', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(find('.t-input-multi-address').find('input').length, 6);
  });
  click('.t-del-address-btn:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-input-multi-address').find('input').length, 3);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  var addresses = AF.put();
  var response = LF.detail(LD.idOne);
  var payload = LF.put({id: LD.idOne, addresses: [addresses[1]]});
  xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('when you deep link to the location detail view you can change the phone number type and add a new phone number', function(assert) {
  random.uuid = function() { return UUID.value; };
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-phone-number-type-select').length, 2);
  });
  generalPage.clickAddPhoneNumber();
  andThen(() => {
    assert.equal(find('.t-phone-number-type-select').length, 3);
  });
  selectChoose('.t-phone-number-type-select:eq(2)', PNTD.mobileNameValue);
  fillIn('.t-phonenumber-number2', PND.numberThree);
  var phone_numbers = PNF.put();
  var response = LF.detail(LD.idOne);
  run(function() {
    phone_numbers.push({id: UUID.value, number: PND.numberThree, type: PNTD.mobileId});
  });
  var payload = LF.put({id: LD.idOne, phone_numbers: phone_numbers});
  xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('phonenumbers').objectAt(0).get('phone_number_type.id'), PNTD.officeId);
    assert.equal(location.get('phonenumbers').objectAt(1).get('phone_number_type.id'), PNTD.mobileId);
    assert.equal(location.get('phonenumbers').objectAt(2).get('phone_number_type.id'), PNTD.mobileId);
    assert.ok(location.get('phonenumbers').objectAt(0).get('isNotDirty'));
  });
});

test('when you deep link to the location detail view you can change the email type and add a new email', function(assert) {
  random.uuid = function() { return UUID.value; };
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-email-type-select').length, 2);
  });
  page.clickAddEmail();
  andThen(() => {
    assert.equal(find('.t-email-type-select').length, 3);
  });
  selectChoose('.t-email-type-select:eq(2)', ETD.personalName);
  fillIn('.t-email-email2', ED.emailThree);
  var email = EF.put();
  email[0].type = ETD.personalId;
  var response = LF.detail(LD.idOne);
  run(function() {
    email.push({id: UUID.value, email: ED.emailThree, type: ETD.personalId});
  });
  var payload = LF.put({id: LD.idOne, emails: email});
  xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('emails').objectAt(0).get('email_type.id'), ETD.personalId);
    assert.equal(location.get('emails').objectAt(1).get('email_type.id'), ETD.workId);
    assert.equal(location.get('emails').objectAt(2).get('email_type.id'), ETD.personalId);
    assert.ok(location.get('emails').objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('when you deep link to the location detail view you can change the address type and can add new address with default type', function(assert) {
  random.uuid = function() { return UUID.value; };
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  page.clickAddAddress();
  selectChoose('.t-address-type-select:eq(2)', ATD.officeNameText);
  page.addressThirdFillIn(AD.streetThree);
  page.addressPostalCodeThirdFillIn(AD.zipOne);
  page.addressCityThirdFill(AD.cityOne);
  let keyword = 'a';
  let countryListResults = CF.list_power_select();
  let countryId = countryListResults.results[0].id;
  let countryName = countryListResults.results[0].name;
  xhr(`/api/countries/tenant/?search=${keyword}`, 'GET', null, {}, 200, countryListResults);
  selectSearch('.t-address-country:eq(2)', keyword);
  selectChoose('.t-address-country:eq(2)', countryName);

  // State
  keyword = 'a';
  let stateListResults = SF.list_power_select();
  let stateId = stateListResults.results[0].id;
  let stateName = stateListResults.results[0].name;
  xhr(`/api/states/tenant/?search=${keyword}`, 'GET', null, {}, 200, stateListResults);
  selectSearch('.t-address-state:eq(2)', keyword);
  selectChoose('.t-address-state:eq(2)', stateName);

  andThen(() => {
    assert.equal(page.addressTypeSelectedThree, ATD.officeNameText);
  });
  var addresses = AF.put({id: AD.officeId, type: ATD.idOne});
  var response = LF.detail(LD.idOne);
  run(function() {
    addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree, postal_code: AD.zipOne , city: AD.cityOne , state: stateId, country: countryId});
  });
  var payload = LF.put({id: LD.idOne, status: LD.status, addresses: addresses});
  xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(),LOCATION_URL);
    var location  = this.store.find('location', LD.idOne);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('addresses').objectAt(2).get('address_type').get('id'), ATD.officeId);
    assert.ok(location.get('addresses').objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
  });
});

/*LOCATION TO CHILDREN M2M*/
test('clicking and typing into power select for location will fire off xhr request for all locations children', function(assert) {
  page.visitDetail();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.equal(location.get('children').objectAt(0).get('name'), LD.storeNameTwo);
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.apple), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(CHILDREN, 'a');
  selectChoose(CHILDREN, LD.apple);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
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
    let location  = this.store.find('location', LD.idOne);
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
  selectChoose(CHILDREN, LD.boondocks);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
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

test('can remove and add back same children and save empty children', function(assert) {
  page.visitDetail();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('childrenIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.childrenOneRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('childrenIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=a/`;
  let response = {'results': [LF.get_no_related(LD.unusedId, LD.baseStoreName), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(CHILDREN, 'a');
  selectChoose(CHILDREN, LD.baseStoreName);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('location_children_fks').length, 2);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('childrenIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.childrenTwoRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('childrenIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=d/`;
  xhr(location_endpoint, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch(CHILDREN, 'd');
  selectChoose(CHILDREN, LD.storeNameTwo);
  page.nameFillIn(LD.storeNameTwo);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('location_children_fks').length, 2);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('childrenIsNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let payload = LF.put({id: LD.idOne, name: LD.storeNameTwo, children: [LD.idTwo, LD.idThree]});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('starting with multiple children, can remove all children (while not populating options) and add back', function(assert) {
  page.visitDetail();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.equal(location.get('location_children_fks').length, 2);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  page.childrenTwoRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  page.childrenOneRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 0);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=d/`;
  xhr(location_endpoint, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch(CHILDREN, 'd');
  selectChoose(CHILDREN, LD.storeNameTwo);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  location_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idOne}/${LD.idOne}/location__icontains=g/`;
  const response = LF.search_power_select();
  response.results.push(LF.get(LD.idThree, LD.storeNameThree));
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(CHILDREN, 'g');
  selectChoose(CHILDREN, LD.storeNameThree);
  page.nameFillIn(LD.storeNameTwo);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('children').get('length'), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.childrenSelected.indexOf(LD.storeNameTwo), 2);
  });
  let payload = LF.put({id: LD.idOne, name: LD.storeNameTwo, children: [LD.idTwo, LD.idThree]});
  ajax(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

/*PARENTS*/
test('clicking and typing into power select for location will fire off xhr request for all location parents', function(assert) {
  page.visitDetail();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  let location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${LD.idOne}/location__icontains=a/`;
  let response = { 'results': [LF.get_no_related(LD.unusedId, LD.apple), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(PARENTS, 'a');
  selectChoose(PARENTS, LD.apple);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 3);
    assert.equal(location.get('parents').objectAt(0).get('name'), LD.storeNameParent);
    assert.equal(location.get('parents').objectAt(1).get('name'), LD.storeNameParentTwo);
    assert.equal(location.get('parents').objectAt(2).get('name'), LD.apple);
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsTwoSelected.indexOf(LD.storeNameParentTwo), 2);
    assert.equal(page.parentsThreeSelected.indexOf(LD.apple), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  selectSearch(PARENTS, 'a');
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
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
  selectChoose(PARENTS, LD.boondocks);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
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

test('can remove and add back same parents and save empty parents', function(assert) {
  page.visitDetail();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('parentsIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.parentsTwoRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
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
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('parentsIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.parentsClickOptionStoreNameOne();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('parentsIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  page.parentsTwoRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('parentsIsDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idOne}/${LD.idOne}/location__icontains=p/`;
  response = LF.search_power_select();
  response.results.push(...[LF.get_no_related(LD.unusedId, LD.baseStoreName), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo), LF.get_no_related(LD.idParentThree, LD.storeNameParentThree)]);
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(PARENTS, 'p');
  page.parentsClickOptionStoreNameTwo();
  page.nameFillIn(LD.storeNameTwo);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('parentsIsNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
  });
  let payload = LF.put({id: LD.idOne, name: LD.storeNameTwo, parents: [LD.idParent, LD.idParentTwo]});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('starting with multiple parents, can remove all parents (while not populating options) and add back', function(assert) {
  page.visitDetail();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.equal(location.get('location_parents_fks').length, 2);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  page.parentsTwoRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  page.parentsOneRemove();
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
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
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 1);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParentTwo), 2);
  });
  selectSearch(PARENTS, 'p');
  page.parentsClickOptionStoreNameFirst();
  page.nameFillIn(LD.storeNameTwo);
  andThen(() => {
    let location  = this.store.find('location', LD.idOne);
    assert.equal(location.get('parents').get('length'), 2);
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
  });
  let payload = LF.put({id: LD.idOne, name: LD.storeNameTwo, parents: [LD.idParent, LD.idParentTwo]});
  ajax(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('clicking and typing into power select for location will not filter if spacebar pressed', function(assert) {
  clearxhr(list_xhr);
  page.visitDetail();
  page.parentsClickDropdown();
  selectSearch(PARENTS, '');
  andThen(() => {
    assert.equal(page.parentsSelected.indexOf(LD.storeNameParent), 2);
    assert.equal(page.parentsOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
});

test('fill out phonenumber and save', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.phonenumberTypeSelectedOne, PNTD.officeNameValue);
  });
  click('.t-del-phone-number-btn:eq(0)');
  andThen(() => {
    assert.equal(Ember.$('.t-del-phone-number-btn').length, 1);
  });
  selectChoose('.t-phone-number-type-select', PNTD.mobileNameValue);
  andThen(() => {
    assert.equal(page.phonenumberTypeSelectedOne, PNTD.mobileNameValue);
  });
  let payload = LF.put({id: LD.idOne, status: LDS.openId});
  payload.phone_numbers.splice(1,1);
  payload.phone_numbers[0] = {
    id: PND.idTwo,
    number: PND.numberTwo,
    type: PNTD.mobileId
  };
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('fill out email and save', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(generalPage.emailTypeSelectedOne, ETD.personalName);
  });
  click('.t-del-email-btn:eq(0)');
  andThen(() => {
    assert.equal(Ember.$('.t-del-email-btn').length, 1);
  });
  selectChoose('.t-email-type-select', ETD.personalName);
  andThen(() => {
    assert.equal(generalPage.emailTypeSelectedOne, ETD.personalName);
  });
  let payload = LF.put({id: LD.idOne, status: LDS.openId});
  payload.emails.splice(1,1);
  payload.emails[0] = {
    id: ED.idTwo,
    email: ED.emailTwo,
    type: ETD.idOne
  };
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
  });
});

test('fill out an address including Country and State', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  click('.t-del-address-btn:eq(0)');
  andThen(() => {
    // # of delete button's is the # of address input widgets
    assert.equal(Ember.$('.t-del-address-btn').length, 1);
  });
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
  let payload = LF.put({id: LD.idOne, status: LDS.openId});
  payload.addresses.splice(1,1);
  payload.addresses[0] = {
    id: AD.idTwo,
    type: ATD.shippingId,
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
