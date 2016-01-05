import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLF from 'bsrs-ember/vendor/location_level_fixtures';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/role';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + RD.idOne;
const LETTER_A = {keyCode: 65};
const LETTER_S = {keyCode: 83};
const LETTER_R = {keyCode: 82};
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-role-category-select > .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.t-role-category-select-dropdown > .ember-power-select-options';
const CATEGORY_SEARCH = '.ember-power-select-trigger-multiple-input';

let application, store, list_xhr, endpoint, detail_data, url, run = Ember.run;

module('Acceptance | role-detail', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        detail_data = RF.detail(RD.idOne);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, RF.list());
        xhr(endpoint + RD.idOne + '/', 'GET', null, {}, 200, detail_data);
        url = `${PREFIX}${DETAIL_URL}/`;
        run(function() {
            store.push('category', {id: CD.idTwo+'2z', name: CD.nameOne+'2z'});//used for category selection to prevent fillIn helper firing more than once
        });
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

//TODO: ask how grid is presented in what order
// test('xxxx clicking a role name will redirect to the given detail view', (assert) => {
//     store.push('role', {id: RD.idOne+'0', name: 'zap000'}); 
//     visit(ROLE_URL);
//     andThen(() => {
//         assert.equal(currentURL(), ROLE_URL);
//     });
//     click('.t-grid-data:eq(7)');
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//     });
// });

test('when you deep link to the role detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let role = store.find('role').objectAt(0);  
        assert.ok(role.get('isNotDirty'));
        assert.equal(role.get('location_level').get('id'), LLD.idOne);
        assert.equal(page.roleTypeInput(), RD.roleTypeGeneral);
        assert.equal(page.categorySelected().indexOf(CD.nameOne), 2);
        assert.equal(page.locationLevelInput().split(' +')[0].trim().split(' ')[0], LLD.nameCompany);
    });
    let response = RF.detail(RD.idOne);
    let location_level = LLF.put({id: LLD.idLossRegion, name: LLD.nameLossPreventionRegion});
    let payload = RF.put({id: RD.idOne, name: RD.namePut, role_type: RD.roleTypeContractor, location_level: location_level.id, categories: [CD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-role-name', RD.namePut);
    page.roleTypeClickDropdown();
    page.roleTypeClickOptionTwo();
    page.locationLevelClickDropdown();
    page.locationLevelClickOptionTwo();
    andThen(() => {
        let role = store.find('role').objectAt(0);  
        assert.ok(role.get('isDirty'));
    });
    let list = RF.list();
    list.results[0].name = RD.namePut;
    list.results[0].role_type = RD.roleTypeContractor;
    list.results[0].location_level = LLD.idLossRegion;
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let role = store.find('role').objectAt(0);  
        assert.ok(role.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-role-category-validation-error').is(':hidden'));
    });
    fillIn('.t-role-name', '');
    page.categoryOneRemove();
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-role-category-validation-error').is(':visible'));
    });
    fillIn('.t-role-name', RD.nameOne);
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-role-category-validation-error').is(':visible'));
    });
    let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=2z&page_size=25';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, '2z');
    page.categoryClickOptionTwo();
    andThen(() => {
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-role-category-validation-error').is(':hidden'));
    });
    let payload = RF.put({id: RD.idOne, categories: [CD.idTwo+'2z']});
    let response = Ember.$.extend(true, {}, payload);
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('when you change a related location level it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    let location_level = LLF.put({id: LLD.idOne, name: LLD.nameRegion});
    let payload = RF.put({id: RD.idOne, location_level: location_level.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

// test('clicking cancel button will take from detail view to list view', (assert) => {
//     visit(ROLE_URL);
//     andThen(() => {
//         assert.equal(currentURL(), ROLE_URL);
//     });
//     click('.t-grid-data:eq(7)');
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//     });
//     generalPage.cancel();
//     andThen(() => {
//         assert.equal(currentURL(), ROLE_URL);
//     });
// });

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-role-name', RD.namePut);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-role-name').val(), RD.namePut);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-role-name', RD.nameTwo);
    page.locationLevelClickDropdown(); 
    page.locationLevelClickOptionTwo(); 
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), ROLE_URL);
            let role = store.find('role', RD.idOne);
            assert.equal(role.get('name'), RD.nameOne);
        });
    });
});

test('when click delete, role is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + RD.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(store.find('role', RD.idOne).get('length'), undefined);
    });
});

