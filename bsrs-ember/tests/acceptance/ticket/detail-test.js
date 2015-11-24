import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import {ticket_payload, ticket_payload_with_comment, required_ticket_payload, ticket_payload_detail, ticket_payload_detail_one_category} from 'bsrs-ember/tests/helpers/payloads/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
import PF from 'bsrs-ember/vendor/people_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import selectize from 'bsrs-ember/tests/pages/selectize';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const TICKET_PUT_URL = PREFIX + DETAIL_URL + '/';
const LETTER_A = {keyCode: 65};
const LETTER_B = {keyCode: 66};
const LETTER_R = {keyCode: 82};
const LETTER_M = {keyCode: 77};
const LETTER_S = {keyCode: 83};
const NUMBER_6 = {keyCode: 54};
const SPACEBAR = {keyCode: 32};
const BACKSPACE = {keyCode: 8};
const LOCATION = '.t-ticket-location-select > .ember-basic-dropdown-trigger';
const LOCATION_DROPDOWN = '.t-ticket-location-select-dropdown > .ember-power-select-options';
const ASSIGNEE = '.t-ticket-assignee-select > .ember-basic-dropdown-trigger';
const ASSIGNEE_DROPDOWN = '.t-ticket-assignee-select-dropdown > .ember-power-select-options';
const CC = '.t-ticket-cc-select > .ember-basic-dropdown-trigger';
const CC_DROPDOWN = '.t-ticket-cc-select-dropdown > .ember-power-select-options';
const CC_SEARCH = '.ember-power-select-trigger-multiple-input';
const STATUS = 'select.t-ticket-status-select:eq(0) + .selectize-control';
const SEARCH = '.ember-power-select-search input';
const categories = '.categories-power-select-search input';

let application, store, endpoint, list_xhr, detail_xhr, top_level_xhr, detail_data, random_uuid, original_uuid, category_one_xhr, category_two_xhr, category_three_xhr, counter, activity_one;

module('Acceptance | ticket detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        detail_data = TF.detail(TD.idOne);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, TF.list());
        detail_xhr = xhr(endpoint + TD.idOne + '/', 'GET', null, {}, 200, detail_data);
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
        activity_one = xhr(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
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
        assert.equal(page.ccSelected().indexOf(PD.first_name), 2);
    });
    let response = TF.detail(TD.idOne);
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

test('you can add a comment and post it', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    page.commentFillIn(TD.commentOne);
    let response = TF.detail(TD.idOne);
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_comment), {}, 200, response);
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, TF.list());
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isNotDirty'));
    });
});


test('when you deep link to the ticket detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isNotDirty'));
        assert.equal(page.priorityInput(), TD.priorityOne);
        assert.equal(page.statusInput(), TD.statusOne);
    });
    page.priorityClickDropdown();
    page.priorityClickOptionTwo();
    page.statusClickDropdown();
    page.statusClickOptionTwo();
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.priorityInput(), TD.priorityTwo);
        assert.equal(page.statusInput(), TD.statusTwo);
    });
    page.requestFillIn(TD.requestOneGrid);
    let response = TF.detail(TD.idOne);
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail_one_category), {}, 200, response);
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, TF.list());
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('ticket').get('length'), 10);
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isNotDirty'));
    });
});

// test('when you click cancel, you are redirected to the ticket list view', (assert) => {
//     page.visitDetail();
//     generalPage.cancel();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('validation works for non required fields and when hit save, we do same post', (assert) => {
//     //assignee, requester, cc, request
//     detail_data.assignee = null;
//     page.visitDetail();
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.ok(find('.t-assignee-validation-error').is(':hidden'));
//     });
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//         assert.ok(find('.t-assignee-validation-error').is(':visible'));
//     });
//     //assignee
//     xhr(`${PREFIX}/admin/people/?fullname__icontains=Mel`, 'GET', null, {}, 200, PF.search());
//     page.assigneeClickDropdown();
//     fillIn(`${SEARCH}`, 'Mel');
//     page.assigneeClickOptionOne();
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL + '?search_assignee=Mel');
//     });
//     generalPage.save();
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });

