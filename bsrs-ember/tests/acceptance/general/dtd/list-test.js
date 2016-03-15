import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import { dtd_payload, dtd_payload_update_priority, dtd_payload_no_priority, dtd_payload_two } from 'bsrs-ember/tests/helpers/payloads/dtd';

const ADMIN_URL = BASEURLS.dashboard_url;
const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DETAIL_PG2_TWO_URL = `${BASE_URL}/${DTD.idGridTwo}`;
const DT_PUT_URL = `${PREFIX}${DETAIL_URL}/`;

let application, detail_xhr;

module('Acceptance | dtd list test', {
  beforeEach() {
    application = startApp();
    let endpoint = `${PREFIX}${BASE_URL}/`;
    xhr(`${endpoint}?page=1`,'GET', null, {}, 200, DTDF.list());
    const detail_endpoint = `${PREFIX}${BASE_URL}/`;
    const detail_data = DTDF.detail(DTD.idOne);
    detail_xhr = xhr(`${detail_endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, detail_data);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /dtds', (assert) => {
  clearxhr(detail_xhr);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
});

test('admin to dtds list to detail && preview', (assert) => {
  generalPage.visitDashboard();
  andThen(() => {
    assert.equal(currentURL(), ADMIN_URL);
  });
  generalPage
  .clickAdmin()
  .clickDTD();
  andThen(() => {
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
  const endpoint_two = `${PREFIX}${BASE_URL}/`;
  detail_xhr = xhr(`${endpoint_two}${DTD.idGridTwo}/`, 'GET', null, {}, 200, DTDF.detail(DTD.idGridTwo));
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), `${DETAIL_PG2_TWO_URL}?page=2`);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), `${DETAIL_URL}?page=2`);
  });
  var search_one = `${PREFIX}${BASE_URL}/?page=1&search=5`;
  xhr(search_one ,"GET",null,{},200,DTDF.searched('5', 'key'));
  fillIn('.t-grid-search-input', '5');
  const NUMBER_FIVE = {keyCode: 53};
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FIVE);
  andThen(() => {
    assert.equal(currentURL(), `${DETAIL_URL}?search=5`);
  });
});

test('detail && preview are bound and can save', (assert) => {
  generalPage.visitDashboard();
  andThen(() => {
    assert.equal(currentURL(), ADMIN_URL);
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

test('navigating to list route shows 3 panes and message in dtd pane', (assert) => {
  clearxhr(detail_xhr);
  page.visit();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // assert.equal(find('.t-dtd-empty-detail').text(), GLOBALMSG.dtd_empty_detail);
  });
});

test('clicking close on tab will show list only', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('input.t-dtd-single-key').val(), DTD.keyOne);
    assert.equal(find('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.closeTab();
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.notOk(find('input.t-dtd-single-key').val());
    assert.notOk(find('.t-dtd-preview-description').text().trim());
    assert.equal(find('.col-count-1').length, 1);
    assert.equal(currentURL(), DTD_URL);
  });
});
test('amk ensure we are seeing the decision tree grid and not the standard grid', (assert) => {
    clearxhr(detail_xhr);
    page.visit();
    andThen(() => {
      assert.equal(find('h2.t-dtd-grid-title').length, 1);
      // assert.equal(find('.t-dtd-empty-detail').text(), GLOBALMSG.dtd_empty_detail);
    });
});