/*ROLE TO CATEGORY M2M*/
test('clicking and typing into power select for categories will fire off xhr request for all categories', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(page.categoriesSelected(), 1);
    });
    let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=a&page_size=25';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    //test filter out new
    run(function() {
        store.push('category', {id: 'testingNewFilter', name: 'wataA', new: true});
    });
    fillIn(CATEGORY_SEARCH, 'a');
    andThen(() => {
        assert.equal(page.categoryOptionLength(), PAGE_SIZE+3); 
        assert.equal(page.categoriesSelected(), 1);
        const role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(role.get('categories').get('length'), 1);
    });
    page.categoryClickOptionThree();
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(role.get('categories').get('length'), 2);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(page.categoriesSelected(), 2);
    });
    let category = CF.put({id: CD.idOne, name: CD.nameOne});
    let payload = RF.put({id: RD.idOne, location_level: LLD.idOne, categories: [category.id, CD.idSelected]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('can remove and add back same category', (assert) => {
    visit(DETAIL_URL);
    page.categoryOneRemove();
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(role.get('categories').get('length'), 0);
        assert.equal(page.categoriesSelected(), 0);
    });
    let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=2z&page_size=25';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, '2z');
    page.categoryClickOptionTwo();
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        let join_model_id = role.get('role_category_fks')[0];
        let join_model = store.find('role-category', join_model_id);
        assert.equal(join_model.get('removed'), true);
        assert.equal(role.get('categories').get('length'), 1);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(page.categoriesSelected(), 1);
    });
    let payload = RF.put({id: RD.idOne, categories: [CD.idTwo+'2z']});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('starting with multiple categories, can remove all categories (while not populating options) and add back', (assert) => {
    detail_data.categories = [...detail_data.categories, CF.get(CD.idTwo)];
    detail_data.categories[1].name = CD.nameOne + 'i';
    visit(DETAIL_URL);
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('categories').get('length'), 2);
        assert.equal(page.categoriesSelected(), 2);
    });
    page.categoryOneRemove();
    page.categoryOneRemove();
    andThen(() => {
        assert.equal(page.categoriesSelected(), 0);
    });
    let category_endpoint = PREFIX + '/admin/categories/?name__icontains=repair1&page_size=25';
    xhr(category_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'repair1');
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 2);
        assert.equal(role.get('categories').get('length'), 0);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(page.categoryOptionLength(), 2);
    });
    page.categoryClickOptionOneEq();
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 2);
        assert.equal(role.get('categories').get('length'), 1);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(page.categoriesSelected(), 1);
    });
    let payload = RF.put({id: RD.idOne, categories: [CD.idGridOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('search will filter down on categories in store correctly by removing and adding a category back', (assert) => {
    detail_data.categories = [...detail_data.categories, CF.get(CD.idTwo)];
    detail_data.categories[1].id =  'abc123';
    detail_data.categories[1].name =  CD.nameOne + ' scooter';
    visit(DETAIL_URL);
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('categories').get('length'), 2);
        assert.equal(page.categoriesSelected(), 2);
    });
    page.categoryOneRemove();
    andThen(() => {
        assert.equal(page.categoriesSelected(), 1);
    });
    let category_endpoint = PREFIX + '/admin/categories/?name__icontains=repair1&page_size=25';
    xhr(category_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'repair1');
    andThen(() => {
        assert.equal(page.categoryOptionLength(), 2);
    });
    page.categoryClickOptionOneEq();
    andThen(() => {
        let role = store.find('role', RD.idOne);
        assert.equal(role.get('role_category_fks').length, 2);
        assert.equal(role.get('categories').get('length'), 2);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.deepEqual(role.get('categories_ids'), ['abc123', CD.idGridOne]);
        assert.equal(page.categoriesSelected(), 2);
    });
    let payload = RF.put({id: RD.idOne, categories: ['abc123', CD.idGridOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('clicking and typing into power select for categories will not filter if spacebar pressed', (assert) => {
    visit(DETAIL_URL);
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, ' ');
    andThen(() => {
        assert.equal(page.categoriesSelected(), 1);
        assert.equal(page.categoryOptionLength(), 1);
        assert.equal(find(`${CATEGORY_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.no_results);
    });
    let response = RF.detail(RD.idOne);
    let payload = RF.put({id: RD.idOne, categories: [CD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});