// test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
//     clearxhr(list_xhr);
//     page.visitDetail();
//     page.priorityClickDropdown();
//     page.priorityClickOptionTwo();
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
//             assert.equal(page.priorityInput(), TD.priorityTwo);
//             assert.ok(generalPage.modalIsHidden());
//         });
//     });
// });

test('when click delete, ticket is deleted and removed from store', (assert) => {
    page.visitDetail();
    xhr(PREFIX + BASE_URL + '/' + TD.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('ticket', TD.idOne).get('length'), undefined);
    });
});

test('visiting detail should set the category even when it has no children', (assert) => {
    clearxhr(list_xhr);
    clearxhr(detail_xhr);
    clearxhr(activity_one);
    ajax(`/api/tickets/${TD.idTwo}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
    let solo_data = TF.detail(TD.idTwo);
    solo_data.categories = [{id: CD.idSolo, name: CD.nameSolo, children_fks: [], parent: null}];
    xhr(endpoint + TD.idTwo + '/', 'GET', null, {}, 200, solo_data);
    visit(BASE_URL + '/' + TD.idTwo);
    andThen(() => {
        assert.equal(currentURL(), BASE_URL + '/' + TD.idTwo);
        let components = page.selectizeComponents();
        assert.equal(components, 1);
        assert.equal(page.categoryOneInput(), CD.nameSolo);
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

// test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
//     page.visitDetail();
//     page.priorityClickDropdown();
//     page.priorityClickOptionTwo();
//     generalPage.cancel();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), DETAIL_URL);
//             assert.ok(generalPage.modalIsVisible());
//         });
//     });
//     generalPage.clickModalRollback();
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), TICKET_URL);
//         });
//     });
// });

//*TICKET CC M2M*/
test('clicking and typing into selectize for people will fire off xhr request for all people', (assert) => {
    page.visitDetail();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.first_name);
        assert.equal(page.ccSelected().indexOf(PD.first_name), 2);
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
    xhr(people_endpoint, 'GET', null, {}, 200, PF.list());
    page.ccClickDropdown();
    fillIn(`${CC_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(page.ccSelected().indexOf(PD.first_name), 2);
        assert.equal(page.ccOptionLength(), 1);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
    });
    page.ccClickDonald();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 2);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
        assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.equal(page.ccTwoSelected().indexOf(PD.first_name), 2);
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
        assert.equal(page.ccTwoSelected().indexOf(PD.first_name), 2);
        assert.equal(page.ccOptionLength(), 1);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 2);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
        assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
    });
    //search specific cc
    page.ccClickDropdown();
    xhr(`${PREFIX}/admin/people/?fullname__icontains=Boy`, 'GET', null, {}, 200, PF.search());
    fillIn(`${CC_SEARCH}`, 'Boy');
    andThen(() => {
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.equal(page.ccTwoSelected().indexOf(PD.first_name), 2);
        assert.equal(page.ccOptionLength(), 10);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 2);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
        assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
    });
    page.ccClickOptionOne();
    andThen(() => {
        assert.equal(page.ccSelected().indexOf(PD.donald), 2);
        assert.equal(page.ccTwoSelected().indexOf(PD.first_name), 2);
        assert.equal(page.ccThreeSelected().indexOf(PD.nameBoy), 2);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
        assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
        assert.equal(ticket.get('cc').objectAt(2).get('id'), PD.idBoy);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    let response_put = TF.detail(TD.idOne);
    response_put.cc = {id: PD.idThree, name: PD.storeNameThree};
    let payload = TF.put({id: TD.idOne, cc: [PD.idDonald, PD.idOne, PD.idBoy]});
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

test('can remove and add back same cc and save empty cc', (assert) => {
    page.visitDetail();
    page.ccOneRemove();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 0);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=a';
    xhr(people_endpoint, 'GET', null, {}, 200, PF.list());
    page.ccClickDropdown();//don't know why I have to do this
    fillIn(`${CC_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(page.ccOptionLength(), 1);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('ticket_people_fks').length, 1);
        assert.equal(ticket.get('cc').get('length'), 0);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    page.ccClickDonald();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('ticket_people_fks').length, 1);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    page.ccOneRemove();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 0);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    let payload = TF.put({id: TD.idOne, cc: []});
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

test('starting with multiple cc, can remove all ccs (while not populating options) and add back', (assert) => {
    detail_data.cc = [...detail_data.cc, PF.get(PD.idTwo)];
    detail_data.cc[1].fullname = PD.fullname + 'i';
    page.visitDetail();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 2);
        assert.equal(ticket.get('ticket_people_fks').length, 2);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(page.ccsSelected(), 2);
    });
    page.ccTwoRemove();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ccsSelected(), 1);
    });
    page.ccOneRemove();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 0);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ccsSelected(), 0);
    });
    let people_endpoint = PREFIX + '/admin/people/?fullname__icontains=Mel';
    ajax(people_endpoint, 'GET', null, {}, 200, PF.list());
    page.ccClickDropdown();
    fillIn(`${CC_SEARCH}`, 'Mel');
    andThen(() => {
        assert.equal(page.ccOptionLength(), 11);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 0);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    });
    page.ccClickMel();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('cc').get('length'), 1);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.equal(page.ccsSelected(), 1);
    });
    let payload = TF.put({id: TD.idOne, cc: [PD.idTwo]});
    ajax(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});


test('clicking and typing into power select for people will not filter if spacebar pressed', (assert) => {
    page.visitDetail();
    page.ccClickDropdown();
    fillIn(`${CC_SEARCH}`, ' ');
    andThen(() => {
        assert.equal(page.ccSelected().indexOf(PD.first_name), 2);
        assert.equal(page.ccOptionLength(), 1);
        assert.equal(find(`${CC_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.no_results);
    });
    let response = TF.detail(TD.idOne);
    let payload = TF.put({id: TD.idOne, cc: [PD.idOne]});
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

/*TICKET CATEGORIES M2M*/
test('categories are in order based on text', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        assert.equal(page.categoryOneInput(), CD.nameOne);
        assert.equal(page.categoryTwoInput(), CD.nameRepairChild);
        assert.equal(page.categoryThreeInput(), CD.namePlumbingChild);
    });
});

