import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/role';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new';
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-role-category-select > .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.t-role-category-select-dropdown > .ember-power-select-options';
const CATEGORY_SEARCH = '.ember-power-select-trigger-multiple-input';

let application, store, payload, list_xhr, original_uuid, url, counter;

module('Acceptance | role-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            name: RD.nameOne,
            role_type: RD.roleTypeGeneral,
            location_level: RD.locationLevelOne,
            categories: [CD.idTwo]
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        let endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, RF.empty());
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
        url = `${PREFIX}${BASE_URL}/`;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('visiting role/new', (assert) => {
    visit(ROLE_URL);
    let response = Ember.$.extend(true, {}, payload);
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, response);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        assert.equal(store.find('role').get('length'), 7);
        assert.equal(store.find('role-type').get('length'), 2);
        assert.equal(store.find('location-level').get('length'), 8);
        assert.equal(page.locationLevelInput(), 'Select One');
        assert.equal(page.roleTypeInput(), RD.roleTypeGeneral);
        assert.ok(store.find('role').objectAt(1).get('isNotDirty'));
        const role = store.find('role', UUID.value);
        assert.ok(role.get('new'));
    });
    fillIn('.t-role-name', RD.nameOne);
    page.roleTypeClickDropdown();
    page.roleTypeClickOptionOne();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=a';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'a');
    page.categoryClickOptionTwo();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(store.find('role').get('length'), 7);
        let role = store.find('role', UUID.value);
        assert.equal(role.get('new'), undefined);
        assert.equal(role.get('name'), RD.nameOne);
        assert.equal(role.get('role_type'), RD.roleTypeGeneral);
        assert.equal(role.get('location_level.id'), RD.locationLevelOne);
        assert.ok(role.get('isNotDirty'));
    });
});

// test('validation works and when hit save, we do same post', (assert) => {
//     visit(ROLE_URL);
//     click('.t-add-new');
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//         assert.ok(find('.t-location-level-validation-error').is(':hidden'));
//         assert.ok(find('.t-role-category-validation-error').is(':hidden'));
//     });
//     generalPage.save();
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':visible'));
//         assert.ok(find('.t-location-level-validation-error').is(':visible'));
//         assert.ok(find('.t-role-category-validation-error').is(':visible'));
//     });
//     fillIn('.t-role-name', RD.nameOne);
//     generalPage.save();
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//         assert.ok(find('.t-location-level-validation-error').is(':visible'));
//         assert.ok(find('.t-role-category-validation-error').is(':visible'));
//     });
//     page.locationLevelClickDropdown();
//     page.locationLevelClickOptionOne();
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//         assert.ok(find('.t-location-level-validation-error').is(':hidden'));
//         assert.ok(find('.t-role-category-validation-error').is(':visible'));
//     });
//     let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=a';
//     xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
//     page.categoryClickDropdown();
//     fillIn(CATEGORY_SEARCH, 'a');
//     page.categoryClickOptionTwo();
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//         assert.ok(find('.t-location-level-validation-error').is(':hidden'));
//         assert.ok(find('.t-role-category-validation-error').is(':hidden'));
//     });
//     let response = Ember.$.extend(true, {}, payload);
//     xhr(url, 'POST', JSON.stringify(payload), {}, 201, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), ROLE_URL);
//     });
// });

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(list_xhr);
    visit(NEW_URL);
    fillIn('.t-role-name', RD.nameOne);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-role-name').val(), RD.nameOne);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(NEW_URL);
    fillIn('.t-role-name', RD.nameOne);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let role = store.find('role', {id: UUID.value});
            assert.equal(role.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), ROLE_URL);
            let role = store.find('role', {id: UUID.value});
            assert.equal(role.get('length'), 0);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    visit(NEW_URL);
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('role').get('length'), 6);
    });
});

