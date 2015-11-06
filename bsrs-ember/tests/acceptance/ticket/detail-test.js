import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import {ticket_payload, required_ticket_payload, ticket_payload_detail, ticket_payload_detail_one_category} from 'bsrs-ember/tests/helpers/payloads/ticket';
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
const TICKET_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const TICKET_PUT_URL = PREFIX + DETAIL_URL + '/';
const LETTER_A = {keyCode: 65};
const LETTER_B = {keyCode: 66};
const LETTER_R = {keyCode: 82};
const LETTER_M = {keyCode: 77};
const LETTER_S = {keyCode: 83};
const NUMBER_6 = {keyCode: 54};
const SPACEBAR = {keyCode: 32};
const BACKSPACE = {keyCode: 8};
const LOCATION = '.t-ticket-location-select > .ember-basic-dropdown > .ember-power-select-trigger';
const LOCATION_DROPDOWN = '.t-ticket-location-select-dropdown > .ember-power-select-options';
const ASSIGNEE = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
const CC = 'select.t-ticket-people-select:eq(0) + .selectize-control';
const STATUS = 'select.t-ticket-status-select:eq(0) + .selectize-control';
const SEARCH = '.ember-power-select-search input';

let application, store, endpoint, list_xhr, detail_xhr, top_level_xhr, detail_data, random_uuid, original_uuid, category_one_xhr, category_two_xhr, category_three_xhr, counter;

module('Acceptance | ticket detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        detail_data = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, TICKET_FIXTURES.list());
        detail_xhr = xhr(endpoint + TICKET_DEFAULTS.idOne + '/', 'GET', null, {}, 200, detail_data);
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.top_level());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking a tickets will redirect to the given detail view and can save to ensure validation mixins are working', (assert) => {
    page.visit();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});


test('when you deep link to the ticket detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirty'));
        assert.equal(page.priorityInput(), TICKET_DEFAULTS.priorityOne);
        assert.equal(page.statusInput(), TICKET_DEFAULTS.statusOne);
    });
    page.priorityClickDropdown();
    page.priorityClickOptionTwo();
    page.statusClickDropdown();
    page.statusClickOptionTwo();
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();
    andThen(() => {
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.priorityInput(), TICKET_DEFAULTS.priorityTwo);
        assert.equal(page.statusInput(), TICKET_DEFAULTS.statusTwo);
    });
    let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail_one_category), {}, 200, response);
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, TICKET_FIXTURES.list());
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('ticket').get('length'), 10);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirty'));
    });
});

test('when you click cancel, you are redirected to the ticket list view', (assert) => {
    page.visitDetail();
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

test('validation works for non required fields and when hit save, we do same post', (assert) => {
    //assignee, requester, cc, request
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-assignee-validation-error').is(':hidden'));
    });
    triggerEvent(`${ASSIGNEE} > .selectize-input input`, 'keydown', BACKSPACE);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-assignee-validation-error').is(':visible'));
    });
    //assignee
    let people_xhr = xhr(`${PREFIX}/admin/people/?fullname__icontains=Mel`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    page.assigneeFillIn('Mel');
    triggerEvent(`${ASSIGNEE} > .selectize-input input`, 'keyup', LETTER_M);
    page.assigneeClickOptionOne();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL + '?search_assignee=Mel');
    });
    generalPage.save();
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    page.priorityClickDropdown();
    page.priorityClickOptionTwo();
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
            assert.equal(page.priorityInput(), TICKET_DEFAULTS.priorityTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when click delete, ticket is deleted and removed from store', (assert) => {
    page.visitDetail();
    xhr(PREFIX + BASE_URL + '/' + TICKET_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('ticket', TICKET_DEFAULTS.idOne).get('length'), undefined);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    page.visit();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    page.visitDetail();
    page.priorityClickDropdown();
    page.priorityClickOptionTwo();
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
            assert.equal(currentURL(), TICKET_URL);
        });
    });
});

