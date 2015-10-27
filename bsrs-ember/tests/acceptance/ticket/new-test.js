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
import page from 'bsrs-ember/tests/pages/tickets-new';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const TICKET_NEW_URL = BASE_URL + '/new';
const TICKET_LIST_URL = PREFIX + BASE_URL + '/?page=1';
const TICKET_POST_URL = PREFIX + BASE_URL + '/';
const NUMBER_6 = {keyCode: 54};
const LETTER_B = {keyCode: 66};
const BACKSPACE = {keyCode: 8};

let application, store, list_xhr, location_xhr, people_xhr;

module('Acceptance | ticket new test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        list_xhr = xhr(TICKET_LIST_URL, 'GET', null, {}, 200, TICKET_FIXTURES.empty());
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.top_level());
        //Location
        let locations = [LOCATION_FIXTURES.get(LOCATION_DEFAULTS.idThree, LOCATION_DEFAULTS.storeNameFour), LOCATION_FIXTURES.get(LOCATION_DEFAULTS.idTwo, LOCATION_DEFAULTS.storeNameTwo)];
        let response = {'count':2,'next':null,'previous':null,'results': locations};
        location_xhr = xhr(`${PREFIX}/admin/locations/&name__icontains=6`, 'GET', null, {}, 200, response);
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
        Ember.run(application, 'destroy');
    }
});

// test('validation works and when hit save, we do same post', (assert) => {
//     page.visit();
//     click('.t-add-new');
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_NEW_URL);
//         assert.ok(find('.t-status-validation-error').is(':hidden'));
//         assert.ok(find('.t-priority-validation-error').is(':hidden'));
//         assert.ok(find('.t-assignee-validation-error').is(':hidden'));
//         assert.ok(find('.t-location-validation-error').is(':hidden'));
//     });
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_NEW_URL);
//         assert.ok(find('.t-status-validation-error').is(':visible'));
//         assert.ok(find('.t-priority-validation-error').is(':visible'));
//         assert.ok(find('.t-assignee-validation-error').is(':visible'));
//         assert.ok(find('.t-location-validation-error').is(':visible'));
//     });
//     fillIn('.t-ticket-status', TICKET_DEFAULTS.statusOneId);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_NEW_URL);
//         assert.ok(find('.t-priority-validation-error').is(':visible'));
//         assert.ok(find('.t-assignee-validation-error').is(':visible'));
//         assert.ok(find('.t-location-validation-error').is(':visible'));
//     });
//     fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityOneId);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_NEW_URL);
//         assert.ok(find('.t-assignee-validation-error').is(':visible'));
//         assert.ok(find('.t-location-validation-error').is(':visible'));
//     });
//     people_xhr = xhr(`${PREFIX}/admin/people/?search=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
//     let $assignee_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
//     click(`${$assignee_component} > .selectize-input`);
//     fillIn(`${$assignee_component} > .selectize-input input`, 'b');
//     triggerEvent(`${$assignee_component} > .selectize-input input`, 'keyup', LETTER_B);
//     click(`${$assignee_component} > .selectize-dropdown div.option:eq(1)`);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_NEW_URL + '?search_assignee=b');
//         assert.ok(find('.t-location-validation-error').is(':visible'));
//     });
//     let $location_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
//     click(`${$location_component} > .selectize-input`);
//     fillIn(`${$location_component} > .selectize-input input`, '6');
//     triggerEvent(`${$location_component} > .selectize-input input`, 'keyup', NUMBER_6);
//     click(`${$location_component} > .selectize-dropdown div.option:eq(1)`);
//     generalPage.save();
//     xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('selecting a top level category will alter the url and can cancel/discard changes and return to index', (assert) => {
//     clearxhr(location_xhr);
//     random.uuid = function() { return Ember.uuid(); };
//     page.visitNew();
//     andThen(() => {
//         let components = page.selectizeComponents();
//         assert.equal(store.find('category').get('length'), 4);
//         let tickets = store.find('ticket');
//         assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
//         assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
//         assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));
//         assert.equal(components, 1);
//     });
//     let category = {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent: null};
//     category.children = [{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo}];
//     xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idOne}/`, 'GET', null, {}, 200, category);
//     let $first_component = 'select.t-ticket-category-select:eq(0) + .selectize-control';
//     click(`${$first_component} > .selectize-dropdown div.option:eq(0)`);
//     andThen(() => {
//         let components = page.selectizeComponents();
//         assert.equal(store.find('ticket').get('length'), 1);
//         assert.equal(store.find('category').get('length'), 4);
//         let tickets = store.find('ticket');
//         assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
//         assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 1);
//         assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
//         assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
//         assert.equal(components, 2);
//     });
//     let category_two = {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent: {id: CATEGORY_DEFAULTS.nameOne}};
//     category_two.children = [{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild}];
//     xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idTwo}/`, 'GET', null, {}, 200, category_two);
//     let $second_component = 'select.t-ticket-category-select:eq(1) + .selectize-control';
//     click(`${$second_component} > .selectize-dropdown div.option:eq(0)`);
//     andThen(() => {
//         let components = page.selectizeComponents();
//         let tickets = store.find('ticket');
//         assert.equal(tickets.get('length'), 1);
//         assert.equal(store.find('category').get('length'), 5);
//         assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
//         assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 1);
//         assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
//         assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
//         assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
//         assert.equal(components, 3);
//     });
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), TICKET_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//             assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
//         });
//     });
//     generalPage.clickModalCancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), TICKET_NEW_URL);
//             assert.ok(generalPage.modalIsHidden());
//             let components = page.selectizeComponents();
//             let tickets = store.find('ticket');
//             assert.equal(tickets.get('length'), 1);
//             assert.equal(store.find('category').get('length'), 5);
//             assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
//             assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 1);
//             assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
//             assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
//             assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
//             assert.equal(components, 3);
//         });
//     });
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), TICKET_NEW_URL);
//             assert.ok(generalPage.modalIsVisible());
//             assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), TICKET_URL);
//         });
//     });
// });

