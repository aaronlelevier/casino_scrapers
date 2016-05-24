import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';

const ADMIN_URL = '/admin';
const PREFIX = config.APP.NAMESPACE;
const SETTING_URL = BASEURLS.base_setting_url + '/' + SD.id;
const ADMINPANEL = '.t-side-menu';

var application, store, endpoint, setting_data, detail_xhr;

module('Acceptance | admin settings layout test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + SETTING_URL + '/';
    setting_data = SF.detail();
    detail_xhr = xhr(endpoint, 'GET', null, {}, 200, setting_data);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('admin panel displays correct headers and section headers', function(assert) {
  clearxhr(detail_xhr);
  visit(ADMIN_URL);
  andThen(() => {
    assert.equal(find(ADMINPANEL + ' > section').length, 5);
    assert.equal(find(ADMINPANEL + ' > section:eq(0) h3').text().trim(), "Settings");
    assert.equal(find(ADMINPANEL + ' > section:eq(1) h3').text().trim(), "People");
    assert.equal(find(ADMINPANEL + ' > section:eq(2) h3').text().trim(), "Locations");
    assert.equal(find(ADMINPANEL + ' > section:eq(3) h3').text().trim(), "Categories");
    assert.equal(find(ADMINPANEL + ' > section:eq(4) h3').text().trim(), "Contractors");
  });
});