test('power select options are rendered immediately when enter detail route and can save different top level category', (assert) => {
    clearxhr(top_level_xhr);
    let top_level_data = CF.top_level();
    top_level_data.results[1] = {id: CD.idThree, name: CD.nameThree, parent: null, children_fks: [CD.idLossPreventionChild]};
    top_level_data.results[1].children = [{id: CD.idLossPreventionChild, name: CD.nameLossPreventionChild, children_fks: []}];
    let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
    xhr(top_level_categories_endpoint, 'GET', null, {}, 200, top_level_data);
    page.visitDetail();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(components, 3);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
        assert.equal(ticket.get('categories').get('length'), 3);
        page.categoryOneClickDropdown();
        andThen(() => {
            assert.equal(page.categoryOneInput(), CD.nameOne);
            assert.equal(page.categoryOneOptionLength(), 2);
            page.categoryTwoClickDropdown();
            andThen(() => {
                assert.equal(page.categoryTwoInput(), CD.nameRepairChild);
                assert.equal(page.categoryTwoOptionLength(), 2);
                page.categoryThreeClickDropdown();
                andThen(() => {
                    assert.equal(page.categoryThreeInput(), CD.namePlumbingChild);
                    assert.equal(page.categoryThreeOptionLength(), 1);
                });
            });
        });
    });
    let category = {id: CD.idThree, name: CD.nameThree, parent: null, children_fks: [CD.idLossPreventionChild]};
    category.children = [{id: CD.idLossPreventionChild, name: CD.nameLossPreventionChild, children_fks: []}];
    xhr(`${PREFIX}/admin/categories/${CD.idThree}/`, 'GET', null, {}, 200, category);
    //click loss prevention
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionTwo();
    andThen(() => {
        let components = page.selectizeComponents();
        assert.equal(components, 2);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('top_level_category').get('id'), CD.idThree);
        assert.equal(ticket.get('ticket_categories_fks').length, 3);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        page.categoryOneClickDropdown();
        andThen(() => {
            assert.equal(page.categoryOneInput(), CD.nameThree);
            assert.equal(page.categoryOneOptionLength(), 2);
            page.categoryTwoClickDropdown();
            andThen(() => {
                assert.equal(page.categoryTwoOptionLength(), 1);
                page.categoryTwoClickOptionSecurity();
                andThen(() => {
                    assert.equal(page.categoryTwoInput(), CD.nameLossPreventionChild);
                });
            });
        });
    });
    let payload = TF.put({id: TD.idOne, categories: [CD.idLossPreventionChild, CD.idThree]});
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
//         store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.idOne, children_fks: [CD.idChild]});
//         let components = page.selectizeComponents();
//         assert.equal(store.find('category').get('length'), 5);
//         let ticket = store.find('ticket', TD.idOne);
//         assert.equal(ticket.get('categories').get('length'), 3);
//         assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//         assert.ok(ticket.get('categoriesIsNotDirty'));
//         assert.equal(components, 3);
//     });
//     //select same
//     page.categoryOneClickDropdown();
//     page.categoryOneClickOptionOne();
//     andThen(() => {
//         let components = page.selectizeComponents();
//         assert.equal(store.find('ticket').get('length'), 1);
//         let ticket = store.find('ticket', TD.idOne);
//         assert.equal(ticket.get('categories').get('length'), 3);
//         assert.equal(ticket.get('sorted_categories').get('length'), 3);
//         assert.equal(ticket.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//         assert.equal(ticket.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//         assert.equal(ticket.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
//         assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//         assert.ok(ticket.get('categoriesIsNotDirty'));
//         assert.equal(components, 3);
//     });
//     //select electrical from second level
//     let category_two = {id: CD.idTwo, name: CD.nameTwo, parent: {id: CD.idOne, name: CD.nameOne}, children_fks: [CD.idChild]};
//     category_two.children = [{id: CD.idChild, name: CD.nameElectricalChild, children_fks: []}];
//     xhr(`${PREFIX}/admin/categories/${CD.idTwo}/`, 'GET', null, {}, 200, category_two);
//     page.categoryTwoClickDropdown();
//     page.categoryTwoClickOptionElectrical();
//     andThen(() => {
//         let components = page.selectizeComponents();
//         let ticket = store.find('ticket', TD.idOne);
//         assert.equal(store.find('category').get('length'), 6);
//         assert.equal(ticket.get('categories').get('length'), 2);
//         assert.equal(ticket.get('sorted_categories').get('length'), 2);
//         assert.equal(ticket.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//         assert.equal(ticket.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         assert.ok(ticket.get('categoriesIsDirty'));
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
//             assert.equal(store.find('category').get('length'), 6);
//             assert.equal(tickets.get('length'), 1);
//             let ticket = store.find('ticket', TD.idOne);
//             assert.equal(ticket.get('categories').get('length'), 3);
//             assert.equal(ticket.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//             assert.equal(ticket.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//             assert.equal(ticket.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
//             assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//             assert.ok(ticket.get('categoriesIsDirty'));
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

