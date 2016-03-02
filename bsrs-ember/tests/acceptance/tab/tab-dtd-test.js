import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';

const PREFIX = config.APP.NAMESPACE;
const BASE_DTD_URL = BASEURLS.base_dtd_url;
const BASE_ROLE_URL = BASEURLS.base_roles_url;
const DTD_URL = `${BASE_DTD_URL}/index`;
const NEW_URL = `${BASE_DTD_URL}/new/1`;
const NEW_URL_2 = `${BASE_DTD_URL}/new/2`;
const DETAIL_URL = `${BASE_DTD_URL}/${DTD.idOne}`;
const ROLE_URL = `${BASE_ROLE_URL}/index`;
const NEW_ROUTE = 'admin.dtds.new';
const INDEX_ROUTE = 'admin.dtds.index';
const DETAIL_ROUTE = 'admin.dtds.dtd';
const DOC_TYPE = 'dtd';
const TAB_TITLE = '.t-tab-title:eq(0)';

let application, store, list_xhr, dtd_detail_data, endpoint, detail_xhr, original_uuid;

module('Acceptance | tab dtd test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = `${PREFIX}${BASE_DTD_URL}/`;
        dtd_detail_data = DTDF.detail(DTD.idOne);
        detail_xhr = xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, dtd_detail_data);
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('(NEW URL) deep linking the new dtd url should push a tab into the tab store with correct properties', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = tabs.objectAt(0);
        assert.equal(find(TAB_TITLE).text(), 'New Definition');
        assert.equal(tab.get('doc_type'), 'dtd');
        assert.equal(tab.get('doc_route'), NEW_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), true);
    });
});

test('deep linking the dtd detail url should push a tab into the tab store with correct properties', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        const tab = store.find('tab', DTD.idOne);
        const dtd = store.find('dtd', DTD.idOne);
        assert.equal(find(TAB_TITLE).text(), DTD.keyOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('visiting the dtd detail url from the list url should push a tab into the tab store', (assert) => {
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        let tab = store.find('tab', DTD.idOne);
        assert.equal(tab.get('doc_type'), DOC_TYPE);
        assert.equal(tab.get('doc_route'), DETAIL_ROUTE);
        assert.equal(tab.get('redirect'), INDEX_ROUTE);
        assert.equal(tab.get('newModel'), false);
    });
});

test('clicking on a tab that is not dirty from the list url should take you to the detail url and fire off an xhr request', (assert) => {
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let dtd = store.find('dtd', DTD.idOne);
        assert.equal(dtd.get('isDirty'), false);
        assert.equal(dtd.get('links').objectAt(0).get('isDirtyOrRelatedDirty'), false);
        assert.equal(dtd.get('linksIsDirty'), false);
        assert.equal(dtd.get('isDirtyOrRelatedDirty'), false);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let dtd = store.find('dtd', DTD.idOne);
        assert.equal(dtd.get('isDirtyOrRelatedDirty'), false);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('(NEW URL) clicking on a tab that is not dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find(TAB_TITLE).text(), 'New Definition');
    });
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
    });
});

// test('(NEW URL) clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
//     random.uuid = function() { return UUID.value; };
//     clearxhr(detail_xhr);
//     visit(NEW_URL);
//     andThen(() => {
//         assert.equal(currentURL(), NEW_URL);
//         let tabs = store.find('tab');
//         assert.equal(tabs.get('length'), 1);
//         assert.equal(find(TAB_TITLE).text(), 'New dtd');
//     });
//     page.priorityClickDropdown();
//     page.priorityClickOptionTwo();
//     let dtd_list_data = DTDF.list();
//     list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
//     visit(DTD_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DTD_URL);
//         let dtd = store.find('dtd').objectAt(0);
//         assert.equal(dtd.get('priority').get('id'), DTD.priorityTwoId);
//         assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
//     });
//     click('.t-tab:eq(0)');
//     andThen(() => {
//         assert.equal(currentURL(), NEW_URL);
//         let dtd = store.find('dtd').objectAt(0);
//         assert.equal(page.priorityInput(), DTD.priorityTwo);
//         assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
//     });
// });

// test('clicking on a tab that is dirty from the list url should take you to the detail url and not fire off an xhr request', (assert) => {
//     let dtd_list_data = DTDF.list();
//     list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
//     visit(DTD_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DTD_URL);
//         let tabs = store.find('tab');
//         assert.equal(tabs.get('length'), 0);
//     });
//     click('.t-grid-data:eq(0)');
//     page.priorityClickDropdown();
//     page.priorityClickOptionTwo();
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         let dtd = store.find('dtd', DTD.idOne);
//         assert.equal(page.priorityInput(), DTD.priorityTwo);
//         assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
//         let tabs = store.find('tab');
//         assert.equal(tabs.get('length'), 1);
//     });
//     andThen(() => {
//         visit(DTD_URL);
//         andThen(() => {
//             assert.equal(currentURL(), DTD_URL);
//         });
//     });
//     click('.t-tab:eq(0)');
//     andThen(() => {
//         let dtd = store.find('dtd', DTD.idOne);
//         assert.equal(page.priorityInput(), DTD.priorityTwo);
//         assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
//         assert.equal(currentURL(), DETAIL_URL);
//     });
// });

