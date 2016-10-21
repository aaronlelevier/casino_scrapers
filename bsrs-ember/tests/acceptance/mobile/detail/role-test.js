import Ember from 'ember';
const { get, run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import PD from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/location';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import CURRENCY_D from 'bsrs-ember/vendor/defaults/currencies';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import page from 'bsrs-ember/tests/pages/role';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import { roleNewData } from 'bsrs-ember/tests/helpers/payloads/role';
import BASEURLS, { ROLES_URL, PEOPLE_URL, CATEGORIES_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';
import { LLEVEL_SELECT } from 'bsrs-ember/tests/helpers/const-names';

var store, list_xhr;

const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${RD.idOne}`;
const ROLE_PUT_URL = `${ROLES_URL}${RD.idOne}/`;

moduleForAcceptance('Acceptance | mobile role detail test', {
  beforeEach() {
    /* SETUP */
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${ROLES_URL}?page=1`, 'GET', null, {}, 200, RF.list());
    xhr(`${ROLES_URL}${RD.idOne}/`, 'GET', null, {}, 200, RF.detail());
    let setting_endpoint = `/api${BASE_URL}/route-data/new/`;
    xhr(setting_endpoint, 'GET', null, {}, 200, roleNewData);
  },
});

/* jshint ignore:start */

test('can click to detail, show activities, and go back to list', async assert => {
  await page.visit();
  assert.equal(currentURL(), ROLE_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.backButtonClick();
  assert.equal(currentURL(), ROLE_URL);
});

test('can click through component sections and save to redirect to index', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.footerItemTwoClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
  await generalMobilePage.footerItemOneClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
  const payload = RF.put({id: RD.idOne});
  xhr(ROLE_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), ROLE_URL);
});


test('can update all fields and save', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await page.nameFill(RD.nameTwo);
  selectChoose('.t-role-role-type', RD.roleTypeContractor);
  selectChoose(LLEVEL_SELECT, LLD.nameLossPreventionRegion);
  removeMultipleOption('.t-role-category-select', CD.nameOne);
  await click('.t-mobile-footer-item:eq(1)');
  selectChoose('.t-currency-code-select', CURRENCY_DEFAULTS.codeCAD);
  await page.authAmountFillIn(10);
  andThen(() => {
    $('.t-amount').focusout();
  });
  await page.dashboard_textFill('wat');
  const payload = RF.put({id: RD.idOne, name: RD.nameTwo, role_type: RD.t_roleTypeContractor, location_level: LLD.idLossRegion, categories: [], auth_currency: CURRENCY_D.idCAD, auth_amount: '10.00', dashboard_text: 'wat'});
  xhr(ROLE_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save()
  assert.equal(currentURL(), ROLE_URL);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  await page.nameFill('wat');
  assert.equal(page.nameValue, 'wat');
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
      assert.equal(page.nameValue, 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit rollback', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  await page.nameFill('wat');
  assert.equal(find('.t-role-name').val(), 'wat');
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
      assert.equal(currentURL(), DETAIL_URL);
      const role = store.find('role', RD.idOne);
      assert.equal(find('.t-role-name').val(), get(role, 'name'));
      assert.notEqual(find('.t-role-name').val(), 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

/* jshint ignore:end */