test('changing tree and reverting tree should not show as dirty', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        //override electrical to have children
        store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.idOne, children_fks: [CD.idChild]});
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(ticket.get('categoriesIsNotDirty'));
    });
    //select same
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    andThen(() => {
        let components = page.selectizeComponents();
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(ticket.get('categoriesIsNotDirty'));
    });
    //select electrical from second level
    let category_two = {id: CD.idTwo, name: CD.nameTwo, parent: {id: CD.idOne, name: CD.nameOne}, children_fks: [CD.idChild]};
    category_two.children = [{id: CD.idChild, name: CD.nameElectricalChild, children_fks: []}];
    xhr(`${PREFIX}/admin/categories/${CD.idTwo}/`, 'GET', null, {}, 200, category_two);
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionElectrical();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.ok(ticket.get('categoriesIsDirty'));
    });
    page.categoryThreeClickDropdown();
    page.categoryThreeClickOptionOne();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.ok(ticket.get('categoriesIsDirty'));
    });
    let category_plumb = {id: CD.idPlumbing, name: CD.nameRepairChild, parent: {id: CD.idOne, name: CD.nameOne}, children_fks: [CD.idPlumbingChild]};
    category_plumb.children = [{id: CD.idPlumbingChild, name: CD.namePlumbingChild, children_fks: []}];
    xhr(`${PREFIX}/admin/categories/${CD.idPlumbing}/`, 'GET', null, {}, 200, category_plumb);
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionPlumbing();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        assert.ok(ticket.get('categoriesIsDirty'));
    });
    page.categoryThreeClickDropdown();
    //reset tree back to original
    page.categoryThreeClickOptionToilet();
    andThen(() => {
        let ticket = store.find('ticket', TD.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(ticket.get('categoriesIsNotDirty'));
    });
});

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
    let category_two = {id: CD.idTwo, name: CD.nameTwo, parent: {id: CD.idOne}, children_fks: [CD.idChild]};
    category_two.children = [{id: CD.idChild, name: CD.nameElectricalChild, children_fks: []}];
    category_two_xhr = xhr(`${PREFIX}/admin/categories/${CD.idTwo}/`, 'GET', null, {}, 200, category_two);
    let category = {id: CD.idOne, name: CD.nameOne, parent: null, children_fks: [CD.idTwo]};
    category.children = [{id: CD.idTwo, name: CD.nameTwo, children_fks: [CD.idChild]}, {id: CD.unusedId, name: CD.nameUnused, children_fks: []}];
    category_one_xhr = xhr(`${PREFIX}/admin/categories/${CD.idOne}/`, 'GET', null, {}, 200, category);
    page.categoryOneClickDropdown();
    page.categoryOneClickOptionOne();
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    page.categoryThreeClickDropdown();
    page.categoryThreeClickOptionOne();
    let payload = ticket_payload_detail;
    payload.categories = [CD.idTwo, CD.idOne, CD.idChild];
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
        assert.equal(page.locationInput(), LD.storeName);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('location.id'), LD.idOne);
        assert.equal(ticket.get('location_fk'), LD.idOne);
        assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
    });
    // <check category tree>
    page.categoryOneClickDropdown();
    andThen(() => {
        assert.equal(page.categoryOneInput(), CD.nameOne);
        assert.equal(page.categoryOneOptionLength(), 2);
    });
    page.categoryTwoClickDropdown();
    andThen(() => {
        assert.equal(page.categoryTwoInput(), CD.nameRepairChild);
        assert.equal(page.categoryTwoOptionLength(), 2);
    });
    page.categoryThreeClickDropdown();
    andThen(() => {
        assert.equal(page.categoryThreeInput(), CD.namePlumbingChild);
        assert.equal(page.categoryThreeOptionLength(), 1);
    });
    // </check category tree>
    xhr(`${PREFIX}/admin/locations/?name__icontains=6`, 'GET', null, {}, 200, LF.search());
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        assert.equal(page.locationInput(), LD.storeName);
        assert.equal(page.locationOptionLength(), 2);
        assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(0)`).text().trim(), LD.storeNameFour);
        assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(1)`).text().trim(), LD.storeNameTwo);
    });
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(page.locationInput(), LD.storeNameTwo);
    });
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, '');
    andThen(() => {
        assert.equal(page.locationOptionLength(), 1);
        assert.equal(find(`${LOCATION_DROPDOWN}`).text().trim(), LD.storeNameTwo);
    });
    fillIn(`${SEARCH}`, '6');
    andThen(() => {
        assert.equal(page.locationInput(), LD.storeNameTwo);
        assert.equal(page.locationOptionLength(), 2);
        assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(0)`).text().trim(), LD.storeNameFour);
        assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(1)`).text().trim(), LD.storeNameTwo);
    });
    page.locationClickOptionTwo();
    andThen(() => {
        assert.equal(page.locationInput(), LD.storeNameTwo);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('location.id'), LD.idTwo);
        assert.equal(ticket.get('location_fk'), LD.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        //ensure categories has not changed
        assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
        assert.equal(ticket.get('categories').get('length'), 3);
    });
    //search specific location
    xhr(`${PREFIX}/admin/locations/?name__icontains=GHI789`, 'GET', null, {}, 200, LF.search_idThree());
    page.locationClickDropdown();
    fillIn(`${SEARCH}`, 'GHI789');
    andThen(() => {
        assert.equal(page.locationInput(), LD.storeNameTwo);
        assert.equal(page.locationOptionLength(), 1);
        assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(0)`).text().trim(), LD.storeNameThree);
    });
    page.locationClickIdThree();
    andThen(() => {
        assert.equal(page.locationInput(), LD.storeNameThree);
        let ticket = store.find('ticket', TD.idOne);
        assert.equal(ticket.get('location.id'), LD.idThree);
        assert.equal(ticket.get('location_fk'), LD.idOne);
        assert.ok(ticket.get('isDirtyOrRelatedDirty'));
        //ensure categories has not changed
        assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
        assert.equal(ticket.get('categories').get('length'), 3);
    });
    let response_put = TF.detail(TD.idOne);
    response_put.location = {id: LD.idThree, name: LD.storeNameThree};
    let payload = TF.put({id: TD.idOne, location: LD.idThree});
    xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
});

// //*TICKET TO ASSIGNEE*/
// test('assignee component shows assignee for ticket and will fire off xhr to fetch assignees on search to change assignee', (assert) => {
//     page.visitDetail();
//     andThen(() => {
//         assert.equal(page.assigneeInput(), PD.fullname);
//         let ticket = store.find('ticket', TD.idOne);
//         assert.equal(ticket.get('assignee.id'), PD.idOne);
//         assert.equal(ticket.get('assignee_fk'), PD.idOne);
//         assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     });
//     xhr(`${PREFIX}/admin/people/?fullname__icontains=b`, 'GET', null, {}, 200, PF.search());
//     page.assigneeClickDropdown();
//     fillIn(`${SEARCH}`, 'b');
//     andThen(() => {
//         assert.equal(page.assigneeInput(), PD.fullname);
//         assert.equal(page.assigneeOptionLength(), 11);
//         assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(0)`).text().trim(), PD.fullname);
//         assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(1)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
//         page.assigneeClickOptionTwo();
//         andThen(() => {
//             assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
//         });
//     });
//     page.assigneeClickDropdown();
//     fillIn(`${SEARCH}`, '');
//     andThen(() => {
//         assert.equal(page.assigneeOptionLength(), 1);
//         assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
//     });
//     fillIn(`${SEARCH}`, 'b');
//     andThen(() => {
//         assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
//         assert.equal(page.assigneeOptionLength(), 11);
//         assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(0)`).text().trim(), PD.fullname);
//         assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(1)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
//     });
//     page.assigneeClickOptionTwo();
//     andThen(() => {
//         assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
//         let ticket = store.find('ticket', TD.idOne);
//         assert.equal(ticket.get('assignee.id'), PD.idBoy);
//         assert.equal(ticket.get('assignee_fk'), PD.idOne);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         //ensure categories has not changed
//         assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
//         assert.equal(ticket.get('categories').get('length'), 3);
//     });
//     //search specific assignee
//     xhr(`${PREFIX}/admin/people/?fullname__icontains=Boy2`, 'GET', null, {}, 200, PF.search());
//     page.assigneeClickDropdown();
//     fillIn(`${SEARCH}`, 'Boy2');
//     andThen(() => {
//         assert.equal(page.assigneeInput(), `${PD.nameBoy} ${PD.lastNameBoy}`);
//         assert.equal(page.assigneeOptionLength(), 1);
//         assert.equal(find(`${ASSIGNEE_DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
//     });
//     page.assigneeClickOptionOne();
//     andThen(() => {
//         assert.equal(page.assigneeInput(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
//         let ticket = store.find('ticket', TD.idOne);
//         assert.equal(ticket.get('assignee.id'), PD.idSearch);
//         assert.equal(ticket.get('assignee_fk'), PD.idOne);
//         assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//         //ensure categories has not changed
//         assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
//         assert.equal(ticket.get('categories').get('length'), 3);
//     });
//     let response_put = TF.detail(TD.idOne);
//     response_put.assignee = {id: PD.idSearch, first_name: PD.nameBoy2};
//     let payload = TF.put({id: TD.idOne, assignee: PD.idSearch});
//     xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), TICKET_URL);
//     });
// });
