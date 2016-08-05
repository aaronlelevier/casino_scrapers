import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import TF from 'bsrs-ember/vendor/admin_translation_fixtures';
import TD from 'bsrs-ember/vendor/defaults/translation';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_admin_translations_url;
const TRANSLATION_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TD.keyOneGrid;

var application, store, endpoint, translation_list_data, translation_detail_data, list_xhr, detail_xhr;

moduleForAcceptance('Acceptance | translation detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL + '/';
    translation_list_data = TF.list();
    translation_detail_data = TF.get();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, translation_list_data);
    detail_xhr = xhr(endpoint + TD.keyOneGrid + '/', 'GET', null, {}, 200, translation_detail_data);
  },
});

//TODO: FIREFOX discrepancy
// test('clicking on a translation will redirect User to the detail view', (assert) => {
//     visit(TRANSLATION_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TRANSLATION_URL);
//     });
//     click('.t-grid-data:eq(0)');
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//     });
// });

test('detail | header is translation key', (assert) => {
  clearxhr(list_xhr);
  visit(DETAIL_URL);
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(find('.t-translation-key').text(), TD.keyOneGrid);
    });
  });
});

test('detail | header is translation key, each Locale gets populated', (assert) => {
  clearxhr(list_xhr);
  visit(DETAIL_URL);
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(find('.t-translation-key').text(), TD.keyOneGrid);
      assert.equal(find('.t-translation-locale-name:eq(0)').text(), LOCALED.nameOne);
      assert.equal(find('.t-translation-locale-name:eq(1)').text(), LOCALED.nameTwo);
    });
  });
});

// test('aaron detail | update model by changing first Locale trans', (assert) => {
//     clearxhr(list_xhr);
//     visit(DETAIL_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         let translation = store.find('translation', TD.keyOneGrid);
//         assert.ok(translation.get('isNotDirty'));
//     });
//     let response = TF.get();
//     let payload = TF.put({
//         id: TD.keyOneGrid,
//         locales: [{
//             locale: TD.localeOneId,
//             translation: TD.otherTranslationOne
//         },{
//             locale: TD.localeTwoId,
//             translation: TD.localeTwoTranslation
//         },{
//             locale: TD.localeThreeId,
//             translation: TD.localeThreeTranslation
//         }]
//     });
//     xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
//     fillIn('.t-translation-translation:eq(0)', TD.otherTranslationOne);
//     andThen(() => {
//         let translation = store.find('translation', TD.keyOneGrid);
//         assert.ok(translation.get('isDirtyOrRelatedDirty'));  // TODO: Need to iron out 'Locales in store'
//     });
//     let list = TF.list();
//     list.results[0].name = TD.otherTranslationOne;
//     generalPage.save();
//     xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
//     andThen(() => {
//         assert.equal(currentURL(), TRANSLATION_URL);
//         let translation = store.find('translation', TD.keyOneGrid);
//         assert.ok(translation.get('isNotDirtyOrRelatedNotDirty'));
//     });
// });
