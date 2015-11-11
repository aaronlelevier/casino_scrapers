import PageObject from '../page-object';
let { value, visitable, fillable, clickable, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const CC = '.t-ticket-cc-select > .ember-basic-dropdown > .ember-power-select-trigger';
const CCS = `${CC} > .ember-power-select-multiple-option`;
const CC_ONE = `${CCS}:eq(0)`;
const CC_TWO = `${CCS}:eq(1)`;
const CC_THREE = `${CCS}:eq(2)`;
const CC_DROPDOWN = '.t-ticket-cc-select-dropdown > .ember-power-select-options';
const PRIORITY = '.t-ticket-priority-select > .ember-basic-dropdown > .ember-power-select-trigger';
const PRIORITY_DROPDOWN = '.t-ticket-priority-select-dropdown > .ember-power-select-options';
const LOCATION = '.t-ticket-location-select > .ember-basic-dropdown > .ember-power-select-trigger';
const LOCATION_DROPDOWN = '.t-ticket-location-select-dropdown > .ember-power-select-options';
const ASSIGNEE = '.t-ticket-assignee-select > .ember-basic-dropdown > .ember-power-select-trigger';
const ASSIGNEE_DROPDOWN = '.t-ticket-assignee-select-dropdown > .ember-power-select-options';
const CATEGORY_ONE = '.t-ticket-category-select:eq(0) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_TWO = '.t-ticket-category-select:eq(1) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_THREE = '.t-ticket-category-select:eq(2) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_DROPDOWN = '.t-ticket-category-select-dropdown > .ember-power-select-options';
const STATUS = '.t-ticket-status-select > .ember-basic-dropdown > .ember-power-select-trigger';
const STATUS_DROPDOWN = '.t-ticket-status-select-dropdown > .ember-power-select-options';

var TicketPage = PageObject.create({
  visitNew: visitable(NEW_URL),
  visit: visitable(TICKETS_URL),
  visitDetail: visitable(DETAIL_URL),

  ccClickDropdown: clickable(`${CC}`),
  ccInput: text(`${CC}`),
  ccSelected: text(`${CC_ONE}`),
  ccOneRemove: clickable(`${CC_ONE} > .ember-power-select-multiple-remove-btn`),
  ccTwoRemove: clickable(`${CC_TWO} > .ember-power-select-multiple-remove-btn`),
  ccTwoSelected: text(`${CC_TWO}`),
  ccThreeSelected: text(`${CC_THREE}`),
  ccClickDonald: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PEOPLE_DEFAULTS.donald})`),
  ccClickOptionOne: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PEOPLE_DEFAULTS.nameBoy} Man)`),
  ccClickOptionTwo: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PEOPLE_DEFAULTS.nameThree})`),
  ccClickMel: clickable(`${CC_DROPDOWN} > .ember-power-select-option:contains(${PEOPLE_DEFAULTS.nameMel})`),
  ccOptionLength: count(`${CC_DROPDOWN} > li`),
  ccsSelected: count(`${CCS}`),

  selectizeComponents: count('.t-ticket-category-select'),
  categoryOneClickDropdown: clickable(`${CATEGORY_ONE}`),
  categoryOneInput: text(`${CATEGORY_ONE}`),
  categoryOneClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameOne})`),
  categoryOneClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameThree})`),
  categoryOneOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  categoryTwoInput: text(`${CATEGORY_TWO}`),
  categoryTwoClickDropdown: clickable(`${CATEGORY_TWO}`),
  categoryTwoClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameTwo})`),
  categoryTwoClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameUnused})`),
  categoryTwoClickOptionPlumbing: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameRepairChild})`),
  categoryTwoClickOptionElectrical: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameTwo})`),
  categoryTwoClickOptionSecurity: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameLossPreventionChild})`),
  categoryTwoOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  categoryThreeInput: text(`${CATEGORY_THREE}`),
  categoryThreeClickDropdown: clickable(`${CATEGORY_THREE}`),
  categoryThreeClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameElectricalChild})`),
  categoryThreeClickOptionToilet: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.namePlumbingChild})`),
  categoryThreeOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  locationInput: text(`${LOCATION}`),
  locationClickDropdown: clickable(`${LOCATION}`),
  locationClickOptionOne: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LOCATION_DEFAULTS.storeName})`),
  locationClickOptionTwo: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LOCATION_DEFAULTS.storeNameTwo})`),
  locationClickIdThree: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LOCATION_DEFAULTS.storeNameThree})`),
  locationOptionLength: count(`${LOCATION_DROPDOWN} > li`),

  priorityInput: text(`${PRIORITY}`),
  priorityClickDropdown: clickable(`${PRIORITY}`),
  priorityClickOptionOne: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.priorityOne})`),
  priorityClickOptionTwo: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.priorityTwo})`),
  priorityOptionLength: count(`${PRIORITY} > .selectize-dropdown div.option`),

  statusInput: text(`${STATUS}`),
  statusClickDropdown: clickable(`${STATUS}`),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.statusOne})`),
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.statusTwo})`),
  statusOptionLength: count(`${STATUS} > .selectize-dropdown div.option`),

  assigneeInput: text(`${ASSIGNEE}`),
  assigneeClickDropdown: clickable(`${ASSIGNEE}`),
  // assigneeClickOptionOne: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:contains(${PEOPLE_DEFAULTS.name})`),
  assigneeClickOptionOne: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:eq(0)`),
  assigneeClickOptionTwo: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:eq(1)`),
  // assigneeClickIdThree: clickable(`${ASSIGNEE_DROPDOWN} > .ember-power-select-option:contains(${PEOPLE_DEFAULTS.storeNameThree})`),
  assigneeOptionLength: count(`${ASSIGNEE_DROPDOWN} > li`),
});

export default TicketPage;
