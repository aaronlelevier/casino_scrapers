import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';
import PD from 'bsrs-ember/vendor/defaults/person';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new/1';
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const DROPDOWN = options;
const CC = '.t-ticket-cc-select > .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CCS = `${CC} > .ember-power-select-multiple-option`;
const CC_ONE = `${CCS}:eq(0)`;
const CC_TWO = `${CCS}:eq(1)`;
const CC_THREE = `${CCS}:eq(2)`;
const PRIORITY = '.t-ticket-priority-select > .ember-basic-dropdown-trigger';
const LOCATION = '.t-ticket-location-select > .ember-basic-dropdown-trigger';
const ASSIGNEE = '.t-ticket-assignee-select > .ember-basic-dropdown-trigger';
const CATEGORY_ONE = '.t-model-category-select:eq(0) > .ember-basic-dropdown-trigger';
const CATEGORY_TWO = '.t-model-category-select:eq(1) > .ember-basic-dropdown-trigger';
const CATEGORY_THREE = '.t-model-category-select:eq(2) > .ember-basic-dropdown-trigger';
const STATUS = '.t-ticket-status-select > .ember-basic-dropdown-trigger';

var TicketPage = PageObject.create({
  visitNew: visitable(NEW_URL),
  visit: visitable(TICKETS_URL),
  visitDetail: visitable(DETAIL_URL),
  update: clickable('.t-ticket-action-save'),

  ccClickDropdown: clickable(CC),
  ccInput: text(CC),
  ccSelected: text(CC_ONE),
  ccOneRemove: clickable(`${CC_ONE} > .ember-power-select-multiple-remove-btn`),
  ccTwoRemove: clickable(`${CC_TWO} > .ember-power-select-multiple-remove-btn`),
  ccTwoSelected: text(CC_TWO),
  ccThreeSelected: text(CC_THREE),
  ccClickDonald: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.donald})`),
  ccClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.nameBoy} Man)`),
  ccClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.nameThree})`),
  ccClickMel: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.nameMel})`),
  ccOptionLength: count(`${DROPDOWN} > li`),
  ccsSelected: count(CCS),

  powerSelectComponents: count('.t-model-category-select'),
  categoryOneClickDropdown: clickable(CATEGORY_ONE),
  categoryOneInput: text(CATEGORY_ONE),
  categoryOneClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameOne})`),
  categoryOneClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameThree})`),
  categoryOneOptionLength: count(`${DROPDOWN} > li`),

  categoryTwoInput: text(CATEGORY_TWO),
  categoryTwoClickDropdown: clickable(CATEGORY_TWO),
  categoryTwoClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameTwo})`),
  categoryTwoClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameUnused})`),
  categoryTwoClickOptionPlumbing: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameRepairChild})`),
  categoryTwoClickOptionElectrical: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameTwo})`),
  categoryTwoClickOptionSecurity: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameLossPreventionChild})`),
  categoryTwoOptionLength: count(`${DROPDOWN} > li`),

  categoryThreeInput: text(CATEGORY_THREE),
  categoryThreeClickDropdown: clickable(CATEGORY_THREE),
  categoryThreeClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.nameElectricalChild})`),
  categoryThreeClickOptionToilet: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${CD.namePlumbingChild})`),
  categoryThreeOptionLength: count(`${DROPDOWN} > li`),

  locationInput: text(LOCATION),
  locationClickDropdown: clickable(LOCATION),
  locationClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LD.storeName})`),
  locationClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameTwo})`),
  locationClickIdThree: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameThree})`),
  locationOptionLength: count(`${DROPDOWN} > li`),

  priorityInput: text(PRIORITY),
  priorityClickDropdown: clickable(PRIORITY),
  priorityClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${TD.priorityOne})`),
  priorityClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${TD.priorityTwo})`),
  priorityOne: text(`${DROPDOWN} > li:eq(0)`),
  priorityTwo: text(`${DROPDOWN} > li:eq(1)`),
  priorityThree: text(`${DROPDOWN} > li:eq(2)`),
  priorityFour: text(`${DROPDOWN} > li:eq(3)`),
  removePriority: clickable('.ember-power-select-clear-btn'),

  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${TD.statusOne})`),
  statusClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${TD.statusTwo})`),
  statusOne: text(`${DROPDOWN} > li:eq(0)`),
  statusTwo: text(`${DROPDOWN} > li:eq(1)`),
  statusThree: text(`${DROPDOWN} > li:eq(2)`),
  statusFour: text(`${DROPDOWN} > li:eq(3)`),
  statusFive: text(`${DROPDOWN} > li:eq(4)`),
  statusSix: text(`${DROPDOWN} > li:eq(5)`),
  statusSeven: text(`${DROPDOWN} > li:eq(6)`),
  statusEight: text(`${DROPDOWN} > li:eq(7)`),
  statusNine: text(`${DROPDOWN} > li:eq(8)`),

  assigneeInput: text(ASSIGNEE),
  assigneeClickDropdown: clickable(ASSIGNEE),
  // assigneeClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.name})`),
  assigneeClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:eq(0)`),
  assigneeClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:eq(1)`),
  // assigneeClickIdThree: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.storeNameThree})`),
  assigneeOptionLength: count(`${DROPDOWN} > li`),

  requestFillIn: fillable('.t-ticket-request'),
  requesterFillIn: fillable('.t-ticket-requester'),
  commentFillIn: fillable('.t-ticket-comment'),
});

export default TicketPage;
