import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import AF from 'bsrs-ember/vendor/assignment_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/assignment-mobile';
import assignmentPage from 'bsrs-ember/tests/pages/assignment';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${BASE_URL}/index/${AD.idOne}`;
const ASSIGNEE = '.t-ticket-assignee-select';

moduleForAcceptance('Acceptance | grid assignment mobile test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${ASSIGNMENT_URL}?page=1`, 'GET', null, {}, 200, AF.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other assignment objects already in store', assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other assignment in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
    assert.equal(store.find('assignment-list').get('length'), 0);
  });
  clearxhr(list_xhr);
  xhr(`${ASSIGNMENT_URL}?page=1`, 'GET', null, {}, 200, AF.list_two());
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(store.find('assignment-list').get('length'), 10);
  });
});

test('visiting mobile assignment grid show correct layout', assert => {
  assignmentPage.visit();
  andThen(() => {
    const assignment = store.findOne('assignment-list');
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-mobile-grid-title').text().trim(), '19 '+t('admin.assignment.other'));
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
    // Based on assignment-list
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-assignment-description'));
  });
});

test('assignment description filter will filter down results and reset page to 1', async assert => {
  xhr(`${ASSIGNMENT_URL}?page=1&description__icontains=${AD.descriptionLastPage2Grid}`, 'GET', null, {}, 200, AF.searched(AD.descriptionLastPage2Grid, 'description'));
  clearxhr(list_xhr);
  xhr(`${ASSIGNMENT_URL}?page=2`, 'GET', null, {}, 200, AF.list());
  await visit(ASSIGNMENT_LIST_URL+'?page=2');
  assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), AD.descriptionGridOne);
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), AD.fullnameGridOne);
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterDescription();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput(AD.descriptionLastPage2Grid);
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), AD.descriptionLastPage2Grid);
});

// test('can uncheck a value after already checked and no xhr is sent', async assert => {
//   xhr(`${ASSIGNMENT_URL}?page=1&priority__id__in=${AD.priorityOneId}`, 'GET', null, {}, 200, AF.searched_related(AD.priorityOneId, 'priority'));
//   await assignmentPage.visit();
//   assert.equal(store.find('assignment-list').get('length'), 10);
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
//   assert.equal(store.find('assignment-list').get('length'), 10);
//   assert.equal(find('.t-grid-data:eq(0) > .t-assignment-priority-translated_name span').text().trim(), t('assignment.priority.emergency'));
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

// test('filtering on multiple parameters', async assert => {
//   xhr(`${ASSIGNMENT_URL}?page=1&priority__id__in=${AD.priorityOneId}&status__id__in=${AD.statusOneId}`, 'GET', null, {}, 200, AF.searched_related(AD.priorityOneId, 'priority'));
//   await assignmentPage.visit();
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 0);
//   await page.clickFilterPriority();
//   await page.priorityOneCheck();
//   await page.clickFilterStatus();
//   await page.statusOneCheck();
//   await generalMobilePage.submitFilterSort();
// });

test('filtering assignee on power select and can remove', async assert => {
  xhr(`${ASSIGNMENT_URL}?page=1&assignee__id__in=${PersonD.idBoy}`, 'GET', null, {}, 200, AF.searched_related(AD.assigneeSelectOne, 'assignee'));
  await assignmentPage.visit();
  assert.equal(store.find('assignment-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(ASSIGNEE).length, 0);
  await page.clickFilterAssignee();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${PEOPLE_URL}person__icontains=boy/`, 'GET', null, {}, 200, PersonF.search_power_select());
  await selectSearch(ASSIGNEE, 'boy');
  await selectChoose(ASSIGNEE, PersonD.fullnameBoy);
  assert.equal(page.assigneeInput.split(' ')[1], PersonD.nameBoy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.assigneeInput.split(' ')[1], PersonD.nameBoy);
  removeMultipleOption(ASSIGNEE, PersonD.fullnameBoy);
  await generalMobilePage.submitFilterSort();
});

test('removing find or id_in filter will reset grid', async assert => {
  xhr(`${ASSIGNMENT_URL}?page=1&assignee__id__in=${PersonD.idBoy}`, 'GET', null, {}, 200, {'results': []});
  await assignmentPage.visit();
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterAssignee();
  xhr(`${PEOPLE_URL}person__icontains=boy/`, 'GET', null, {}, 200, PersonF.search_power_select());
  await selectSearch(ASSIGNEE, 'boy');
  await selectChoose(ASSIGNEE, PersonD.fullnameBoy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), '');
  removeMultipleOption(ASSIGNEE, PersonD.fullnameBoy);
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), AD.descriptionGridOne);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), AD.descriptionGridOne);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), AD.descriptionGridOne);
});

/* jshint ignore:end */
