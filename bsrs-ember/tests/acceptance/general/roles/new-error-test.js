import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import BASEURLS from 'bsrs-ember/utilities/urls';
import { xhr } from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/role';

const BASE_URL = BASEURLS.base_roles_url;
const NEW_URL = BASE_URL + '/new/1';
const PREFIX = config.APP.NAMESPACE;
const SETTING_URL = `${PREFIX}${BASEURLS.base_roles_url}/route-data/new/`;

moduleForAcceptance('Acceptance | general/roles/new error', {
  beforeEach() {
    xhr(SETTING_URL, 'GET', null, {}, 500, {detail: 'we are testing an unexpected failure'});
  }
});

test('visiting admin/roles/new/1 and ignore server error for dashboard_text message', (assert) => {
  page.visitNew();
  andThen(function() {
    assert.equal(currentURL(), NEW_URL);
    assert.ok(find("[data-test-id='roles/detail-section']").length, 'new form rendered');
  });
});
