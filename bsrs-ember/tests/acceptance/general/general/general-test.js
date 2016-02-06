import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';


const PREFIX = config.APP.NAMESPACE;
const SETTING_URL = BASEURLS.base_setting_url + '/' + SD.id;

var application, store, endpoint, setting_data, detail_xhr;

module('Acceptance | general settings', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + SETTING_URL + '/';
        setting_data = SF.detail();
        detail_xhr = xhr(endpoint, 'GET', null, {}, 200, setting_data);
    },
    afterEach() {
       Ember.run(application, 'destroy');
    }
});

test('admin panel displays correct headers and section headers', function(assert) {
    visit(SETTING_URL);
    andThen(() => {
        assert.equal(currentURL(), SETTING_URL);
        assert.equal(find('.t-settings-title').text(), setting_data.id);
        assert.equal(find('.t-settings-name').text(), setting_data.name);
        for (var key in setting_data.settings) {
            assert.equal(find(`.t-settings-${key}`).text(), String(SD.settings[key].value));
        }
    });
});
