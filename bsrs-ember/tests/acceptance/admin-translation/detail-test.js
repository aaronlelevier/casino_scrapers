import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import TF from 'bsrs-ember/vendor/admin_translation_fixtures';
import TD from 'bsrs-ember/vendor/defaults/translation';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_admin_translations_url;
const TRANSLATION_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TD.keyOneGrid;

var application, store, endpoint, translation_list_data, translation_detail_data, list_xhr, detail_xhr;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        translation_list_data = TF.list();
        translation_detail_data = TF.detail();
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, translation_list_data);
        detail_xhr = xhr(endpoint + TD.keyOneGrid + '/', 'GET', null, {}, 200, translation_detail_data);
    },
    afterEach() {
       Ember.run(application, 'destroy');
    }
});

test('clicking on a translation will redirect them to the detail view', (assert) => {
    visit(TRANSLATION_URL);
    andThen(() => {
        assert.equal(currentURL(), TRANSLATION_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('aaron visiting detail', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);

        store.push('translation', {'id': TD.keyOnerid});
        let translation = store.find('translation', TD.keyOneGrid);
        debugger;
        assert.ok(translation.get('isNotDirty'));
    });
    // let response = LF.detail(TD.keyOneGrid);
    // let payload = LF.put({id: TD.keyOneGrid, name: TD.storeNameTwo});
    // xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    // fillIn('.t-translation-name', TD.storeNameTwo);
    // andThen(() => {
    //     let translation = store.find('translation', TD.keyOneGrid);
    //     assert.ok(translation.get('isDirty'));
    //     assert.ok(translation.get('isDirtyOrRelatedDirty'));
    // });
    // let list = LF.list();
    // list.results[0].name = TD.storeNameTwo;
    // xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    // generalPage.save();
    // andThen(() => {
    //     assert.equal(currentURL(), LOCATION_URL);
    //     let translation = store.find('translation', TD.keyOneGrid);
    //     assert.ok(translation.get('isNotDirty'));
    // });
});

test('detail | header is translation key', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    store.push('translation', {'id': TD.keyOneGrid});
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);

            assert.equal(find('.t-translation-key').text(), TD.keyOneGrid);
        });
    });
});