// /*TICKET PEOPLE M2M*/
// test('clicking and typing into selectize for people will fire off xhr request for all people', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('cc').get('length'), 1);
//         assert.equal(page.ticketPeopleSelected(), 1);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
//     xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
//     fillIn(`${CC} > .selectize-input input`, 'a');
//     triggerEvent(`${CC} > .selectize-input input`, 'keyup', LETTER_A);
//     click(`${CC} > .selectize-dropdown div.option:eq(0)`);
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('ticket_people_fks').length, 1);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.ticketPeopleSelected(), 2);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_CURRENT_DEFAULTS.id, PEOPLE_DEFAULTS.id]});
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('can remove and add back same cc', (assert) => {
//     page.visitDetail();
//     page.removeTicketPeople();
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('cc').get('length'), 0);
//         assert.equal(page.ticketPeopleSelected(), 0);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=Mel';
//     xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
//     fillIn(`${CC} > .selectize-input input`, 'Mel');
//     triggerEvent(`${CC} > .selectize-input input`, 'keyup', LETTER_M);
//     click(`${CC} > .selectize-dropdown div.option:eq(0)`);
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('ticket_people_fks').length, 1);
//         assert.equal(ticket.get('cc').get('length'), 1);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.ticketPeopleSelected(), 1);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_DEFAULTS.id]});
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('when you deep link to the ticket detail can remove a cc', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('cc').get('length'), 1);
//         assert.equal(page.ticketPeopleSelected(), 1);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     click(`${CC} > .selectize-input > div.item > a.remove:eq(0)`);
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('cc').get('length'), 0);
//         assert.equal(page.ticketPeopleSelected(), 0);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: []});
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('starting with multiple cc, can remove all ccs (while not populating options) and add back', (assert) => {
//     detail_data.cc = [...detail_data.cc, PEOPLE_FIXTURES.get(PEOPLE_DEFAULTS.idTwo)];
//     detail_data.cc[1].fullname = PEOPLE_DEFAULTS.fullname + 'i';
//     page.visitDetail();
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('cc').get('length'), 2);
//         assert.equal(page.ticketPeopleSelected(), 2);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
//     xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
//     click(`${CC} > .selectize-input > div.item > a.remove:eq(0)`);
//     click(`${CC} > .selectize-input > div.item > a.remove:eq(0)`);
//     andThen(() => {
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     fillIn(`${CC} > .selectize-input input`, 'a');
//     triggerEvent(`${CC} > .selectize-input input`, 'keyup', LETTER_A);
//     click(`${CC} > .selectize-dropdown div.option:eq(0)`);
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('ticket_people_fks').length, 2);
//         assert.equal(ticket.get('cc').get('length'), 1);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.ticketPeopleSelected(), 1);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_CURRENT_DEFAULTS.id]});
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('search will filter down on people in store correctly by removing and adding a cc back', (assert) => {
//     detail_data.cc = [...detail_data.cc, PEOPLE_FIXTURES.get(PEOPLE_DEFAULTS.idTwo)];
//     detail_data.cc[1].fullname = PEOPLE_DEFAULTS.fullname + ' scooter';
//     page.visitDetail();
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('cc').get('length'), 2);
//         assert.equal(page.ticketPeopleSelected(), 2);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=sc';
//     xhr(people_endpoint, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
//     click(`${CC} > .selectize-input > div.item > a.remove:eq(1)`);
//     andThen(() => {
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     fillIn(`${CC} > .selectize-input input`, 'sc');
//     triggerEvent(`${CC} > .selectize-input input`, 'keyup', LETTER_S);
//     click(`${CC} > .selectize-dropdown div.option:eq(0)`);
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(ticket.get('ticket_people_fks').length, 2);
//         assert.equal(ticket.get('cc').get('length'), 2);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         assert.equal(page.ticketPeopleSelected(), 2);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.idTwo]});
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('clicking and typing into selectize for people will not filter if spacebar pressed', (assert) => {
//     page.visitDetail();
//     fillIn(`${CC} > .selectize-input input`, ' ');
//     triggerEvent(`${CC} > .selectize-input input`, 'keyup', SPACEBAR);
//     andThen(() => {
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     andThen(() => {
//         let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
//         assert.equal(page.ticketPeopleSelected(), 1);
//         assert.equal(page.ticketPeopleOptions(), 0);
//     });
//     let response = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
//     let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, cc: [PEOPLE_DEFAULTS.id]});
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

/*TICKET CATEGORIES M2M*/
test('categories are in order based on text', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        assert.equal(page.categoryOneInput(), CATEGORY_DEFAULTS.nameOne);
        assert.equal(page.categoryTwoInput(), CATEGORY_DEFAULTS.nameRepairChild);
        assert.equal(page.categoryThreeInput(), CATEGORY_DEFAULTS.namePlumbingChild);
    });
});

test('power select options are rendered immediately when enter detail route and can save different top level category', (assert) => {
    clearxhr(top_level_xhr);
    let top_level_data = CATEGORY_FIXTURES.top_level();
    top_level_data.results[1] = {id: CATEGORY_DEFAULTS.idThree, name: CATEGORY_DEFAULTS.nameThree, parent: null, has_children: true};
    top_level_data.results[1].children = [{id: CATEGORY_DEFAULTS.idLossPreventionChild, name: CATEGORY_DEFAULTS.nameLossPreventionChild, has_children: false}];
    let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
    xhr(top_level_categories_endpoint, 'GET', null, {}, 200, top_level_data);
    page.visitDetail();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(components, 3);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
        assert.equal(ticket.get('categories').get('length'), 3);
        page.categoryOneClickDropdown();
        andThen(() => {
            assert.equal(page.categoryOneInput(), CATEGORY_DEFAULTS.nameOne);
            assert.equal(page.categoryOneOptionLength(), 2);
            page.categoryTwoClickDropdown();
            andThen(() => {
                assert.equal(page.categoryTwoInput(), CATEGORY_DEFAULTS.nameRepairChild);
                assert.equal(page.categoryTwoOptionLength(), 2);
                page.categoryThreeClickDropdown();
                andThen(() => {
                    assert.equal(page.categoryThreeInput(), CATEGORY_DEFAULTS.namePlumbingChild);
                    assert.equal(page.categoryThreeOptionLength(), 1);
                });
            });
        });
    });
    let category = {id: CATEGORY_DEFAULTS.idThree, name: CATEGORY_DEFAULTS.nameThree, parent: null, has_children: true};
    category.children = [{id: CATEGORY_DEFAULTS.idLossPreventionChild, name: CATEGORY_DEFAULTS.nameLossPreventionChild, has_children: false}];
    xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idThree}/`, 'GET', null, {}, 200, category);
    //click loss prevention
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(components, 2);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idThree);
        assert.equal(ticket.get('ticket_categories_fks').length, 3);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        page.categoryOneClickDropdown();
        andThen(() => {
            assert.equal(page.categoryOneInput(), CATEGORY_DEFAULTS.nameThree);
            assert.equal(page.categoryOneOptionLength(), 2);
            page.categoryTwoClickDropdown();
            andThen(() => {
                assert.equal(page.categoryTwoOptionLength(), 1);
                page.categoryTwoClickOptionSecurity();
                andThen(() => {
                    assert.equal(page.categoryTwoInput(), CATEGORY_DEFAULTS.nameLossPreventionChild);
                });
            });
        });
    });
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, categories: [CATEGORY_DEFAULTS.idThree, CATEGORY_DEFAULTS.idLossPreventionChild]});
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

// test('selecting a top level category will alter the url and can cancel/discard changes and return to index', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         //override electrical to have children
//         store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent: CATEGORY_DEFAULTS.idOne, has_children: true, children_fks: [CATEGORY_DEFAULTS.idChild]});
//         let components = page.selectizeComponents();
//         assert.equal(store.find('category').get('length'), 5);
//         let tickets = store.find('ticket');
//         assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
//         assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
//         assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));
//         assert.equal(components, 3);
//     });
//     //select same
//     page.categoryOneClickDropdown();
//     page.categoryOneClickOptionOne();
//     andThen(() => {
//         let components = page.selectizeComponents();
//         assert.equal(store.find('ticket').get('length'), 1);
//         let tickets = store.find('ticket');
//         assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
//         assert.equal(tickets.objectAt(0).get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//         assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
//         assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));
//         assert.equal(components, 3);
//     });
//     //select electrical from second level
//     let category_two = {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent: {id: CATEGORY_DEFAULTS.idOne}, has_children: true};
//     category_two.children = [{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild, has_children:false}];
//     xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idTwo}/`, 'GET', null, {}, 200, category_two);
//     page.categoryTwoClickDropdown();
//     page.categoryTwoClickOptionOne();
//     andThen(() => {
//         let components = page.selectizeComponents();
//         let tickets = store.find('ticket');
//         assert.equal(tickets.get('length'), 1);
//         assert.equal(store.find('category').get('length'), 6);
//         assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
//         assert.equal(tickets.objectAt(0).get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//         assert.equal(tickets.objectAt(0).get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//         assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
//         assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
//         assert.equal(components, 3);
//     });
//     page.categoryThreeClickDropdown();
//     page.categoryThreeClickOptionOne();
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.ok(generalPage.modalIsVisible());
//             assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
//         });
//     });
//     generalPage.clickModalCancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.ok(generalPage.modalIsHidden());
//             let components = page.selectizeComponents();
//             let tickets = store.find('ticket');
//             assert.equal(tickets.get('length'), 1);
//             assert.equal(store.find('category').get('length'), 6);
//             assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
//             assert.equal(tickets.objectAt(0).get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//             assert.equal(tickets.objectAt(0).get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//             assert.equal(tickets.objectAt(0).get('sorted_categories').objectAt(2).get('children').get('length'), 0);
//             assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
//             assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
//             assert.equal(components, 3);
//         });
//     });
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
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
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(store.find('category').get('length'), 5);
        let tickets = store.find('ticket');
    });
    //change top level
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();

    andThen(() => {
        let components = page.selectizeComponents();
        let tickets = store.find('ticket');
        assert.equal(tickets.get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
        assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
        assert.equal(components, 1);
    });
});