// test('cott clicking on a new model from the grid view will not dirty the original tab', (assert) => {
//     let dtd_list_data = DTDF.list();
//     list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
//     visit(DTD_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DTD_URL);
//         let tabs = store.find('tab');
//         assert.equal(tabs.get('length'), 0);
//     });
//     click('.t-grid-data:eq(0)');
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         let dtd = store.find('dtd', DTD.idOne);
//         assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//     });
//     visit(DTD_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DTD_URL);
//         let dtd = store.find('dtd', DTD.idOne);
//         assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//         assert.ok(dtd.get('locationIsDirty'));
//     });
//     // const id = 'bf2b9c85-f6bd-4345-9834-c5d51de53d02';
//     // const data = DTDF.detail(id);
//     // data.cc = [PF.get(PD.idTwo)];
//     // ajax(endpoint + id + '/', 'GET', null, {}, 200, data);
//     // click('.t-grid-data:eq(1)');
//     // andThen(() => {
//     //     let dtd = store.find('dtd', DTD.idOne);
//     //     assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//     //     assert.ok(dtd.get('ccIsNotDirty'));
//     //     let dtd_two = store.find('dtd', id);
//     //     assert.ok(dtd_two.get('isNotDirtyOrRelatedNotDirty'));
//     //     assert.equal(currentURL(), `/dtds/${id}`);
//     // });
// });

test('clicking on a tab that is dirty from the role url (or any non related page) should take you to the detail url and not fire off an xhr request', (assert) => {
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    page.keyFillIn(DTD.keyTwo);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let dtd = store.find('dtd', DTD.idOne);
        assert.equal(page.key(), DTD.keyTwo);
        assert.equal(dtd.get('isDirtyOrRelatedDirty'), true);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
    andThen(() => {
        let endpoint = `${PREFIX}${BASE_ROLE_URL}/`;
        xhr(endpoint + '?page=1','GET',null,{},200,RF.list());
        visit(ROLE_URL);
        andThen(() => {
            assert.equal(currentURL(), ROLE_URL);
        });
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let dtd = store.find('dtd', DTD.idOne);
        assert.equal(page.key(), DTD.keyTwo);
        assert.ok(dtd.get('isDirtyOrRelatedDirty'));
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('clicking on a tab that is not dirty from the role url (or any non related page) should take you to the detail url and fire off an xhr request', (assert) => {
    xhr(endpoint + '?page=1','GET',null,{},200,DTDF.list());
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let dtd = store.find('dtd', DTD.idOne);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
    let role_endpoint = PREFIX + BASE_ROLE_URL + '/';
    xhr(role_endpoint + '?page=1','GET',null,{},200, RF.list());
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-tab:eq(0)');
    andThen(() => {
        let dtd = store.find('dtd', DTD.idOne);
        assert.equal(dtd.get('isDirtyOrRelatedDirty'), false);
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('a dirty model should add the dirty class to the tab close icon', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.dirty').length, 0);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
    page.keyFillIn(DTD.keyTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
    });
});

test('closing a document should close it\'s related tab', (assert) => {
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        click('.t-cancel-btn:eq(0)');
        andThen(() => {
          assert.equal(tabs.get('length'), 0);
        });
    });
});

test('opening a new tab, navigating away and closing the tab should remove the tab', (assert) => {
    clearxhr(detail_xhr);
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
    visit(DTD_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
});

test('opening a tab, navigating away and closing the tab should remove the tab', (assert) => {
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
    visit(DTD_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 0);
    });
});

test('opening a tab, making the model dirty, navigating away and closing the tab should display the confirm dialog', (assert) => {
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
    });
    page.keyFillIn(DTD.keyTwo);
    andThen(() => {
        assert.equal(find('.dirty').length, 1);
    });
    visit(DTD_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        waitFor(() => {
            assert.equal(find('.t-modal-body').length, 1);
        });
    });
});

test('(NEW URL) a dirty new tab and clicking on new model button should push new tab into store', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 1);
        assert.equal(find(TAB_TITLE).text(), 'New Definition');
    });
    page.keyFillIn(DTD.keyOne);
    let dtd_list_data = DTDF.list();
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, dtd_list_data);
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL_2);
        let tabs = store.find('tab');
        assert.equal(tabs.get('length'), 2);
    });
});

