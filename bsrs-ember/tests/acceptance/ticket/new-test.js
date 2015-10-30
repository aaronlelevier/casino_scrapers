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
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {ticket_payload, required_ticket_payload} from 'bsrs-ember/tests/helpers/payloads/ticket';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import selectize from 'bsrs-ember/tests/pages/selectize';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const TICKET_NEW_URL = BASE_URL + '/new';
const TICKET_LIST_URL = PREFIX + BASE_URL + '/?page=1';
const TICKET_POST_URL = PREFIX + BASE_URL + '/';
const NUMBER_6 = {keyCode: 54};
const LETTER_B = {keyCode: 66};
const BACKSPACE = {keyCode: 8};

let application, store, list_xhr, location_xhr, people_xhr, original_uuid, category_one_xhr, category_two_xhr, category_three_xhr, counter;

module('sco Acceptance | ticket new test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(TICKET_LIST_URL, 'GET', null, {}, 200, TICKET_FIXTURES.empty());
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.top_level());
        location_xhr = xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LOCATION_FIXTURES.search());
        let category = {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent: null, has_children: true};
        category.children = [{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, has_children: true}, {id: CATEGORY_DEFAULTS.unusedId , name: CATEGORY_DEFAULTS.nameUnused, has_children: false}];
        category_one_xhr = xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idOne}/`, 'GET', null, {}, 200, category);
        let category_two = {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent: {id: CATEGORY_DEFAULTS.idOne}, has_children: true};
        category_two.children = [{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild, has_children:false}];
        category_two_xhr = xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idTwo}/`, 'GET', null, {}, 200, category_two);
        let category_three = {id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild, parent: {id: CATEGORY_DEFAULTS.idTwo}, has_children: false};
        category_three_xhr = xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idChild}/`, 'GET', null, {}, 200, category_three);
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
        assert.equal(find('.t-category-validation-error').length, 0);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-status-validation-error').is(':visible'));
        assert.ok(find('.t-priority-validation-error').is(':visible'));
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.statusClickOptionOne();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-priority-validation-error').is(':visible'));
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.priorityClickOptionOne();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL);
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    people_xhr = xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    page.assigneeFillIn('b');
    let assignee_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    triggerEvent(`${assignee_component} > .selectize-input input`, 'keyup', LETTER_B);
    page.assigneeClickOptionTwo();
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL + '?search_assignee=b');
        assert.ok(find('.t-location-validation-error').is(':visible'));
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.locationFillIn('6');
    let location_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    triggerEvent(`${location_component} > .selectize-input input`, 'keyup', NUMBER_6);
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL + '?search_assignee=b&search_location=6');
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.categoryClickOptionOne();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL + '?search_assignee=b&search_location=6');
        assert.equal(find('.t-category-validation-error').length, 1);
        // assert.ok(find('.t-category-validation-error').is(':visible'));//??? sco
    });
    page.categoryTwoClickOptionOne();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL + '?search_assignee=b&search_location=6');
        assert.equal(find('.t-category-validation-error').length, 1);
        assert.ok(find('.t-category-validation-error').is(':visible'));
    });
    page.categoryThreeClickOptionOne();
    andThen(() => {
        assert.equal(currentURL(), TICKET_NEW_URL + '?search_assignee=b&search_location=6');
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
        assert.equal(store.find('category').get('length'), 3);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
        assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));
        assert.equal(components, 1);
    });
    let category_first_component = 'select.t-ticket-category-select:eq(0) + .selectize-control';
    click(`${category_first_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
        assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
        assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
        assert.equal(components, 2);
    });
    let $category_second_component = 'select.t-ticket-category-select:eq(1) + .selectize-control';
    click(`${$category_second_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(store.find('category').get('length'), 5);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
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
            assert.equal(store.find('category').get('length'), 5);
            assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
            assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
            assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
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

test('selecting and removing a top level category will remove children categories already selected', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    page.visitNew();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 3);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
        assert.equal(components, 1);
    });
    //first select
    page.categoryClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
        assert.equal(components, 2);
    });
    //second select
    page.categoryTwoClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
        assert.equal(components, 3);
    });
    //third select
    page.categoryThreeClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
        assert.equal(components, 3);
    });
    //change second
    let category_unused = {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameUnused, parent: {id: CATEGORY_DEFAULTS.idOne}};
    category_unused.children = [{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.unusedId}/`, 'GET', null, {}, 200, category_unused);
    page.categoryTwoClickOptionTwo();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
        assert.equal(components, 3);
    });
    //change top level
    let category_reselect = {id: CATEGORY_DEFAULTS.idThree, name: CATEGORY_DEFAULTS.nameThree, parent: null};
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idThree}/`, 'GET', null, {}, 200, category_reselect);
    page.categoryClickOptionTwo();
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
        assert.equal(components, 1);
    });
});

/*TICKET TO ASSIGNEE*/
test('shows assignee for ticket and will fire off xhr to fetch assignee(persons) on search to change assignee', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    people_xhr = xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    page.assigneeFillIn('b');
    let assignee_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    triggerEvent(`${assignee_component} > .selectize-input input`, 'keyup', LETTER_B);
    andThen(() => {
        assert.equal(page.assigneeOptionLength(), 10);
    });
    page.assigneeFillIn('');
    triggerEvent(`${assignee_component} > .selectize-input input`, 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(page.assigneeOptionLength(), 0);
    });
    page.assigneeFillIn('b');
    triggerEvent(`${assignee_component} > .selectize-input input`, 'keyup', LETTER_B);
    andThen(() => {
        assert.equal(page.assigneeOptionLength(), 10);
    });
});


test('when hit backspace should remove assignee from ticket', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    people_xhr = xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    let selector = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    page.assigneeFillIn('b');
    triggerEvent(`${selector} > .selectize-input input`, 'keyup', LETTER_B);
    page.assigneeClickOptionTwo();
    andThen(() => {
       assert.equal(find('.t-ticket-assignee-select').val(), PEOPLE_DEFAULTS.idSearch);
       let ticket = store.findOne('ticket');
       assert.ok(ticket.get('assignee'));
       assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idSearch);
       assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    triggerEvent(`${selector} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
       let ticket = store.findOne('ticket');
       assert.ok(!ticket.get('assignee'));
       assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
});

