import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_DEFAULTS_PUT from 'bsrs-ember/vendor/defaults/person-put';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_PEOPLE_URL + '/index';
const DETAIL_URL = BASE_PEOPLE_URL + '/' + PEOPLE_DEFAULTS.id;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';

var application, store, list_xhr, people_detail_data, endpoint, detail_xhr;

module('Acceptance | tab test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_PEOPLE_URL + '/';
        people_detail_data = PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id);
        detail_xhr = xhr(endpoint + PEOPLE_DEFAULTS.id + '/', 'GET', null, {}, 200, people_detail_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('deep linking the people detail url should push a tab into the tab store', (assert) => {

    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        var thisTab = store.find('tab', PEOPLE_DEFAULTS.id);
        assert.equal(thisTab.get('doc_title'), PEOPLE_DEFAULTS.fullname);
        assert.equal(find('.t-tab-title:eq(0)').text(), PEOPLE_DEFAULTS.fullname);
    });

});

test('visiting the people detail url from the list url should push a tab into the tab store', (assert) => {

    var people_list_data = PEOPLE_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);

    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });

    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        var thisTab = store.find('tab', PEOPLE_DEFAULTS.id);
        assert.equal(thisTab.get('doc_title'), PEOPLE_DEFAULTS.fullname);
        assert.equal(find('.t-tab-title:eq(0)').text(), PEOPLE_DEFAULTS.fullname);
    });

});

test('clicking on a tab from the list url should take you to the detail url', (assert) => {

    var people_list_data = PEOPLE_FIXTURES.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);

    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        var tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });

    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        var thisTab = store.find('tab', PEOPLE_DEFAULTS.id);
        assert.equal(thisTab.get('doc_title'), PEOPLE_DEFAULTS.fullname);
        assert.equal(find('.t-tab-title:eq(0)').text(), PEOPLE_DEFAULTS.fullname);
    });

    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });

    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });

});

test('amk a dirty model should add the dirty class to the tab close icon', (assert) => {

    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        var thisTab = store.find('tab', PEOPLE_DEFAULTS.id);
        assert.equal(thisTab.get('doc_title'), PEOPLE_DEFAULTS.fullname);
        assert.equal(find('.t-tab-title:eq(0)').text(), PEOPLE_DEFAULTS.fullname);

        fillIn('.t-person-first-name', PEOPLE_DEFAULTS_PUT.username);
        andThen(() => {
          assert.equal(find('.dirty').length, 1);
        });

    });

});