test('selecting and removing a top level category will remove children categories already selected', (assert) => {
    random.uuid = function() { return Ember.uuid(); };
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
    let category = {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent: null};
    category.children = [{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo}, {id: CATEGORY_DEFAULTS.unusedId , name: CATEGORY_DEFAULTS.nameUnused}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idOne}/`, 'GET', null, {}, 200, category);
    let $first_component = 'select.t-ticket-category-select:eq(0) + .selectize-control';
    click(`${$first_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        assert.equal(store.find('category').get('length'), 5);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
        assert.equal(components, 2);
    });
    //second select
    let category_two = {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent: {id: CATEGORY_DEFAULTS.idOne}};
    category_two.children = [{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idTwo}/`, 'GET', null, {}, 200, category_two);
    let $second_component = 'select.t-ticket-category-select:eq(1) + .selectize-control';
    click(`${$second_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 1);
        assert.equal(components, 3);
    });
    //third select
    let category_three = {id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild, parent: {id: CATEGORY_DEFAULTS.idTwo}};
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idChild}/`, 'GET', null, {}, 200, category_three);
    let $third_component = 'select.t-ticket-category-select:eq(2) + .selectize-control';
    click(`${$third_component} > .selectize-dropdown div.option:eq(0)`);
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
    click(`${$second_component} > .selectize-dropdown div.option:eq(1)`);
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
    click(`${$first_component} > .selectize-dropdown div.option:eq(1)`);
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
        assert.equal(components, 1);
    });
});

test('location new component shows location for ticket and will fire off xhr to fetch locations on search to change location', (assert) => {
    clearxhr(list_xhr);
    page.visitNew();
    let $first_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    click(`${$first_component} > .selectize-input`);
    fillIn(`${$first_component} > .selectize-input input`, '6');
    triggerEvent(`${$first_component} > .selectize-input input`, 'keyup', NUMBER_6);
    andThen(() => {
        assert.equal(find(`${$first_component} > .selectize-dropdown div.option`).length, 2);
    });
    click(`${$first_component} > .selectize-dropdown div.option:eq(1)`);
    andThen(() => {
       assert.equal(find('.t-ticket-location-select').val(), LOCATION_DEFAULTS.idTwo);
       let ticket = store.find('ticket');
       assert.equal(ticket.objectAt(0).get('location.id'), LOCATION_DEFAULTS.idTwo);
       assert.equal(ticket.objectAt(0).get('location_fk'), undefined);
       assert.ok(ticket.objectAt(0).get('isDirtyOrRelatedDirty'));
    });
});

/*TICKET TO ASSIGNEE*/
test('shows assignee for ticket and will fire off xhr to fetch assignee(persons) on search to change assignee', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    page.visitNew();
    people_xhr = xhr(`${PREFIX}/admin/people/?search=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    let $first_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    click(`${$first_component} > .selectize-input`);
    fillIn(`${$first_component} > .selectize-input input`, 'b');
    triggerEvent(`${$first_component} > .selectize-input input`, 'keyup', LETTER_B);
    andThen(() => {
        assert.equal(find(`${$first_component} > .selectize-dropdown div.option`).length, 10);
    });
    $first_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    click(`${$first_component} > .selectize-input`);
    fillIn(`${$first_component} > .selectize-input input`, '');
    triggerEvent(`${$first_component} > .selectize-input input`, 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(find(`${$first_component} > .selectize-dropdown div.option`).length, 0);
    });
    $first_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    click(`${$first_component} > .selectize-input`);
    fillIn(`${$first_component} > .selectize-input input`, 'b');
    triggerEvent(`${$first_component} > .selectize-input input`, 'keyup', LETTER_B);
    andThen(() => {
        assert.equal(find(`${$first_component} > .selectize-dropdown div.option`).length, 10);
    });
});

