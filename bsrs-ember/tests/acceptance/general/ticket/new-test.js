import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {ticket_payload, required_ticket_payload} from 'bsrs-ember/tests/helpers/payloads/ticket';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import selectize from 'bsrs-ember/tests/pages/selectize';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const TICKET_NEW_URL = BASE_URL + '/new/1';
const TICKET_LIST_URL = PREFIX + BASE_URL + '/?page=1';
const TICKET_POST_URL = PREFIX + BASE_URL + '/';
const NUMBER_6 = {keyCode: 54};
const LETTER_B = {keyCode: 66};
const BACKSPACE = {keyCode: 8};
const SPACEBAR = {keyCode: 32};
const LOCATION = '.t-ticket-location-select > .ember-basic-dropdown-trigger';
const LOCATION_DROPDOWN = '.t-ticket-location-select-dropdown > .ember-power-select-options';
const ASSIGNEE = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
const ASSIGNEE_DROPDOWN = '.t-ticket-assignee-select-dropdown > .ember-power-select-options';
const CC = '.t-ticket-cc-select > .ember-basic-dropdown-trigger';
const CC_DROPDOWN = '.t-ticket-cc-select-dropdown > .ember-power-select-options';
const CC_SEARCH = '.ember-power-select-trigger-multiple-input';
const SEARCH = '.ember-power-select-search input';

let application, store, list_xhr, location_xhr, people_xhr, original_uuid, category_one_xhr, category_two_xhr, category_three_xhr, counter;

module('Acceptance | ticket new test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(TICKET_LIST_URL, 'GET', null, {}, 200, TF.empty());
        let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
        xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
        location_xhr = xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LF.search());
        //repair with child of electrical and wat
        let category = {id: CD.idOne, name: CD.nameOne, parent: null, children_fks: [CD.idTwo]};
        category.children = [{id: CD.idTwo, name: CD.nameTwo, children_fks: [CD.idChild]}, {id: CD.unusedId , name: CD.nameUnused, children_fks: []}];
        category_one_xhr = xhr(`${PREFIX}/admin/categories/${CD.idOne}/`, 'GET', null, {}, 200, category);
        //electrical
        let category_two = {id: CD.idTwo, name: CD.nameTwo, parent: {id: CD.idOne}, children_fks: [CD.idChild]};
        category_two.children = [{id: CD.idChild, name: CD.nameElectricalChild, children_fks: []}];
        category_two_xhr = xhr(`${PREFIX}/admin/categories/${CD.idTwo}/`, 'GET', null, {}, 200, category_two);
        //electrical child = outlet
        let category_three = {id: CD.idChild, name: CD.nameElectricalChild, parent: {id: CD.idTwo}, children_fks: []};
        category_three_xhr = xhr(`${PREFIX}/admin/categories/${CD.idChild}/`, 'GET', null, {}, 200, category_three);
        counter = 0;
    },
    afterEach() {
        counter = 0;
        Ember.run(application, 'destroy');
    }
});

test('validation works and when hit save, we do same post', (assert) => {
    page.visit();
    andThen(() => {
        patchRandom(counter);
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-status-validation-error').is(':hidden'));
        assert.ok(find('.t-priority-validation-error').is(':hidden'));
        assert.ok(find('.t-assignee-validation-error').is(':hidden'));
        assert.ok(find('.t-location-validation-error').is(':hidden'));
        assert.ok(find('.t-category-validation-error').is(':hidden'));
        assert.ok(find('.t-request-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-status-validation-error').is(':visible'));
        assert.ok(find('.t-priority-validation-error').is(':visible'));
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
        assert.ok(find('.t-request-validation-error').is(':visible'));
    });
    fillIn('.t-ticket-request', TD.requestOne);
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-priority-validation-error').is(':visible'));
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
        assert.ok(find('.t-request-validation-error').is(':hidden'));
    });
    page.statusClickDropdown();
    page.statusClickOptionOne();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-priority-validation-error').is(':visible'));
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.priorityClickDropdown();
    page.priorityClickOptionOne();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    people_xhr = xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PF.search());
    page.assigneeClickDropdown();
    fillIn(`${SEARCH}`, 'b');
    page.assigneeClickOptionTwo();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '6');
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.equal(find('.t-category-validation-error').length, 1);
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.equal(find('.t-category-validation-error').length, 1);
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    clearxhr(category_three_xhr);
    page.categoryThreeClickDropdown();
    page.categoryThreeClickOptionOne();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-category-validation-error').is(':hidden'));
    });
    generalPage.save();
    xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