/*TICKET TO PRIORITY*/
test('should be able to add and remove priority but not remove div options', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    page.priorityClickOptionOne();
    andThen(() => {
       assert.equal(page.priorityInput(), TICKET_DEFAULTS.priorityOneId);
       let ticket = store.findOne('ticket');
       assert.ok(ticket.get('priority'));
       assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityOneId);
       assert.equal(page.priorityOptionLength(), 4);
       assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    let selector = 'select.t-ticket-priority-select:eq(0) + .selectize-control';
    triggerEvent(`${selector} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
       let ticket = store.findOne('ticket');
       assert.ok(!ticket.get('priority'));
       assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
       assert.equal(page.priorityOptionLength(), 4);
    });
});

/*TICKET TO STATUS*/
test('should be able to add and remove status but not remove div options', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    page.statusClickOptionOne();
    andThen(() => {
       assert.equal(page.statusInput(), TICKET_DEFAULTS.statusOneId);
       let ticket = store.findOne('ticket');
       assert.ok(ticket.get('status'));
       assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusOneId);
       assert.equal(page.statusOptionLength(), 8);
       assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    let selector = 'select.t-ticket-status-select:eq(0) + .selectize-control';
    triggerEvent(`${selector} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
       let ticket = store.findOne('ticket');
       assert.ok(!ticket.get('status'));
       assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
       assert.equal(page.statusOptionLength(), 8);
    });
});

/*TICKET TO LOCATION 1 to Many*/
test('selecting new location will not affect other selectize components and will only render one tab', (assert) => {
    clearxhr(list_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    page.priorityClickOptionOne();
    page.locationFillIn('6');
    let location_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    triggerEvent(`${location_component} > .selectize-input input`, 'keyup', NUMBER_6);
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(page.priorityInput(), TICKET_DEFAULTS.priorityOneId);
        assert.equal(find('.t-tab').length, 1);
    });
});

