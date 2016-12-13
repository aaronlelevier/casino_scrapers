import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/automation-mobile';
import automationPage from 'bsrs-ember/tests/pages/automation';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

var list_xhr;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${BASE_URL}/index/${AD.idOne}`;

moduleForAcceptance('Acceptance | general grid automation mobile test', {
  beforeEach() {
    setWidth('mobile');
    list_xhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, AF.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other automation objects already in this.store', function(assert) {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other automation in this.store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
    assert.equal(this.store.find('automation-list').get('length'), 0);
  });
  clearxhr(list_xhr);
  xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, AF.list_two());
  visit(AUTOMATION_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
    assert.equal(this.store.find('automation-list').get('length'), 10);
  });
});

test('visiting mobile automation grid show correct layout', function(assert) {
  automationPage.visit();
  andThen(() => {
    const automation = this.store.findOne('automation-list');
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
    assert.equal(find('.t-mobile-grid-title').text().trim(), '19 '+t('admin.automation.other'));
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
    // Based on automation-list
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-automation-description'));
  });
});

test('automation description filter will filter down results and reset page to 1', async function(assert) {
  xhr(`${AUTOMATION_URL}?page=1&description__icontains=${AD.descriptionLastPage2Grid}`, 'GET', null, {}, 200, AF.searched(AD.descriptionLastPage2Grid, 'description'));
  clearxhr(list_xhr);
  xhr(`${AUTOMATION_URL}?page=2`, 'GET', null, {}, 200, AF.list());
  await visit(AUTOMATION_LIST_URL+'?page=2');
  assert.equal(currentURL(), AUTOMATION_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), AD.descriptionGridOne);
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterDescription();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput(AD.descriptionLastPage2Grid);
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), AD.descriptionLastPage2Grid);
});

// test('can uncheck a value after already checked and no xhr is sent', async function(assert) {
//   xhr(`${AUTOMATION_URL}?page=1&priority__id__in=${AD.priorityOneId}`, 'GET', null, {}, 200, AF.searched_related(AD.priorityOneId, 'priority'));
//   await automationPage.visit();
//   assert.equal(this.store.find('automation-list').get('length'), 10);
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 0);
//   await page.clickFilterPriority();
//   assert.equal(find('.t-filter__input-wrap').length, 1);
//   assert.equal(find('.t-checkbox-list').length, 1);
//   assert.equal(page.priorityOneIsChecked(), false);
//   await page.priorityOneCheck();
//   assert.equal(page.priorityOneIsChecked(), true);
//   assert.equal(page.priorityTwoIsChecked(), false);
//   assert.equal(page.priorityThreeIsChecked(), false);
//   assert.equal(page.priorityFourIsChecked(), false);
//   await generalMobilePage.submitFilterSort();
//   assert.equal(this.store.find('automation-list').get('length'), 10);
//   assert.equal(find('.t-grid-data:eq(0) > .t-automation-priority-translated_name span').text().trim(), t('automation.priority.emergency'));
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 1);
//   await page.priorityOneCheck();
//   assert.equal(page.priorityOneIsChecked(), false);
//   assert.equal(page.priorityTwoIsChecked(), false);
//   assert.equal(page.priorityThreeIsChecked(), false);
//   assert.equal(page.priorityFourIsChecked(), false);
//   await generalMobilePage.submitFilterSort();
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 0);
//   assert.equal(page.priorityOneIsChecked(), false);
//   assert.equal(page.priorityTwoIsChecked(), false);
//   assert.equal(page.priorityThreeIsChecked(), false);
//   assert.equal(page.priorityFourIsChecked(), false);
// });

// test('filtering on multiple parameters', async function(assert) {
//   xhr(`${AUTOMATION_URL}?page=1&priority__id__in=${AD.priorityOneId}&status__id__in=${AD.statusOneId}`, 'GET', null, {}, 200, AF.searched_related(AD.priorityOneId, 'priority'));
//   await automationPage.visit();
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 0);
//   await page.clickFilterPriority();
//   await page.priorityOneCheck();
//   await page.clickFilterStatus();
//   await page.statusOneCheck();
//   await generalMobilePage.submitFilterSort();
// });

/* jshint ignore:end */