test('selecting a top level category will alter the url and can cancel/discard changes and return to index', (assert) => {
    page.visit();
    patchRandom(counter);
    click('.t-add-new');
    clearxhr(location_xhr);
    clearxhr(category_three_xhr);
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
        // assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));//
        assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));
        assert.equal(components, 1);
    });
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        assert.equal(store.find('category').get('length'), 5);
        let tickets = store.find('ticket');
        assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 2);
        assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
        assert.equal(components, 2);
    });
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(store.find('category').get('length'), 6);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('has_many_children').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 1);
        assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
        assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
        assert.equal(components, 3);
    });
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), TICKET_NEW_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), TICKET_NEW_URL);
            assert.ok(generalPage.modalIsHidden());
            let components = page.selectizeComponents();
            let tickets = store.find('ticket');
            assert.equal(tickets.get('length'), 1);
            assert.equal(store.find('category').get('length'), 6);
            assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
            assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('has_many_children').get('length'), 2);
            assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 1);
            assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
            assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
            assert.equal(components, 3);
        });
    });
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), TICKET_NEW_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), TICKET_URL);
        });
    });
});

test('selecting category tree and removing a top level category will remove children categories already selected', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    //clear out first xhr to change unusedId has_children to true
    clearxhr(category_one_xhr);
    let category = {id: CD.idOne, name: CD.nameOne, parent: null, children_fks: [CD.idTwo]};
    category.children = [{id: CD.idTwo, name: CD.nameTwo, children_fks: [CD.idChild]}, {id: CD.unusedId , name: CD.nameUnused, children_fks: [CD.idChild]}];
    category_one_xhr = xhr(`${PREFIX}/admin/categories/${CD.idOne}/`, 'GET', null, {}, 200, category);
    page.visitNew();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
        assert.equal(components, 1);
    });
    //first select
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        assert.equal(store.find('category').get('length'), 5);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 2);
        assert.equal(components, 2);
    });
    //second select
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('has_many_children').get('length'), 2);
        assert.equal(components, 3);
    });
    //third select
    clearxhr(category_three_xhr);
    page.categoryThreeClickDropdown();
    page.categoryThreeClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('has_many_children').get('length'), 2);
        assert.equal(components, 3);
    });
    //change second with same children as electrical (outlet);
    let category_unused = {id: CD.unusedId, name: CD.nameUnused, parent: {id: CD.idOne}, children_fks: [CD.idChild]};
    category_unused.children = [{id: CD.idChild, name: CD.nameElectricalChild, children_fks: []}];
    xhr(`${PREFIX}/admin/categories/${CD.unusedId}/`, 'GET', null, {}, 200, category_unused);
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionTwo();

    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('has_many_children').get('length'), 1);
        assert.equal(components, 3);
    });
    //change top level
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 0);
        assert.equal(components, 1);
    });
});

