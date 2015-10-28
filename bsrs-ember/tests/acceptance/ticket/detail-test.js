import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import selectize from 'bsrs-ember/tests/pages/selectize';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const LETTER_A = {keyCode: 65};
const LETTER_R = {keyCode: 82};
const LETTER_M = {keyCode: 77};
const LETTER_S = {keyCode: 83};
const NUMBER_6 = {keyCode: 54};
const SPACEBAR = {keyCode: 32};
const BACKSPACE = {keyCode: 8};

let application, store, endpoint, list_xhr, detail_xhr, detail_data, random_uuid;

module('Acceptance | amk ticket detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        detail_data = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, TICKET_FIXTURES.list());
        detail_xhr = xhr(endpoint + TICKET_DEFAULTS.idOne + '/', 'GET', null, {}, 200, detail_data);
        random.uuid = function() { return Ember.uuid(); };
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.top_level());
    },
    afterEach() {
        Ember.run(application, 'destroy');
        random.uuid = function() { return 'abc123'; };
    }
});

test('clicking a tickets subject will redirect to the given detail view', (assert) => {
    page.visit();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('when you deep link to the ticket detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirty'));
        assert.equal(page.subjectInput(), TICKET_DEFAULTS.subjectOne);
        assert.equal(page.priorityInput(), TICKET_DEFAULTS.priorityOneId);
        assert.equal(page.statusInput(), TICKET_DEFAULTS.statusOneId);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, subject: TICKET_DEFAULTS.subjectTwo, status: TICKET_DEFAULTS.statusTwoId, priority: TICKET_DEFAULTS.priorityTwoId});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    page.subject(TICKET_DEFAULTS.subjectTwo);
    page.priority(TICKET_DEFAULTS.priorityTwoId);
    page.status(TICKET_DEFAULTS.statusTwoId);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isDirty'));
    });
    let list = TICKET_FIXTURES.list();
    list.results[0].subject = TICKET_DEFAULTS.subjectOne;
    list.results[0].status = TICKET_DEFAULTS.statusOneId;
    list.results[0].priority = TICKET_DEFAULTS.priorityOneId;
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
        assert.equal(store.find('ticket').get('length'), 10);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirty'));
    });
});

test('when you click cancel, you are redirected to the ticket list view', (assert) => {
    page.visitDetail();
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('when editing the ticket subject to invalid, it checks for validation', (assert) => {
    page.visitDetail();
    page.subject('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-subject-validation-error').text().trim(), 'invalid subject');
    });
    page.subject('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-subject-validation-error').text().trim(), 'invalid subject');
    });
    page.subject(TICKET_DEFAULTS.subjectTwo);
    let url = PREFIX + DETAIL_URL + "/";
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, subject: TICKET_DEFAULTS.subjectTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    page.subject(TICKET_DEFAULTS.subjectTwo);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(page.subjectInput(), TICKET_DEFAULTS.subjectTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when click delete, ticket is deleted and removed from store', (assert) => {
    page.visitDetail();
    xhr(PREFIX + BASE_URL + '/' + TICKET_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
        assert.equal(store.find('ticket', TICKET_DEFAULTS.idOne).get('length'), undefined);
    });
});

// test('validation works and when hit save, we do same post', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.ok(find('.t-subject-validation-error').is(':hidden'));
//     });
//     page.subject('');
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.ok(find('.t-subject-validation-error').is(':visible'));
//     });
//     page.subject(TICKET_DEFAULTS.subjectOne);
//     page.priority(TICKET_DEFAULTS.priorityOneId);
//     page.status(TICKET_DEFAULTS.statusOneId);
//     let url = PREFIX + DETAIL_URL + '/';
//     let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, subject: TICKET_DEFAULTS.subjectOne, status: TICKET_DEFAULTS.statusOneId, priority: TICKET_DEFAULTS.priorityOneId});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKETS_URL);
//     });
// });

test('clicking cancel button will take from detail view to list view', (assert) => {
    page.visit();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    page.subject(TICKET_DEFAULTS.subjectTwo);
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
            assert.equal(page.subjectInput(), TICKET_DEFAULTS.subjectTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    page.visitDetail();
    page.subject(TICKET_DEFAULTS.subjectTwo);
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
            assert.equal(currentURL(), TICKETS_URL);
        });
    });
});

