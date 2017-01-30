import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { xhr } from 'bsrs-ember/tests/helpers/xhr';
import page from 'bsrs-ember/tests/pages/role';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';
import RD from 'bsrs-ember/vendor/defaults/role';
import RF from 'bsrs-ember/vendor/role_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currency';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS, { PREFIX, ROLE_LIST_URL } from 'bsrs-ember/utilities/urls';

const NEW_URL = ROLE_LIST_URL + '/new/1';
const SETTING_URL = `${PREFIX}${BASEURLS.base_roles_url}/route-data/new/`;

moduleForAcceptance('Acceptance | general general/roles/new error', {
  beforeEach() {
    random.uuid = () => { return UUID.value; };
  }
});

test('visiting admin/roles/new/1 and ignore server error for dashboard_text message', (assert) => {
  xhr(PREFIX + ROLE_LIST_URL + '/' + '?page=1', 'GET', null, {}, 200, RF.list());
  xhr(SETTING_URL, 'GET', null, {}, 500, {detail: 'we are testing an unexpected failure'});
  page.visitNew();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal(find("[data-test-selector='roles-detail-section']").length, 1, 'new form rendered');
  });
});

test('server error when saving a new role renders an application error notice', function(assert) {
  xhr(PREFIX + ROLE_LIST_URL + '/' + '?page=1', 'GET', null, {}, 200, RF.list());
  xhr(SETTING_URL, 'GET', null, {}, 200, {detail: ''});
  run(() => {
    this.store.push('category', {id: CD.idTwo+'2z', name: CD.nameOne+'2z'});//used for category selection to prevent fillIn helper firing more than once
  });
  const payload = RF.put({
    id: UUID.value, dashboard_text: undefined,
    categories: [], auth_currency: undefined, auth_amount: 0
  });
  page.visitNew();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL, 'new role url');
    assert.equal(find('app-notice').length, 0, 'no error notification displayed');
  });
  page.nameFill(RD.nameOne);
  selectChoose('.t-location-level-select', LLD.nameCompany);
  xhr(`${PREFIX}${ROLE_LIST_URL}/`, 'POST', JSON.stringify(payload), {}, 502, "Server Error");
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL, 'url did not change');
    assert.equal(find('app-notice').length, 1, 'error notification displayed');
  });
  click('app-notice');
  andThen(() => {
    assert.equal(find('app-notice').length, 0, 'error notification dismissed');
  });
});

test('bad request when saving a new role renders an application error notice', function(assert) {
  xhr(PREFIX + ROLE_LIST_URL + '/' + '?page=1', 'GET', null, {}, 200, RF.list());
  xhr(SETTING_URL, 'GET', null, {}, 200, {detail: ''});
  run(() => {
    this.store.push('category', {id: CD.idTwo+'2z', name: CD.nameOne+'2z'});//used for category selection to prevent fillIn helper firing more than once
  });
  const payload = RF.put({
    name: '<script src=\"https://bad_url.com\">Muhaha</script>',
    id: UUID.value, dashboard_text: undefined,
    categories: [], auth_currency: undefined, auth_amount: 0
  });
  page.visitNew();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL, 'new role url');
    assert.equal(find('app-notice').length, 0, 'no error notification displayed');
  });
  page.nameFill('<script src="https://bad_url.com">Muhaha</script>');
  selectChoose('.t-location-level-select', LLD.nameCompany);
  xhr(`${PREFIX}${ROLE_LIST_URL}/`, 'POST', JSON.stringify(payload), {}, 400, {
    "name": ["This field contains invalid characters."]
  });
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL, 'url did not change');
    assert.equal(find('app-notice').length, 1, 'error notification displayed');
  });
  click('app-notice');
  andThen(() => {
    assert.equal(find('app-notice').length, 0, 'error notification dismissed');
  });
});
