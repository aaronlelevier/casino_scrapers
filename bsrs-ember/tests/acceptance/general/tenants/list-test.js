import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL  } from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const API_DETAIL_URL = `${TENANT_URL}${TD.idOne}/`;


moduleForAcceptance('Acceptance | general tenant list test', {
  beforeEach() {
    const listData = TF.list();
    xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, listData);
  },
});

test('can click tenants from the Dashboard to grid  and then to detail', function(assert) {
  visit(BASEURLS.base_admin_url);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.clickTenants();
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, TF.detail());
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});