/*TICKET PEOPLE M2M*/
test('clicking and typing into selectize for people will fire off xhr request for all people', (assert) => {
    page.visitDetail();
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(page.ticketPeopleSelected(), 1);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
    xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
    let cc_component = 'select.t-ticket-people-select:eq(0) + .selectize-control';
    fillIn(`${cc_component} > .selectize-input input`, 'a');
    triggerEvent(`${cc_component} > .selectize-input input`, 'keyup', LETTER_A);
    click(`${cc_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('ticket_people_fks').length, 1);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ticketPeopleSelected(), 2);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_CURRENT_DEFAULTS.id, PEOPLE_DEFAULTS.id]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('can remove and add back same cc', (assert) => {
    page.visitDetail();
    page.removeTicketPeople();
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 0);
        assert.equal(page.ticketPeopleSelected(), 0);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=Mel';
    xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
    let cc_component = 'select.t-ticket-people-select:eq(0) + .selectize-control';
    fillIn(`${cc_component} > .selectize-input input`, 'Mel');
    triggerEvent(`${cc_component} > .selectize-input input`, 'keyup', LETTER_M);
    click(`${cc_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('ticket_people_fks').length, 1);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ticketPeopleSelected(), 1);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_DEFAULTS.id]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('when you deep link to the ticket detail can remove a cc', (assert) => {
    page.visitDetail();
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(page.ticketPeopleSelected(), 1);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let cc_component = 'select.t-ticket-people-select:eq(0) + .selectize-control';
    click(`${cc_component} > .selectize-input > div.item > a.remove:eq(0)`);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 0);
        assert.equal(page.ticketPeopleSelected(), 0);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: []});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('starting with multiple cc, can remove all ccs (while not populating options) and add back', (assert) => {
    detail_data.cc = [...detail_data.cc, PEOPLE_FIXTURES.get(PEOPLE_DEFAULTS.idTwo)];
    detail_data.cc[1].fullname = PEOPLE_DEFAULTS.fullname + 'i';
    page.visitDetail();
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 2);
        assert.equal(page.ticketPeopleSelected(), 2);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
    xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
    let cc_component = 'select.t-ticket-people-select:eq(0) + .selectize-control';
    click(`${cc_component} > .selectize-input > div.item > a.remove:eq(0)`);
    click(`${cc_component} > .selectize-input > div.item > a.remove:eq(0)`);
    andThen(() => {
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    fillIn(`${cc_component} > .selectize-input input`, 'a');
    triggerEvent(`${cc_component} > .selectize-input input`, 'keyup', LETTER_A);
    click(`${cc_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('ticket_people_fks').length, 2);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ticketPeopleSelected(), 1);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_CURRENT_DEFAULTS.id]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('search will filter down on people in store correctly by removing and adding a cc back', (assert) => {
    detail_data.cc = [...detail_data.cc, PEOPLE_FIXTURES.get(PEOPLE_DEFAULTS.idTwo)];
    detail_data.cc[1].fullname = PEOPLE_DEFAULTS.fullname + ' scooter';
    page.visitDetail();
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('cc').get('length'), 2);
        assert.equal(page.ticketPeopleSelected(), 2);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=sc';
    xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
    let cc_component = 'select.t-ticket-people-select:eq(0) + .selectize-control';
    click(`${cc_component} > .selectize-input > div.item > a.remove:eq(1)`);
    andThen(() => {
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    fillIn(`${cc_component} > .selectize-input input`, 'sc');
    triggerEvent(`${cc_component} > .selectize-input input`, 'keyup', LETTER_S);
    click(`${cc_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('ticket_people_fks').length, 2);
        assert.equal(ticket.get('cc').get('length'), 2);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ticketPeopleSelected(), 2);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.idTwo]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('clicking and typing into selectize for people will not filter if spacebar pressed', (assert) => {
    page.visitDetail();
    let cc_component = 'select.t-ticket-people-select:eq(0) + .selectize-control';
    fillIn(`${cc_component} > .selectize-input input`, ' ');
    triggerEvent(`${cc_component} > .selectize-input input`, 'keyup', SPACEBAR);
    andThen(() => {
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(page.ticketPeopleSelected(), 1);
        assert.equal(page.ticketPeopleOptions(), 0);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_DEFAULTS.id]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

/*TICKET CATEGORIES M2M*/
test('selectize options are rendered immediately when enter detail route and can save different top level category', (assert) => {
    page.visitDetail();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(components, 2);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
        assert.equal(ticket.get('categories').get('length'), 2);
        assert.equal(page.ticketTopLevelCategorySelected(), 1);
        assert.equal(page.ticketTopLevelCategoryOptions(), 2);
        assert.equal(page.ticketSecondLevelCategorySelected(), 1);
        assert.equal(page.ticketSecondLevelCategoryOptions(), 2);
    });
    let category = {id: CATEGORY_DEFAULTS.idThree, name: CATEGORY_DEFAULTS.nameThree, parent: null};
    category.children = [{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idThree}/`, 'GET', null, {}, 200, category);
    page.clickCategorySelectizeSecondOption();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(components, 2);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idThree);
        assert.equal(ticket.get('ticket_categories_fks').length, 2);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ticketCategorySelected(), 1);
        assert.equal(page.ticketCategoryOptions(), 2);
        assert.equal(page.ticketSecondLevelCategorySelected(), 0);
        assert.equal(page.ticketSecondLevelCategoryOptions(), 1);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, categories: [CATEGORY_DEFAULTS.idThree]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
    });
});

test('selecting a top level category will alter the url and can cancel/discard changes and return to index', (assert) => {
    //add 'wat' to children
    detail_data.categories[1].children.push({id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameUnused});
    page.visitDetail();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 5);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));
        assert.equal(components, 3);
    });
    //select same
    let first_component = 'select.t-ticket-category-select:eq(0) + .selectize-control';
    click(`${first_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('ticket').get('length'), 1);
        let tickets = store.find('ticket');
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
        assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));
        assert.equal(components, 3);
    });
    //select electrical from second level
    let category_two = {id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameUnused, parent: {id: CATEGORY_DEFAULTS.nameOne}};
    category_two.children = [{id: CATEGORY_DEFAULTS.idWatChild, name: CATEGORY_DEFAULTS.nameWatChild}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idTwo}/`, 'GET', null, {}, 200, category_two);
    let second_component = 'select.t-ticket-category-select:eq(1) + .selectize-control';
    click(`${second_component} > .selectize-dropdown div.option:eq(0)`);
    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(store.find('category').get('length'), 6);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 0);
        assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
        assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
        assert.equal(components, 2);
    });
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsHidden());
            let components = page.selectizeComponents();
            let tickets = store.find('ticket');
            assert.equal(tickets.get('length'), 1);
            assert.equal(store.find('category').get('length'), 6);
            assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
            assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
            assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 0);
            assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
            assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
            assert.equal(components, 2);
        });
    });
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), TICKETS_URL);
        });
    });
});

test('selecting and removing a top level category will remove children categories already selected', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 4);
        let tickets = store.find('ticket');
        assert.equal(components, 2);
    });
    //change top level
    let category_reselect = {id: CATEGORY_DEFAULTS.idThree, name: CATEGORY_DEFAULTS.nameThree, parent: null};
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idThree}/`, 'GET', null, {}, 200, category_reselect);
    let $first_component = 'select.t-ticket-category-select:eq(0) + .selectize-control';
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


/*TICKET TO LOCATION*/
test('location component shows location for ticket and will fire off xhr to fetch locations on search to change location', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(find('.t-ticket-location-select').val(), LOCATION_DEFAULTS.idOne);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idOne);
        assert.equal(ticket.get('location_fk'), LOCATION_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
        assert.equal(ticket.get('categories').get('length'), 2);
        assert.equal(page.ticketTopLevelCategorySelected(), 1);
        assert.equal(page.ticketTopLevelCategoryOptions(), 2);
        assert.equal(page.ticketSecondLevelCategorySelected(), 1);
        assert.equal(page.ticketSecondLevelCategoryOptions(), 2);
    });
    xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LOCATION_FIXTURES.search());
    let selector = 'select.t-ticket-location-select:eq(0) + .selectize-control';
    click(`${selector} > .selectize-input`);
    fillIn(`${selector} > .selectize-input input`, '');
    triggerEvent(`${selector} > .selectize-input input`, 'keyup', BACKSPACE);
    triggerEvent(`${selector} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
        assert.equal(find(`${selector} > .selectize-dropdown div.option`).length, 0);
    });
    click(`${selector} > .selectize-input`);
    fillIn(`${selector} > .selectize-input input`, '6');
    triggerEvent(`${selector} > .selectize-input input`, 'keyup', NUMBER_6);
    andThen(() => {
        assert.equal(find(`${selector} > .selectize-dropdown div.option`).length, 2);
    });
    click(`${selector} > .selectize-input`);
    fillIn(`${selector} > .selectize-input input`, '');//this is required
    triggerEvent(`${selector} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
        assert.equal(find(`${selector} > .selectize-dropdown div.option`).length, 2);
    });
    fillIn(`${selector} > .selectize-input input`, '6');
    triggerEvent(`${selector} > .selectize-input input`, 'keyup', NUMBER_6);
    andThen(() => {
        assert.equal(find(`${selector} > .selectize-dropdown div.option`).length, 2);
    });
    click(`${selector} > .selectize-dropdown div.option:eq(1)`);
    andThen(() => {
        assert.equal(find('.t-ticket-location-select').val(), LOCATION_DEFAULTS.idTwo);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idTwo);
        assert.equal(ticket.get('location_fk'), LOCATION_DEFAULTS.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
        assert.equal(ticket.get('categories').get('length'), 2);
        assert.equal(page.ticketTopLevelCategorySelected(), 1);
        assert.equal(page.ticketTopLevelCategoryOptions(), 2);
        assert.equal(page.ticketSecondLevelCategorySelected(), 1);
        assert.equal(page.ticketSecondLevelCategoryOptions(), 2);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response_put = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    response_put.location = {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo};
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, location: LOCATION_DEFAULTS.idTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response_put);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKETS_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    });
});