/* ROLE TO LOCATION LEVEL */
test('can save new location level', (assert) => {
    visit(NEW_URL);
    fillIn('.t-role-name', RD.nameOne);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    andThen(() => {
        let role = store.find('role', UUID.value); 
        assert.equal(role.get('location_level').get('id'), LLD.idOne);
        assert.equal(role.get('location_level_fk'), undefined);
    });
    let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=a';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'a');
    page.categoryClickOptionTwo();
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

/*ROLE TO CATEGORY M2M*/
test('clicking and typing into power select for categories will fire off xhr request for all categories', (assert) => {
    visit(NEW_URL);
    let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=a';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'a');
    andThen(() => {
        assert.equal(page.categoryOptionLength(), 10); 
        assert.equal(page.categoriesSelected(), 0);
        const role = store.find('role', UUID.value);
        assert.equal(role.get('role_category_fks').length, 0);
        assert.equal(role.get('categories').get('length'), 0);
    });
    page.categoryClickOptionTwo();
    andThen(() => {
        let role = store.find('role', UUID.value);
        assert.equal(role.get('role_category_fks').length, 0);
        assert.equal(role.get('categories').get('length'), 1);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(page.categoriesSelected(), 1);
    });
    fillIn('.t-role-name', RD.nameOne);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    let category = CF.put({id: CD.idOne, name: CD.nameOne});
    let payload = RF.put({id: UUID.value, location_level: LLD.idOne, categories: [CD.idTwo]});
    xhr(url, 'POST', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

// test('adding and removing removing a category in power select for categories will save correctly and cleanup role_category_fks', (assert) => {
//     visit(NEW_URL);
//     andThen(() => {
//         patchRandom(counter);
//     });
//     let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=a';
//     xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
//     page.categoryClickDropdown();
//     fillIn(CATEGORY_SEARCH, 'a');
//     andThen(() => {
//         assert.equal(page.categoryOptionLength(), 10); 
//         assert.equal(page.categoriesSelected(), 0);
//         const role = store.find('role', UUID.value);
//         assert.equal(role.get('role_category_fks').length, 0);
//         assert.equal(role.get('categories').get('length'), 0);
//     });
//     page.categoryClickOptionTwo();
//     andThen(() => {
//         let role = store.find('role', UUID.value);
//         assert.equal(role.get('role_categories').get('length'), 1);
//         assert.equal(role.get('categories').get('length'), 1);
//         assert.equal(page.categoriesSelected(), 1);
//     });
//     page.categoryOneRemove();
//     andThen(() => {
//         let role = store.find('role', UUID.value);
//         assert.equal(role.get('role_categories').get('length'), 0);
//         assert.equal(role.get('categories').get('length'), 0);
//         assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
//         assert.equal(page.categoriesSelected(), 0);
//     });
//     page.categoryClickOptionTwo();
//     fillIn('.t-role-name', RD.nameOne);
//     page.locationLevelClickDropdown();
//     page.locationLevelClickOptionOne();
//     xhr(url, 'POST', JSON.stringify(payload), {}, 201);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), ROLE_URL);
//     });
// });

test('can add multiple categories', (assert) => {
    visit(NEW_URL);
    let category_endpoint = PREFIX + '/admin/categories/?name__icontains=repair1';
    xhr(category_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'repair1');
    andThen(() => {
        let role = store.find('role', UUID.value);
        assert.equal(role.get('categories').get('length'), 0);
        assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(page.categoryOptionLength(), 2);
    });
    page.categoryClickOptionOneEq();
    andThen(() => {
        let role = store.find('role', UUID.value);
        assert.equal(role.get('categories').get('length'), 1);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(page.categoriesSelected(), 1);
    });
    let category_endpoint_two = PREFIX + '/admin/categories/?name__icontains=a';
    xhr(category_endpoint_two, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'a');
    page.categoryClickOptionTwo();
    fillIn('.t-role-name', RD.nameOne);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    let payload = RF.put({id: UUID.value, categories: [CD.idOne]});
    xhr(url, 'POST', JSON.stringify(payload), {}, 201);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('clicking and typing into power select for categories will not filter if spacebar pressed', (assert) => {
    visit(NEW_URL);
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, ' ');
    andThen(() => {
        assert.equal(page.categoriesSelected(), 0);
        assert.equal(page.categoryOptionLength(), 1);
        assert.equal(find(`${CATEGORY_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.no_results);
    });
    fillIn('.t-role-name', RD.nameOne);
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionOne();
    let category_endpoint_two = PREFIX + '/admin/categories/?name__icontains=a';
    xhr(category_endpoint_two, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'a');
    page.categoryClickOptionTwo();
    xhr(url, 'POST', JSON.stringify(payload), {}, 201);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});