test('when selecting a new parent cateogry it should remove previously selected child category', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    page.visitNew();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
        assert.equal(components, 1);
    });
    //first select
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        assert.equal(store.find('category').get('length'), 5);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 2);
        assert.equal(components, 2);
    });
    //second select
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('has_many_children').get('length'), 2);
        assert.equal(components, 3);
    });
    //third select
    clearxhr(category_three_xhr);
    page.categoryThreeClickDropdown();
    page.categoryThreeClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('has_many_children').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('has_many_children').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(2).get('has_many_children').get('length'), 0);
        assert.equal(components, 3);
    });
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionTwo();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.ok(!ticket.get('location'));
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        let components = page.selectizeComponents();
        assert.equal(components, 2);
    });
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.ok(!ticket.get('location'));
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        let components = page.selectizeComponents();
        assert.equal(components, 1);
    });
});

/*TICKET TO ASSIGNEE*/
test('assignee component shows assignee for ticket and will fire off xhr to fetch assignees on search to change assignee', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    andThen(() => {
        assert.equal(page.assigneeInput(), GLOBALMSG.assignee_power_select);
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('assignee.id'), undefined);
        assert.equal(ticket.get('assignee_fk'), undefined);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
    xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PF.search());
    page.assigneeClickDropdown();
    fillIn(`${SEARCH}`, 'b');
    andThen(() => {
        assert.equal(page.assigneeInput(), GLOBALMSG.assignee_power_select);
        assert.equal(page.assigneeOptionLength(), 10);
        assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
        assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(1)`).text().trim(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
    });
    page.assigneeClickOptionOne();
    andThen(() => {
        assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    });
    page.assigneeClickDropdown();
    fillIn(`${SEARCH}`, '');
    andThen(() => {
        assert.equal(page.assigneeOptionLength(), 1);
        assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    });
    fillIn(`${SEARCH}`, 'b');
    andThen(() => {
        assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
        assert.equal(page.assigneeOptionLength(), 10);
        assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
        assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(1)`).text().trim(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
    });
    page.assigneeClickOptionTwo();
    andThen(() => {
        assert.equal(page.assigneeInput(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('assignee.id'), PD.idSearch);
        assert.equal(ticket.get('assignee_fk'), undefined);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    //search specific assignee
    xhr(`${PREFIX}/admin/people/?fullname__icontains=Boy1`, 'GET', null, {}, 200, PF.search());
    page.assigneeClickDropdown();
    fillIn(`${SEARCH}`, 'Boy1');
    andThen(() => {
        assert.equal(page.assigneeInput(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
        assert.equal(page.assigneeOptionLength(), 2);
        assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    });
    page.assigneeClickOptionOne();
    andThen(() => {
        assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('assignee.id'), PD.idBoy);
        assert.equal(ticket.get('assignee_fk'), undefined);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
});

/*TICKET TO LOCATION 1 to Many*/
test('selecting new location will not affect other selectize components and will only render one tab', (assert) => {
    clearxhr(list_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    page.priorityClickDropdown();
    page.priorityClickOptionOne();
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '6');
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(page.priorityInput(), TD.priorityOne);
        assert.equal(page.locationInput(), LD.storeNameTwo);
        assert.equal(find('.t-tab').length, 1);
    });
});

test('location new component shows location for ticket and will fire off xhr to fetch locations on search to change location', (assert) => {
    clearxhr(list_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        assert.equal(find(`${LOCATION_DROPDOWN} > li`).length, 2);
    });
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(page.locationInput(), LD.storeNameTwo);
        let ticket = store.find('ticket');
        assert.equal(ticket.objectAt(0).get('location.id'), LD.idTwo);
        assert.equal(ticket.objectAt(0).get('location_fk'), undefined);
        assert.ok(ticket.objectAt(0).get('isDirtyOrRelatedDirty'));
    });
});

test('removes location dropdown on search to change location', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    location_xhr = xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LF.search());
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        assert.equal(page.locationOptionLength(), 2);
    });
    fillIn(`${SEARCH}`, ' ');
    andThen(() => {
        assert.equal(find(`${LOCATION_DROPDOWN}`).text().trim(), 'No results found');
    });
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        assert.equal(page.locationOptionLength(), 2);
    });
});

