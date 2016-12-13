import Ember from 'ember';
const { get, run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import PD from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/location-status';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import page from 'bsrs-ember/tests/pages/location';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { LOCATIONS_URL, LOCATION_LIST_URL } from 'bsrs-ember/utilities/urls';
import { LLEVEL_SELECT, LOCATION_STATUS_SELECT, LOCATION_PARENTS_SELECT, LOCATION_CHILDREN_SELECT } from 'bsrs-ember/tests/helpers/const-names';

var list_xhr;

const BASE_URL = BASEURLS.base_locations_url;
const DETAIL_URL = `${BASE_URL}/${LD.idOne}`;
const LOCATION_PUT_URL = `${LOCATIONS_URL}${LD.idOne}/`;

moduleForAcceptance('Acceptance | general mobile location detail test', {
  beforeEach() {
    /* SETUP */
    setWidth('mobile');
    list_xhr = xhr(`${LOCATIONS_URL}?page=1`, 'GET', null, {}, 200, LF.list());
    xhr(`${LOCATIONS_URL}${LD.idOne}/`, 'GET', null, {}, 200, LF.detail());
  },
});

/* jshint ignore:start */

test('can click to detail, show activities, and go back to list', async function(assert) {
  await page.visit();
  assert.equal(currentURL(), LOCATION_LIST_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.backButtonClick();
  assert.equal(currentURL(), LOCATION_LIST_URL);
});

test('can click through component sections and save to redirect to index', async function(assert) {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.footerItemThreeClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(2)').hasClass('active'));
  await generalMobilePage.footerItemTwoClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
  await generalMobilePage.footerItemOneClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
  const payload = LF.put({id: LD.idOne});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), LOCATION_LIST_URL);
});


test('can update all fields and save', async function(assert) {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await page.nameFillIn(LD.storeNameTwo);
  await page.numberFillIn(LD.storeNumberTwo);
  selectChoose(LLEVEL_SELECT, LLD.nameLossPreventionRegion);
  selectChoose(LOCATION_STATUS_SELECT, SD.closedNameTranslated);
  await click('.t-mobile-footer-item:eq(2)');
  let location_endpoint = `${LOCATIONS_URL}get-level-parents/${LLD.idLossRegion}/${LD.idOne}/location__icontains=a/`;
  let response = { 'results': [LF.get_no_related(LD.unusedId, LD.apple), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_endpoint, 'GET', null, {}, 200, response);
  selectSearch(LOCATION_PARENTS_SELECT, 'a');
  selectChoose(LOCATION_PARENTS_SELECT, LD.apple);
  let location_children_endpoint = `${LOCATIONS_URL}get-level-children/${LLD.idLossRegion}/${LD.idOne}/location__icontains=a/`;
  let children_response = { 'results': [LF.get_no_related(LD.unusedId, LD.apple), LF.get_no_related(LD.idParent, LD.storeNameParent), LF.get_no_related(LD.idParentTwo, LD.storeNameParentTwo)]};
  xhr(location_children_endpoint, 'GET', null, {}, 200, children_response);
  selectSearch(LOCATION_CHILDREN_SELECT, 'a');
  selectChoose(LOCATION_CHILDREN_SELECT, LD.storeNameParent);
  const payload = LF.put({id: LD.idOne, name: LD.storeNameTwo, number: LD.storeNumberTwo, location_level: LLD.idLossRegion, status: SD.closedId, children: [LD.idParent], parents: [LD.unusedId]});
  xhr(LOCATION_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save()
  assert.equal(currentURL(), LOCATION_LIST_URL);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async function(assert) {
  clearxhr(list_xhr);
  await page.visitDetail();
  await page.nameFillIn('wat');
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

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit rollback', async function(assert) {
  await page.visitDetail();
  await page.nameFillIn('wat');
  assert.equal(find('.t-location-name').val(), 'wat');
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
      assert.equal(currentURL(), LOCATION_LIST_URL);
      assert.notEqual(find('.t-location-name').val(), 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

/* jshint ignore:end */
