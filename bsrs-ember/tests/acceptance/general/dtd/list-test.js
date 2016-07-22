import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import { dtd_payload, dtd_payload_update_priority, dtd_payload_no_priority, dtd_payload_two } from 'bsrs-ember/tests/helpers/payloads/dtd';

const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DETAIL_PG2_TWO_URL = `${BASE_URL}/${DTD.idGridTwo}`;
const DT_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const ERROR_URL = BASEURLS.error_url;

let endpoint, detail_xhr, list_xhr;

moduleForAcceptance('Acceptance | dtd list test', {
  beforeEach() {
    endpoint = `${PREFIX}${BASE_URL}/`;
    list_xhr = xhr(`${endpoint}?page=1`,'GET', null, {}, 200, DTDF.list());
    const detail_endpoint = `${PREFIX}${BASE_URL}/`;
    const detail_data = DTDF.detail(DTD.idOne);
    detail_xhr = xhr(`${detail_endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, detail_data);
  },
});

test('visiting /dtds', (assert) => {
  clearxhr(detail_xhr);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
});

test('admin to dtds list to detail && preview', (assert) => {
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  generalPage.visitDashboard();
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
  generalPage
    .clickAdmin()
    .clickDTD();
  andThen(() => {
    assert.equal(find('.t-grid-search-input').attr('placeholder'), t('admin.dtd.search'));
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.notOk(find('.t-dtd-preview-description').text().trim());
    assert.equal(currentURL(), DTD_URL);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);//grid
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);//detail
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);//detail
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('search grid', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  const page_two = `${PREFIX}${BASE_URL}/?page=2`;
  xhr(page_two ,'GET',null,{},200,DTDF.list_two());
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), `${DTD_URL}?page=2`);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), `${DTD_URL}?page=2`);
  });
  var search_one = `${PREFIX}${BASE_URL}/?page=1&search=5`;
  xhr(search_one ,"GET",null,{},200,DTDF.searched('5', 'key'));
  fillIn('.t-grid-search-input', '5');
  const NUMBER_FIVE = {keyCode: 53};
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FIVE);
  andThen(() => {
    // assert.equal(currentURL(), `${DETAIL_URL}?search=5`);
  });
});

test('detail && preview are bound and can save', (assert) => {
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  generalPage.visitDashboard();
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
  generalPage
  .clickAdmin()
  .clickDTD();
  click('.t-grid-data:eq(0)');
  page.descriptionFillIn(DTD.descriptionTwo);
  andThen(() => {
    assert.ok(page.isDirty);
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionTwo);
  });
  dtd_payload.description = DTD.descriptionTwo;
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionTwo);
  });
});

test('toggle decision tree preview', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
    assert.equal(currentURL(), DETAIL_URL);
  });
  page.clickPreviewToggle();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
  page.clickDetailToggle();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
  page.clickListToggle();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
  page.clickDetailToggle();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
  page.clickListToggle();
  andThen(() => {
    assert.notOk(find('.t-grid-data').length);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
  page.clickDetailToggle();
  andThen(() => {
    assert.notOk(find('.t-grid-data').length);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
  page.clickPreviewToggle();
  andThen(() => {
    assert.notOk(find('.t-grid-data').length);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
  });
  page.clickDetailToggle();
  andThen(() => {
    assert.notOk(find('.t-grid-data').length);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
  });
  page.clickPreviewToggle();
  andThen(() => {
    assert.notOk(find('.t-grid-data').length);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
  });
  page.clickListToggle();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('persist pane selection when preview is off', (assert) => {
  page.visit();
  page.clickPreviewToggle();
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
});

test('persist pane selection when detail is off', (assert) => {
  page.visit();
  page.clickDetailToggle();
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
  });
});

test('persist pane selection when detail and preview are off', (assert) => {
  page.visit();
  page.clickPreviewToggle();
  page.clickDetailToggle();
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
});

test('click all three previews and make sure the list stays on', (assert) => {
  page.visit();
  page.clickPreviewToggle();
  page.clickDetailToggle();
  page.clickListToggle();
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.notOk(find('.t-dtd-preview-description').text().trim());
  });
});

test('navigating to list route shows 3 panes and message in dtd pane', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-dtd-empty-detail').text(), t(GLOBALMSG.dtd_empty_detail));
    assert.equal(find('.dtd-empty:eq(0) .t-dtd-empty-title').text(), t('admin.dtd.detail'));
    assert.equal(find('.dtd-empty:eq(1) .t-dtd-empty-title').text(), t('admin.dtd.preview'));
    assert.ok(find('.t-dtd-preview'));
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.notOk(find('.t-dtd-empty-detail').text());
  });
});

test('clicking close on tab from detail will redirect to admin', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.closeTab();
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
});

/* jshint ignore:start */
test('ensure we are seeing the decision tree grid and not the standard grid', async assert => {
  clearxhr(detail_xhr);
  await page.visit();
  assert.equal(find('h2.t-dtd-grid-title').length, 1);
});

test('navigating to list route will show empty detail route', async assert => {
  await page.visit();
  assert.equal(page.emptyDetailText, 'Detail');
  assert.equal(page.emptyPreviewText, 'Preview');
  assert.ok(find('.t-dtd-empty-detail').text());
  await page.visitDetail();
  assert.equal(page.titleText, t('admin.dtd.detail'));
  assert.throws(find('.t-dtd-empty-detail'));
  await generalPage.clickAdmin();
  await generalPage.clickDTD();
  assert.equal(page.emptyDetailText, 'Detail');
  assert.equal(page.emptyPreviewText, 'Preview');
  assert.ok(find('.t-dtd-empty-detail').text());
});

test('404 error at list route', async assert => {
  clearxhr(detail_xhr);
  clearxhr(list_xhr);
  const exception = `These records does not exist.`;
  xhr(`${endpoint}?page=1`, 'GET', null, {}, 404, {'list': exception});
  await page.visit();
  assert.equal(currentURL(), ERROR_URL);
  assert.equal(generalPage.errorText, 'WAT');
});
/* jshint ignore:end */