/*TICKET CC M2M*/
test('clicking and typing into power select for people will fire off xhr request for all people', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.ok(!ticket.get('cc.length'));
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
    xhr(people_endpoint, 'GET', null, {}, 200, PF.list());
    page.ccClickDropdown();
    fillIn(`${CC_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(page.ccOptionLength(), 1);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
    });
    page.ccClickDonald();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    page.ccClickDropdown();
    fillIn(`${CC_SEARCH}`, '');
    andThen(() => {
        assert.equal(page.ccOptionLength(), 1);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
    });
    fillIn(`${CC_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.equal(page.ccOptionLength(), 1);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    });
    //search specific cc
    page.ccClickDropdown();
    xhr(`${PREFIX}/admin/people/?fullname__icontains=Boy`, 'GET', null, {}, 200, PF.search());
    fillIn(`${CC_SEARCH}`, 'Boy');
    andThen(() => {
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.equal(page.ccOptionLength(), 10);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    });
    page.ccClickOptionOne();
    andThen(() => {
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.equal(page.ccTwoSelected().indexOf(PD.nameBoy), 2);
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
        assert.equal(ticket.get('cc').objectAt(1).get('id'), PD.idBoy);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
});

test('can remove and add back same cc and save empty cc', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.ok(!ticket.get('cc.length'));
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
    xhr(people_endpoint, 'GET', null, {}, 200, PF.list());
    page.ccClickDropdown();
    fillIn(`${CC_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(page.ccOptionLength(), 1);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
    });
    page.ccClickDonald();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    page.ccOneRemove();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.equal(ticket.get('cc').get('length'), 0);
    });
});

test('all required fields persist correctly when the user submits a new ticket form', (assert) => {
    page.visit();
    andThen(() => {
        patchRandom(counter);
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.equal(store.find('ticket').get('length'), 1);
        const ticket = store.find('ticket', UUID.value);
        assert.ok(ticket.get('isNotDirty'));
        assert.ok(ticket.get('new'));
    });
    people_xhr = xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PF.search());
    page.assigneeClickDropdown();
    fillIn(`${SEARCH}`, 'b');
    page.assigneeClickOptionTwo();
    andThen(() => {
        assert.equal(page.assigneeInput(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
        let ticket = store.findOne('ticket');
        assert.ok(ticket.get('assignee'));
        assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    page.statusClickDropdown();
    page.statusClickOptionOne();
    page.priorityClickDropdown();
    page.priorityClickOptionOne();
    andThen(() => {
        let ticket = store.find('ticket', UUID.value);
        assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
        assert.equal(ticket.get('status.id'), TD.statusOneId);
        assert.equal(ticket.get('priority.id'), TD.priorityOneId);
    });
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        //ensure route doesn't change current selections
        assert.equal(page.locationOptionLength(), 2);
        let ticket = store.find('ticket', UUID.value);
        assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
        assert.equal(ticket.get('status.id'), TD.statusOneId);
        assert.equal(ticket.get('priority.id'), TD.priorityOneId);
    });
    page.locationClickOptionTwo();
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    clearxhr(category_three_xhr);
    page.categoryThreeClickDropdown();
    page.categoryThreeClickOptionOne();
    page.requestFillIn(TD.requestOneGrid);
    required_ticket_payload.request = TD.requestOneGrid;
    xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('ticket').get('length'), 1);
        let persisted = store.find('ticket', UUID.value);
        assert.ok(persisted.get('assignee'));
        assert.equal(persisted.get('new'), undefined);
        assert.equal(persisted.get('assignee.id'), PD.idSearch);
        assert.equal(persisted.get('request'), TD.requestOneGrid);
        assert.ok(persisted.get('location'));
        assert.equal(persisted.get('location.id'), LD.idTwo);
        assert.equal(persisted.get('status.id'), TD.statusOneId);
        assert.ok(persisted.get('isNotDirty'));
        assert.ok(persisted.get('isNotDirtyOrRelatedNotDirty'));
    });
});