test('location new component shows location for ticket and will fire off xhr to fetch locations on search to change location', (assert) => {
    clearxhr(list_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    page.locationFillIn('6');
    let location_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    triggerEvent(`${location_component} > .selectize-input input`, 'keyup', NUMBER_6);
    andThen(() => {
        assert.equal(find(`${location_component} > .selectize-dropdown div.option`).length, 2);
    });
    page.locationClickOptionTwo();
    andThen(() => {
       assert.equal(find('.t-ticket-location-select').val(), LOCATION_DEFAULTS.idTwo);
       let ticket = store.find('ticket');
       assert.equal(ticket.objectAt(0).get('location.id'), LOCATION_DEFAULTS.idTwo);
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
    location_xhr = xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LOCATION_FIXTURES.search());
    let location_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    page.locationFillIn('6');
    triggerEvent(`${location_component} > .selectize-input input`, 'keyup', NUMBER_6);
    andThen(() => {
        assert.equal(page.locationOptionLength(), 2);
    });
    page.locationFillIn('');
    triggerEvent(`${location_component} > .selectize-input input`, 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(page.locationOptionLength(), 0);
    });
    page.locationFillIn('6');
    triggerEvent(`${location_component} > .selectize-input input`, 'keyup', NUMBER_6);
    andThen(() => {
        assert.equal(page.locationOptionLength(), 2);
    });
});

test('when hit backspace should remove location from ticket', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    clearxhr(category_one_xhr);
    clearxhr(category_two_xhr);
    clearxhr(category_three_xhr);
    page.visitNew();
    location_xhr = xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LOCATION_FIXTURES.search());
    page.locationFillIn('6');
    let selector = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    triggerEvent(`${selector} > .selectize-input input`, 'keyup', NUMBER_6);
    page.locationClickOptionTwo();
    andThen(() => {
       assert.equal(find('.t-ticket-location-select').val(), LOCATION_DEFAULTS.idTwo);
       let ticket = store.findOne('ticket');
       assert.ok(ticket.get('location'));
       assert.equal(ticket.get('location').get('id'), LOCATION_DEFAULTS.idTwo);
       assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    triggerEvent(`${selector} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
       let ticket = store.findOne('ticket');
       assert.ok(!ticket.get('location'));
       assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
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
        assert.ok(store.find('ticket', UUID.value).get('isNotDirty'));
    });
    people_xhr = xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    page.assigneeFillIn('b');
    let assignee_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    triggerEvent(`${assignee_component} > .selectize-input input`, 'keyup', LETTER_B);
    page.assigneeClickOptionTwo();
    andThen(() => {
       assert.equal(find('.t-ticket-assignee-select').val(), PEOPLE_DEFAULTS.idSearch);
       let ticket = store.findOne('ticket');
       assert.ok(ticket.get('assignee'));
       assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idSearch);
       assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    page.statusClickOptionOne();
    page.priorityClickOptionOne();
    page.locationFillIn('6');
    let location_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    triggerEvent(`${location_component} > .selectize-input input`, 'keyup', NUMBER_6);
    andThen(() => {
        assert.equal(find(`${location_component} > .selectize-dropdown div.option`).length, 2);
    });
    page.locationClickOptionTwo();
    page.categoryClickOptionOne();
    page.categoryTwoClickOptionOne();
    page.categoryThreeClickOptionOne();
    xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
    generalPage.save();
    andThen(() => {
       assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('ticket').get('length'), 1);
        let persisted = store.find('ticket', UUID.value);
        assert.ok(persisted.get('assignee'));
        assert.equal(persisted.get('assignee.id'), PEOPLE_DEFAULTS.idSearch);
        assert.ok(persisted.get('location'));
        assert.equal(persisted.get('location.id'), LOCATION_DEFAULTS.idTwo);
        assert.equal(persisted.get('status.id'), TICKET_DEFAULTS.statusOneId);
        assert.ok(persisted.get('isNotDirty'));
        assert.ok(persisted.get('isNotDirtyOrRelatedNotDirty'));
    });
});