test('when hit backspace should remove person from assignee', (assert) => {
    clearxhr(list_xhr);
    clearxhr(location_xhr);
    page.visitNew();
    people_xhr = xhr(`${PREFIX}/admin/people/?search=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    let $assignee_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    click(`${$assignee_component} > .selectize-input`);
    fillIn(`${$assignee_component} > .selectize-input input`, 'b');
    triggerEvent(`${$assignee_component} > .selectize-input input`, 'keyup', LETTER_B);
    click(`${$assignee_component} > .selectize-dropdown div.option:eq(1)`);
    andThen(() => {
       assert.equal(find('.t-ticket-assignee-select').val(), PEOPLE_DEFAULTS.idSearch);
       let ticket = store.findOne('ticket');
       assert.ok(ticket.get('assignee'));
       assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idSearch);
       assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    $assignee_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
    click(`${$assignee_component} > .selectize-input`);
    fillIn(`${$assignee_component} > .selectize-input input`, '');
    triggerEvent(`${$assignee_component} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
       let ticket = store.findOne('ticket');
       assert.ok(!ticket.get('assignee'));
       assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
});

// test('all required fields persist correctly when the user submits a new ticket form', (assert) => {
//     page.visit();
//     click('.t-add-new');
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_NEW_URL);
//         assert.equal(store.find('ticket').get('length'), 1);
//         assert.ok(store.find('ticket', UUID.value).get('isNotDirty'));
//     });
//     people_xhr = xhr(`${PREFIX}/admin/people/?search=b`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
//     let $assignee_component = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
//     click(`${$assignee_component} > .selectize-input`);
//     fillIn(`${$assignee_component} > .selectize-input input`, 'b');
//     triggerEvent(`${$assignee_component} > .selectize-input input`, 'keyup', LETTER_B);
//     click(`${$assignee_component} > .selectize-dropdown div.option:eq(1)`);
//     andThen(() => {
//        assert.equal(find('.t-ticket-assignee-select').val(), PEOPLE_DEFAULTS.idSearch);
//        let ticket = store.findOne('ticket');
//        assert.ok(ticket.get('assignee'));
//        assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idSearch);
//        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//     });
//     fillIn('.t-ticket-status', TICKET_DEFAULTS.statusOneId);
//     fillIn('.t-ticket-priority', TICKET_DEFAULTS.priorityOneId);
//     let $location_component = 'select.t-ticket-location-select:eq(0) + .selectize-control';
//     click(`${$location_component} > .selectize-input`);
//     fillIn(`${$location_component} > .selectize-input input`, '6');
//     triggerEvent(`${$location_component} > .selectize-input input`, 'keyup', NUMBER_6);
//     andThen(() => {
//         assert.equal(find(`${$location_component} > .selectize-dropdown div.option`).length, 2);
//     });
//     click(`${$location_component} > .selectize-dropdown div.option:eq(1)`);
//     xhr(TICKET_POST_URL, 'POST', JSON.stringify(ticket_payload), {}, 201, Ember.$.extend(true, {}, ticket_payload));
//     generalPage.save();
//     andThen(() => {
//        assert.equal(currentURL(), TICKET_URL);
//         assert.equal(store.find('ticket').get('length'), 1);
//         let persisted = store.find('ticket', UUID.value);
//         assert.ok(persisted.get('assignee'));
//         assert.equal(persisted.get('assignee.id'), PEOPLE_DEFAULTS.idSearch);
//         assert.ok(persisted.get('location'));
//         assert.equal(persisted.get('location.id'), LOCATION_DEFAULTS.idTwo);
//         assert.equal(persisted.get('status.id'), TICKET_DEFAULTS.statusOneId);
//         assert.ok(persisted.get('isNotDirty'));
//         assert.ok(persisted.get('isNotDirtyOrRelatedNotDirty'));
//     });
// });