test('when selecting a new parent category it should remove previously selected child category', (assert) => {
    page.visitDetail();
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionElectrical();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(ticket.get('categories').get('length'), 2);
        let components = page.selectizeComponents();
        assert.equal(components, 2);
    });
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();
    andThen(() => {
        let ticket = store.findOne('ticket');
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(ticket.get('categories').get('length'), 1);
        let components = page.selectizeComponents();
        assert.equal(components, 1);
    });
    let category_two = {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent: {id: CATEGORY_DEFAULTS.idOne}, has_children: true};
    category_two.children = [{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameElectricalChild, has_children:false}];
    category_two_xhr = xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idTwo}/`, 'GET', null, {}, 200, category_two);
    let category = {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent: null, has_children: true};
    category.children = [{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, has_children: true}, {id: CATEGORY_DEFAULTS.unusedId , name: CATEGORY_DEFAULTS.nameUnused, has_children: false}];
    category_one_xhr = xhr(`${PREFIX}/admin/categories/${CATEGORY_DEFAULTS.idOne}/`, 'GET', null, {}, 200, category);
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    page.categoryThreeClickDropdown();
    page.categoryThreeClickOptionOne();
    let payload = ticket_payload_detail;
    payload.categories = [CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.idTwo, CATEGORY_DEFAULTS.idChild];
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

/*TICKET TO LOCATION*/
test('location component shows location for ticket and will fire off xhr to fetch locations on search to change location', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(page.locationInput(), LOCATION_DEFAULTS.storeName);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idOne);
        assert.equal(ticket.get('location_fk'), LOCATION_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
        page.categoryOneClickDropdown();
        andThen(() => {
            assert.equal(page.categoryOneInput(), CATEGORY_DEFAULTS.nameOne);
            assert.equal(page.categoryOneOptionLength(), 2);
            page.categoryTwoClickDropdown();
            andThen(() => {
                assert.equal(page.categoryTwoInput(), CATEGORY_DEFAULTS.nameRepairChild);
                assert.equal(page.categoryTwoOptionLength(), 2);
                page.categoryThreeClickDropdown();
                andThen(() => {
                    assert.equal(page.categoryThreeInput(), CATEGORY_DEFAULTS.namePlumbingChild);
                    assert.equal(page.categoryThreeOptionLength(), 1);
                });
            });
        });
    });
    xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LOCATION_FIXTURES.search());
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        assert.equal(page.locationInput(), LOCATION_DEFAULTS.storeName);
        assert.equal(page.locationOptionLength(), 2);
        page.locationClickOptionTwo();
        andThen(() => {
            assert.equal(page.locationInput(), LOCATION_DEFAULTS.storeNameTwo);
        });
    });
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '');
    andThen(() => {
        assert.equal(page.locationOptionLength(), 1);
        assert.equal(find(`${LOCATION_DROPDOWN}`).text().trim(), LOCATION_DEFAULTS.storeNameTwo);
    });
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        assert.equal(page.locationInput(), LOCATION_DEFAULTS.storeNameTwo);
        assert.equal(page.locationOptionLength(), 2);
    });
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(page.locationInput(), LOCATION_DEFAULTS.storeNameTwo);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idTwo);
        assert.equal(ticket.get('location_fk'), LOCATION_DEFAULTS.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        //ensure categories has not changed
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
        assert.equal(ticket.get('categories').get('length'), 3);
    });
    let response_put = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    response_put.location = {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo};
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, location: LOCATION_DEFAULTS.idTwo});
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

/*TICKET TO ASSIGNEE*/
test('assignee component shows assignee for ticket and will fire off xhr to fetch assignees on search to change assignee', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(page.assigneeInput(), PEOPLE_DEFAULTS.idOne);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('assignee.id'), PEOPLE_DEFAULTS.idOne);
        assert.equal(ticket.get('assignee_fk'), PEOPLE_DEFAULTS.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
    });
    triggerEvent(`${ASSIGNEE} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
        assert.equal(find(`${ASSIGNEE} > .selectize-dropdown div.option`).length, 0);
    });
    xhr(`${PREFIX}/admin/people/?fullname__icontains=Man`, 'GET', null, {}, 200, PEOPLE_FIXTURES.search());
    fillIn(`${ASSIGNEE} > .selectize-input input`, 'Man');
    triggerEvent(`${ASSIGNEE} > .selectize-input input`, 'keyup', LETTER_A);
    andThen(() => {
        assert.equal(find(`${ASSIGNEE} > .selectize-dropdown div.option`).length, 10);
    });
    fillIn(`${ASSIGNEE} > .selectize-input input`, '');//this is required
    triggerEvent(`${ASSIGNEE} > .selectize-input input`, 'keydown', BACKSPACE);
    andThen(() => {
        assert.equal(find(`${ASSIGNEE} > .selectize-dropdown div.option`).length, 10);
    });
    fillIn(`${ASSIGNEE} > .selectize-input input`, 'Man');
    triggerEvent(`${ASSIGNEE} > .selectize-input input`, 'keyup', LETTER_A);
    andThen(() => {
        assert.equal(find(`${ASSIGNEE} > .selectize-dropdown div.option`).length, 10);
    });
    page.assigneeClickOptionTwo();
    andThen(() => {
        assert.equal(page.assigneeInput(), PEOPLE_DEFAULTS.idSearch);
        let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
        assert.equal(ticket.get('assignee.id'), PEOPLE_DEFAULTS.idSearch);
        assert.equal(ticket.get('assignee_fk'), PEOPLE_DEFAULTS.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        //ensure categories has not changed
        assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idOne);
        assert.equal(ticket.get('categories').get('length'), 3);
    });
    let response_put = TICKET_FIXTURES.detail(TICKET_DEFAULTS.idOne);
    response_put.assignee = {id: PEOPLE_DEFAULTS.idTwo, name: PEOPLE_DEFAULTS.storeNameTwo};
    let payload = TICKET_FIXTURES.put({id: TICKET_DEFAULTS.idOne, assignee: PEOPLE_DEFAULTS.idSearch});
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});
