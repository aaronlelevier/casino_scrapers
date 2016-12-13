import Ember from 'ember';
const { get, run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import RD from 'bsrs-ember/vendor/defaults/role';
import SD from 'bsrs-ember/vendor/defaults/status';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/person-mobile';
import peoplePage from 'bsrs-ember/tests/pages/person';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { PEOPLE_URL, PEOPLE_LIST_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';
import { ROLE_SELECT, LOCATION_SELECT, STATUS_SELECT } from 'bsrs-ember/tests/helpers/const-names';

var list_xhr, detail_payload;

const BASE_URL = BASEURLS.base_people_url;
const DETAIL_URL = `${BASE_URL}/${PD.idOne}`;
const PEOPLE_PUT_URL = `${PEOPLE_URL}${PD.idOne}/`;

moduleForAcceptance('Acceptance | general mobile people detail test', {
  beforeEach() {
    setWidth('mobile');
    list_xhr = xhr(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
    detail_payload = PF.detail(PD.idOne);
    xhr(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, detail_payload);
  },
});

/* jshint ignore:start */

test('can click from admin to people grid to detail', async function(assert) {
  await generalPage.visitAdmin();
  assert.equal(currentURL(), BASEURLS.base_admin_url);
  await pageDrawer.clickDrawer();
  await pageDrawer.clickAdmin();
  await generalPage.clickPeople();
  assert.equal(currentURL(), PEOPLE_LIST_URL);
  await generalPage.gridItemZeroClick();
  assert.equal(currentURL(), DETAIL_URL);
});

test('can update fields and save', async function(assert) {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  const person = this.store.find('person', PD.idOne);
  assert.equal(find('.t-detail-title').text(), person.get('fullname'));
  xhr(`${LOCATIONS_URL}location__icontains=ABC1234/?location_level=${LLD.idOne}`, 'GET', null, {}, 200, LF.list_power_select());
  await selectSearch(LOCATION_SELECT, 'ABC1234');
  // role change will clear out locations
  await selectChoose(LOCATION_SELECT, `${LD.baseStoreName}4`);
  await selectChoose(ROLE_SELECT, RD.nameTwo);
  await peoplePage.firstNameFill(PD.donald_first_name);
  await peoplePage.lastNameFill(PD.donald_last_name);
  await peoplePage.middleInitialFill(PD.donald_middle_initial);
  await peoplePage.titleFillIn(PD.titleTwo);
  await peoplePage.employeeIdFillIn(PD.donald_employee_id);
  await generalMobilePage.footerItemTwoClick();
  await selectChoose(STATUS_SELECT, SD.inactiveNameTranslated);
  const username_response = {'count':0,'next':null,'previous':null,'results': []};
  xhr(`${PEOPLE_URL}?username=${PD.usernameLastPage2Grid}`, 'GET', null, {}, 200, username_response);
  await peoplePage.usernameFillIn(PD.usernameLastPage2Grid);
  await generalMobilePage.footerItemThreeClick();
  await generalPage.phonenumberRemoveSecond();
  await generalPage.emailRemoveSecond();
  const phone_payload = detail_payload.phone_numbers[0];
  phone_payload.type = detail_payload.phone_numbers[0].type;
  const email_payload = detail_payload.emails[0];
  email_payload.type = detail_payload.emails[0].type;
  const payload = PF.put({id: PD.idOne, first_name: PD.donald_first_name, last_name: PD.donald_last_name, middle_initial: PD.donald_middle_initial, 
    username: PD.usernameLastPage2Grid, title: PD.titleTwo, employee_id: PD.donald_employee_id, role: RD.idTwo, locations: [], status: SD.inactiveId,
    phone_numbers: [phone_payload], emails: [email_payload]});
  xhr(PEOPLE_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save()
  assert.equal(currentURL(), PEOPLE_LIST_URL);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async function(assert) {
  clearxhr(list_xhr);
  await page.visitDetail();
  await click('.t-mobile-footer-item:eq(0)');
  await peoplePage.firstNameFill('wat');
  assert.equal(find('.t-person-first-name').val(), 'wat');
  await generalMobilePage.backButtonClick();
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
      assert.equal(find('.t-person-first-name').val(), 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit rollback', async function(assert) {
  await page.visitDetail();
  await click('.t-mobile-footer-item:eq(0)');
  await peoplePage.firstNameFill('wat');
  assert.equal(find('.t-person-first-name').val(), 'wat');
  await generalMobilePage.backButtonClick();
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
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), PEOPLE_LIST_URL);
      const person = this.store.find('person', PD.idOne);
      assert.notEqual(find('.t-person-first-name').val(), 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('can click through component sections and save to redirect to index', async function(assert) {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.footerItemTwoClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
  await generalMobilePage.footerItemThreeClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(2)').hasClass('active'));
  await generalMobilePage.footerItemOneClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
  let payload = PF.put({id: PD.idOne});
  xhr(PEOPLE_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), PEOPLE_LIST_URL);
});

/* jshint ignore:end */
