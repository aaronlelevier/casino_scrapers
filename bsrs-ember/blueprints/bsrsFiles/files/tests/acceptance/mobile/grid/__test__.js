import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= SecondModelSingleCharacter %>F from 'bsrs-ember/vendor/<%= secondModel %>_fixtures';
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
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${BASE_URL}/index/${<%= FirstCharacterModuleName %>D.idOne}`;
const <%= secondPropertyTitle %> = '.t-<%= dasherizedModuleName %>-<%= secondPropertySnake %>-select';

moduleForAcceptance('Acceptance | grid <%= dasherizedModuleName %> mobile test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other <%= dasherizedModuleName %> objects already in store', async assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other <%= dasherizedModuleName %> in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  await visit(DASHBOARD_URL);
  assert.equal(currentURL(), DASHBOARD_URL);
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 0);
  clearxhr(list_xhr);
  xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.list_two());
  await visit(<%= CapitalizeModule %>_LIST_URL);
  assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 9);
});

test('visiting mobile <%= dasherizedModuleName %> grid show correct layout', async assert => {
  await <%= camelizedModuleName %>Page.visit();
  const <%= camelizedModuleName %> = store.findOne('<%= dasherizedModuleName %>-list');
  assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  assert.equal(find('.t-mobile-grid-title').text().trim(), '19 <%= CapFirstLetterModuleName %>');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
  // Based on <%= dasherizedModuleName %>-list
  assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-<%= dasherizedModuleName %>-<%= firstPropertySnake %>'));
});

test('<%= dasherizedModuleName %> <%= firstPropertySnake %> filter will filter down results and reset page to 1', async assert => {
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= firstPropertySnake %>__icontains=${<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>LastPage2Grid}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>LastPage2Grid, '<%= firstPropertySnake %>'));
  clearxhr(list_xhr);
  xhr(`${<%= CapitalizeModule %>_URL}?page=2`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.list());
  await visit(<%= CapitalizeModule %>_LIST_URL+'?page=2');
  assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertySnake %>OneGrid);
  await generalMobilePage.clickFilterOpen();
  await page.clickFilter<%= firstPropertyTitle %>();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>LastPage2Grid);
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertySnake %>LastPage2Grid);
});

test('filtering on priority will sort when filter is clicked', async assert => {
  // This is just an example
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= FirstCharacterModuleName %>D.priorityOneId}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityOneId, 'priority'));
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
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= FirstCharacterModuleName %>D.priorityOneId},${<%= FirstCharacterModuleName %>D.priorityTwoId}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityTwoId, 'priority'));
  await generalMobilePage.submitFilterSort();
});

// test('can uncheck a value after already checked and no xhr is sent', async assert => {
//   xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= FirstCharacterModuleName %>D.priorityOneId}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityOneId, 'priority'));
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
  // This is just an example
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&priority__id__in=${<%= FirstCharacterModuleName %>D.priorityOneId}&status__id__in=${<%= FirstCharacterModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityOneId, 'priority'));
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
  // Replace priority with secondProperty
  // Assuming secondModel is person
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondPropertySnake %>__id__in=${<%= secondModelTitle %>D.idBoy}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.<%= secondPropertyCamel %>SelectOne, '<%= secondPropertyCamel %>'));
  await <%= camelizedModuleName %>Page.visit();
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(<%= secondPropertyTitle %>).length, 0);
  await page.clickFilterAssignee();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=boy/`, 'GET', null, {}, 200, <%= SecondModelSingleCharacter %>F.search_power_select());
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
  // this is just an example.  Need multiple (assignee, status to use this test)
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idThree}&status__id__in=${<%= FirstCharacterModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityOneId, 'priority'));
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idFour},${<%= secondModelTitle %>D.idThree}&status__id__in=${<%= FirstCharacterModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityOneId, 'priority'));
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idFour}&status__id__in=${<%= FirstCharacterModuleName %>D.statusOneId}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityOneId, 'priority'));
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondProperty %>__id__in=${<%= secondModelTitle %>D.idFour}`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.searched_related(<%= FirstCharacterModuleName %>D.priorityOneId, 'priority'));
  await <%= camelizedModuleName %>Page.visit();
  assert.equal(store.find('<%= dasherizedModuleName %>-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(<%= secondPropertyTitle %>).length, 0);
  await page.clickFilter<%= secondModelTitle %>();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=6/`, 'GET', null, {}, 200, <%= SecondModelSingleCharacter %>F.search_power_select());
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
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=9/`, 'GET', null, {}, 200, <%= SecondModelSingleCharacter %>F.search_power_select());
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
  // Replace idBoy with what you are searching on the secondModel
  xhr(`${<%= CapitalizeModule %>_URL}?page=1&<%= secondPropertySnake %>__id__in=${<%= secondModelTitle %>D.idBoy}`, 'GET', null, {}, 200, {'results': []});
  await <%= camelizedModuleName %>Page.visit();
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterAssignee();
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=boy/`, 'GET', null, {}, 200, <%= SecondModelSingleCharacter %>F.search_power_select());
  await selectSearch(<%= secondPropertyTitle %>, 'boy');
  await selectChoose(<%= secondPropertyTitle %>, <%= secondModelTitle %>D.<%= secondModelDisplaySnake %>Boy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), '');
  removeMultipleOption(<%= secondPropertyTitle %>, <%= secondModelTitle %>D.<%= secondModelDisplaySnake %>Boy);
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertySnake %>OneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertySnake %>OneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertySnake %>OneGrid);
});

/* jshint ignore:end */