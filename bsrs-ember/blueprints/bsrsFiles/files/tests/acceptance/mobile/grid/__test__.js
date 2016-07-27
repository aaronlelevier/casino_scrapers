import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= secondModelTitle %>F from 'bsrs-ember/vendor/<%= secondModelPlural %>_fixtures';
import <%= secondModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= secondModel %>';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>-mobile';
import <%= camelizedModuleName %>Page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= CapitalizeModule %>_LIST_URL, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const <%= CapitalizeModule %>_LIST_URL = `${BASE_URL}/index`;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${BASE_URL}/index/${<%= camelizedModuleName %>D.idOne}`;
const <%= secondPropertyTitle %> = '.t-<%= dasherizedModuleName %>-<%= secondPropertySnake %>-select';
const <%= secondPropertyTitle %> = '.t-<%= dasherizedModuleName %>-<%= secondPropertySnake %>-select';

moduleForAcceptance('Acceptance | grid <%= dasherizedModuleName %> mobile test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other <%= dasherizedModuleName %> objects already in store', assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other <%= dasherizedModuleName %> in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
    assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 0);
  });
  clearxhr(list_xhr);
  xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.list_two());
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 9);
  });
});

test('visiting mobile <%= dasherizedModuleName %> grid show correct layout', assert => {
  <%= camelizedModuleName %>Page.visit();
  andThen(() => {
    const <%= camlizedModuleName %>- = store.findOne('<%= dasherizedModuleName %>-list');
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-mobile-grid-title').text().trim(), '19 <%= CapFirstLetterModuleName %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
    // Based on <%= dasherizedModuleName %>-list
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-<%= dasherizedModuleName %>-<%= firstPropertySnake %>'));
  });
});

test('<%= dasherizedModuleName %> <%= firstPropertySnake %> filter will filter down results and reset page to 1', async assert => {
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= firstPropertySnake %>__icontains=ape19`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched('ape19', '<%= firstPropertySnake %>'));
  clearxhr(list_xhr);
  xhr(`${<%= CapitalizeModule %>_URL}?page=2`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.list());
  await visit(<%= CapitalizeModule %>_LIST_URL+'?page=2');
  assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= camelizedModuleName %>D.<%= firstPropertySnake %>OneGrid);
  await generalMobilePage.clickFilterOpen();
  await page.clickFilter<%= firstPropertyTitle %>();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput('ape19');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= camelizedModuleName %>D.<%= firstPropertySnake %>LastPage2Grid);
});

test('filtering on priority will sort when filter is clicked', async assert => {
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= camelizedModuleName %>D.priorityOneId}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
  await <%= camelizedModuleName %>Page.visit();
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(find('.t-checkbox-list').length, 1);
  assert.equal(page.priorityOneIsChecked(), false);
  await page.priorityOneCheck();
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-<%= dasherizedModuleName %>-priority-translated_name span').text().trim(), t('<%= dasherizedModuleName %>.priority.emergency'));
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await page.priorityTwoCheck();
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= camelizedModuleName %>D.priorityOneId},${<%= camelizedModuleName %>D.priorityTwoId}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityTwoId, 'priority'));
  await generalMobilePage.submitFilterSort();
});

// test('can uncheck a value after already checked and no xhr is sent', async assert => {
//   xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= camelizedModuleName %>D.priorityOneId}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
//   await <%= camelizedModuleName %>Page.visit();
//   assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
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
//   assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
//   assert.equal(find('.t-grid-data:eq(0) > .t-<%= dasherizedModuleName %>-priority-translated_name span').text().trim(), t('<%= dasherizedModuleName %>.priority.emergency'));
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

test('filtering on multiple parameters', async assert => {
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= camelizedModuleName %>D.priorityOneId}&status__id__in=${<%= camelizedModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
  await <%= camelizedModuleName %>Page.visit();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  await page.priorityOneCheck();
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalMobilePage.submitFilterSort();
});

test('filtering <%= secondPropertySnake %> on power select and can remove', async assert => {
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondPropertySnake %>__id__in=${<%= secondModelTitle %>D.idBoy}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
  await <%= camelizedModuleName %>Page.visit();
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(<%= secondPropertyTitle %>).length, 0);
  await page.clickFilterAssignee();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=boy/`, 'GET', null, {}, 200, <%= secondModelTitle %>F.search_power_select());
  await selectSearch(<%= secondPropertyTitle %>, 'boy');
  await selectChoose(<%= secondPropertyTitle %>, <%= secondModelTitle %>D.<%= secondModelDisplaySnake %>Boy);
  assert.equal(page.<%= secondPropertyCamel %>Input.split(' ')[1], <%= secondModelTitle %>D.nameBoy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.<%= secondPropertyCamel %>Input.split(' ')[1], <%= secondModelTitle %>D.nameBoy);
  removeMultipleOption(<%= secondPropertyTitle %>, <%= secondModelTitle %>D.<%= secondModelDisplaySnake %>Boy);
  await generalMobilePage.submitFilterSort();
});

test('filtering <%= secondPropertySnake %> on power select and can remove', async assert => {
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idThree}&status__id__in=${<%= camelizedModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idFour},${<%= secondModelTitle %>D.idThree}&status__id__in=${<%= camelizedModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idFour}&status__id__in=${<%= camelizedModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idFour}`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.searched_related(<%= camelizedModuleName %>D.priorityOneId, 'priority'));
  await <%= camelizedModuleName %>Page.visit();
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(<%= secondPropertyTitle %>).length, 0);
  await page.clickFilter<%= secondModelTitle %>();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=6/`, 'GET', null, {}, 200, <%= secondModelTitle %>F.search_power_select());
  await selectSearch(<%= secondPropertyTitle %>, '6');
  await selectChoose(<%= secondPropertyTitle %>, 'ZXY863');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.<%= secondProperty %>Input.split(' ')[1], 'ZXY863');
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalMobilePage.submitFilterSort();
  // Select another <%= secondPropertySnake %>
  await generalMobilePage.clickFilterOpen();
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=9/`, 'GET', null, {}, 200, <%= secondModelTitle %>F.search_power_select());
  await selectSearch(<%= secondPropertyTitle %>, '9');
  await selectChoose(<%= secondPropertyTitle %>, 'GHI789');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.<%= secondProperty %>Input.split(' ')[1], 'ZXY863');
  assert.equal(page.<%= secondProperty %>Input.split(' ')[3], 'GHI789');
  // Remove
  await removeMultipleOption(<%= secondPropertyTitle %>, 'ZXY863');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.<%= secondProperty %>Input.split(' ')[1], 'GHI789');
});

test('removing find or id_in filter will reset grid', async assert => {
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondPropertySnake %>__id__in=${<%= secondModelTitle %>D.idBoy}`, 'GET', null, {}, 200, {'results': []});
  await <%= camelizedModuleName %>Page.visit();
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterAssignee();
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=boy/`, 'GET', null, {}, 200, <%= secondModelTitle %>F.search_power_select());
  await selectSearch(<%= secondPropertyTitle %>, 'boy');
  await selectChoose(<%= secondPropertyTitle %>, <%= secondModelTitle %>D.<%= secondModelDisplaySnake %>Boy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), '');
  removeMultipleOption(<%= secondPropertyTitle %>, <%= secondModelTitle %>D.<%= secondModelDisplaySnake %>Boy);
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= camelizedModuleName %>D.<%= firstPropertySnake %>OneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= camelizedModuleName %>D.<%= firstPropertySnake %>OneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= camelizedModuleName %>D.<%= firstPropertySnake %>OneGrid);
});

/* jshint ignore:end */
