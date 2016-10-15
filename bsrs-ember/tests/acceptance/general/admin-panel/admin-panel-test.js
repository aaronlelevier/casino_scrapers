import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';

const ADMIN_URL = '/admin';
const PREFIX = config.APP.NAMESPACE;
const SETTING_URL = BASEURLS.base_setting_url + '/' + TD.id;
const ADMINPANEL = '.t-side-menu';

var endpoint, setting_data, detail_xhr;

moduleForAcceptance('Acceptance | admin settings layout test', {
  beforeEach() {
    this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + SETTING_URL + '/';
    setting_data = TF.detail();
    detail_xhr = xhr(endpoint, 'GET', null, {}, 200, setting_data);
  },
});

test('admin panel displays correct headers and h3 headers', function(assert) {
  clearxhr(detail_xhr);
  visit(ADMIN_URL);
  andThen(() => {
    assert.equal(find(ADMINPANEL + ' h3').length, 5);
    assert.equal(find(ADMINPANEL + ' h3:eq(0)').text().trim(), "Settings");
    assert.equal(find(ADMINPANEL + ' h3:eq(1)').text().trim(), "People");
    assert.equal(find(ADMINPANEL + ' h3:eq(2)').text().trim(), "Locations");
    assert.equal(find(ADMINPANEL + ' h3:eq(3)').text().trim(), "Categories");
    assert.equal(find(ADMINPANEL + ' h3:eq(4)').text().trim(), "Contractors");
  });
});
