import PageObject from '../page-object';
let { value, visitable, fillable, clickable, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';
import PD from 'bsrs-ember/vendor/defaults/person';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new/1';
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const CC = '.t-ticket-cc-select > .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CCS = `${CC} > .ember-power-select-multiple-option`;
const CC_ONE = `${CCS}:eq(0)`;
const CC_TWO = `${CCS}:eq(1)`;
const CC_THREE = `${CCS}:eq(2)`;
const CC_DROPDOWN = '.t-ticket-cc-select-dropdown > .ember-power-select-options';
const PRIORITY = '.t-ticket-priority-select > .ember-basic-dropdown-trigger';
const PRIORITY_DROPDOWN = '.t-ticket-priority-select-dropdown > .ember-power-select-options';
const LOCATION = '.t-ticket-location-select > .ember-basic-dropdown-trigger';
const LOCATION_DROPDOWN = '.t-ticket-location-select-dropdown > .ember-power-select-options';
const ASSIGNEE = '.t-ticket-assignee-select > .ember-basic-dropdown-trigger';
const ASSIGNEE_DROPDOWN = '.t-ticket-assignee-select-dropdown > .ember-power-select-options';
const CATEGORY_ONE = '.t-ticket-category-select:eq(0) > .ember-basic-dropdown-trigger';
const CATEGORY_TWO = '.t-ticket-category-select:eq(1) > .ember-basic-dropdown-trigger';
const CATEGORY_THREE = '.t-ticket-category-select:eq(2) > .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.t-ticket-category-select-dropdown > .ember-power-select-options';
const STATUS = '.t-ticket-status-select > .ember-basic-dropdown-trigger';
const STATUS_DROPDOWN = '.t-ticket-status-select-dropdown > .ember-power-select-options';

var TicketPage = PageObject.create({
  visitNew: visitable(NEW_URL),
  visit: visitable(TICKETS_URL),
  visitDetail: visitable(DETAIL_URL),
  update: clickable('.t-ticket-action-save'),

  ccClickDropdown: clickable(`${CC}`),
  ccInput: text(CC),
  ccSelected: text(CC_ONE),
  ccOneRemove: clickable(`${CC_ONE} > .ember-power-select-multiple-remove-btn`),
  ccTwoRemove: clickable(`${CC_TWO} > .ember-power-select-multiple-remove-btn`),
  ccTwoSelected: text(CC_TWO),
  ccThreeSelected: text(CC_THREE),
  ccClickDonald: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PD.donald})`),
  ccClickOptionOne: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PD.nameBoy} Man)`),
  ccClickOptionTwo: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PD.nameThree})`),
  ccClickMel: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PD.nameMel})`),
  ccOptionLength: count(`${CC_DROPDOWN} > li`),
  ccsSelected: count(CCS),

  powerSelectComponents: count('.t-ticket-category-select'),
  categoryOneClickDropdown: clickable(CATEGORY_ONE),
  categoryOneInput: text(CATEGORY_ONE),
  categoryOneClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameOne})`),
  categoryOneClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameThree})`),
  categoryOneOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  categoryTwoInput: text(CATEGORY_TWO),
  categoryTwoClickDropdown: clickable(CATEGORY_TWO),
  categoryTwoClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameTwo})`),
  categoryTwoClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameUnused})`),
  categoryTwoClickOptionPlumbing: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameRepairChild})`),
  categoryTwoClickOptionElectrical: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameTwo})`),
  categoryTwoClickOptionSecurity: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameLossPreventionChild})`),
  categoryTwoOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  categoryThreeInput: text(CATEGORY_THREE),
  categoryThreeClickDropdown: clickable(CATEGORY_THREE),
  categoryThreeClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameElectricalChild})`),
  categoryThreeClickOptionToilet: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.namePlumbingChild})`),
  categoryThreeOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  locationInput: text(LOCATION),
  locationClickDropdown: clickable(LOCATION),
  locationClickOptionOne: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LD.storeName})`),
  locationClickOptionTwo: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameTwo})`),
  locationClickIdThree: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameThree})`),
  locationOptionLength: count(`${LOCATION_DROPDOWN} > li`),

  priorityInput: text(PRIORITY),
  priorityClickDropdown: clickable(PRIORITY),
  priorityClickOptionOne: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TD.priorityOne})`),
  priorityClickOptionTwo: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TD.priorityTwo})`),
  priorityOne: text(`${PRIORITY_DROPDOWN} > li:eq(0)`),
  priorityTwo: text(`${PRIORITY_DROPDOWN} > li:eq(1)`),
  priorityThree: text(`${PRIORITY_DROPDOWN} > li:eq(2)`),
  priorityFour: text(`${PRIORITY_DROPDOWN} > li:eq(3)`),

  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${TD.statusOne})`),
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${TD.statusTwo})`),
  statusOne: text(`${STATUS_DROPDOWN} > li:eq(0)`),
  statusTwo: text(`${STATUS_DROPDOWN} > li:eq(1)`),
  statusThree: text(`${STATUS_DROPDOWN} > li:eq(2)`),
  statusFour: text(`${STATUS_DROPDOWN} > li:eq(3)`),
  statusFive: text(`${STATUS_DROPDOWN} > li:eq(4)`),
  statusSix: text(`${STATUS_DROPDOWN} > li:eq(5)`),
  statusSeven: text(`${STATUS_DROPDOWN} > li:eq(6)`),
  statusEight: text(`${STATUS_DROPDOWN} > li:eq(7)`),
  statusNine: text(`${STATUS_DROPDOWN} > li:eq(8)`),

  assigneeInput: text(ASSIGNEE),
  assigneeClickDropdown: clickable(ASSIGNEE),
  // assigneeClickOptionOne: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:contains(${PD.name})`),
  assigneeClickOptionOne: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:eq(0)`),
  assigneeClickOptionTwo: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:eq(1)`),
  // assigneeClickIdThree: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:contains(${PD.storeNameThree})`),
  assigneeOptionLength: count(`${ASSIGNEE_DROPDOWN} > li`),

  requestFillIn: fillable('.t-ticket-request'),
  requesterFillIn: fillable('.t-ticket-requester'),
  commentFillIn: fillable('.t-ticket-comment'),
});

export default TicketPage;
