import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, count, text, hasClass, isHidden, isVisible } = PageObject;
import config from 'bsrs-ember/config/environment';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';
import PD from 'bsrs-ember/vendor/defaults/person';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new/1';
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const DROPDOWN = options;
const CC = '.t-ticket-cc-select .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CCS = `${CC} > .ember-power-select-multiple-option`;
const CC_ONE = `${CCS}:eq(0)`;
const CC_TWO = `${CCS}:eq(1)`;
const CC_THREE = `${CCS}:eq(2)`;
const PRIORITY = '.t-ticket-priority-select .ember-basic-dropdown-trigger';
const LOCATION = '.t-ticket-location-select .ember-basic-dropdown-trigger';
const ASSIGNEE = '.t-ticket-assignee-select .ember-basic-dropdown-trigger';
const CATEGORY_ONE = '.t-model-category-select:eq(0) .ember-basic-dropdown-trigger';
const CATEGORY_TWO = '.t-model-category-select:eq(1) .ember-basic-dropdown-trigger';
const CATEGORY_THREE = '.t-model-category-select:eq(2) .ember-basic-dropdown-trigger';
const STATUS = '.t-ticket-status-select .ember-basic-dropdown-trigger';

var TicketPage = PageObject.create({
  visitNew: visitable(NEW_URL),
  visit: visitable(TICKETS_URL),
  visitDetail: visitable(DETAIL_URL),
  update: clickable('.t-ticket-action-save'),

  ccClickDropdown: clickable(CC),
  ccInput: text(CC),
  ccSelected: text(CC_ONE),
  ccOneRemove: clickable('.ember-power-select-multiple-remove-btn', { scope: CC_ONE }),
  ccTwoRemove: clickable('.ember-power-select-multiple-remove-btn', { scope: CC_TWO }),
  ccTwoSelected: text(CC_TWO),
  ccThreeSelected: text(CC_THREE),
  ccClickDonald: clickable(`.ember-power-select-option:contains(${PD.donald})`, { scope: DROPDOWN }),
  ccClickOptionOne: clickable(`.ember-power-select-option:contains(${PD.nameBoy} Man)`, { scope: DROPDOWN }),
  ccClickOptionTwo: clickable(`.ember-power-select-option:contains(${PD.nameThree})`, { scope: DROPDOWN }),
  ccClickMel: clickable(`.ember-power-select-option:contains(${PD.nameMel})`, { scope: DROPDOWN }),
  ccOptionLength: count('li', { scope: DROPDOWN }),
  ccsSelected: count(CCS),

  powerSelectComponents: count('.t-model-category-select'),
  categoryOneClickDropdown: clickable(CATEGORY_ONE),
  categoryOneInput: text(CATEGORY_ONE),
  categoryOneClickOptionOne: clickable(`.ember-power-select-option:contains(${CD.nameOne})`, { scope: DROPDOWN }),
  categoryOneClickOptionTwo: clickable(`.ember-power-select-option:contains(${CD.nameThree})`, { scope: DROPDOWN }),
  categoryOneOptionLength: count(`li`, { scope: DROPDOWN }),

  categoryTwoInput: text(CATEGORY_TWO),
  categoryTwoClickDropdown: clickable(CATEGORY_TWO),
  categoryTwoClickOptionOne: clickable(`.ember-power-select-option:contains(${CD.nameTwo})`, { scope: DROPDOWN }),
  categoryTwoClickOptionTwo: clickable(`.ember-power-select-option:contains(${CD.nameUnused})`, { scope: DROPDOWN }),
  categoryTwoClickOptionPlumbing: clickable(`.ember-power-select-option:contains(${CD.nameRepairChild})`, { scope: DROPDOWN }),
  categoryTwoClickOptionElectrical: clickable(`.ember-power-select-option:contains(${CD.nameTwo})`, { scope: DROPDOWN }),
  categoryTwoClickOptionSecurity: clickable(`.ember-power-select-option:contains(${CD.nameLossPreventionChild})`, { scope: DROPDOWN }),
  categoryTwoOptionLength: count('li', { scope: DROPDOWN }),

  categoryThreeInput: text(CATEGORY_THREE),
  categoryThreeClickDropdown: clickable(CATEGORY_THREE),
  categoryThreeClickOptionOne: clickable(`.ember-power-select-option:contains(${CD.nameElectricalChild})`, { scope: DROPDOWN }),
  categoryThreeClickOptionToilet: clickable(`.ember-power-select-option:contains(${CD.namePlumbingChild})`, { scope: DROPDOWN }),
  categoryThreeOptionLength: count('li', { scope: DROPDOWN }),

  locationInput: text(LOCATION),
  locationClickDropdown: clickable(LOCATION),
  locationClickOptionOne: clickable(`.ember-power-select-option:contains(${LD.storeName})`, { scope: DROPDOWN }),
  locationClickOptionTwo: clickable(`.ember-power-select-option:contains(${LD.storeNameTwo})`, { scope: DROPDOWN }),
  locationClickIdThree: clickable(`.ember-power-select-option:contains(${LD.storeNameThree})`, { scope: DROPDOWN }),
  locationOptionLength: count('li', { scope: DROPDOWN }),

  priorityInput: text(PRIORITY),
  priorityClickDropdown: clickable(PRIORITY),
  priorityClickOptionOne: clickable(`.ember-power-select-option:contains(${TD.priorityOne})`, { scope: DROPDOWN }),
  priorityClickOptionTwo: clickable(`.ember-power-select-option:contains(${TD.priorityTwo})`, { scope: DROPDOWN }),
  priorityOne: text('li:eq(0)', { scope: DROPDOWN }),
  priorityTwo: text('li:eq(1)', { scope: DROPDOWN }),
  priorityThree: text('li:eq(2)', { scope: DROPDOWN }),
  priorityFour: text('li:eq(3)', { scope: DROPDOWN }),

  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`.ember-power-select-option:contains(${TD.statusOne})`, { scope: DROPDOWN }),
  statusClickOptionTwo: clickable(`.ember-power-select-option:contains(${TD.statusTwo})`, { scope: DROPDOWN }),
  statusOne: text('li:eq(0)', { scope: DROPDOWN }),
  statusTwo: text('li:eq(1)', { scope: DROPDOWN }),
  statusThree: text('li:eq(2)', { scope: DROPDOWN }),
  statusFour: text('li:eq(3)', { scope: DROPDOWN }),
  statusFive: text('li:eq(4)', { scope: DROPDOWN }),
  statusSix: text('li:eq(5)', { scope: DROPDOWN }),
  statusSeven: text('li:eq(6)', { scope: DROPDOWN }),
  statusEight: text('li:eq(7)', { scope: DROPDOWN }),
  statusNine: text('li:eq(8)', { scope: DROPDOWN }),

  assigneeInput: text(ASSIGNEE),
  assigneeClickDropdown: clickable(ASSIGNEE),
  // assigneeClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.name})`),
  assigneeClickOptionOne: clickable(`.ember-power-select-option:eq(0)`, { scope: DROPDOWN }),
  assigneeClickOptionTwo: clickable(`.ember-power-select-option:eq(1)`, { scope: DROPDOWN }),
  // assigneeClickIdThree: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.storeNameThree})`),
  assigneeOptionLength: count('li', { scope: DROPDOWN }),

  request: value('.t-ticket-request'),
  requestFillIn: fillable('.t-ticket-request'),
  requesterFillIn: fillable('.t-ticket-requester'),
  comment: value('.t-ticket-comment'),
  commentFillIn: fillable('.t-ticket-comment'),

  //validation
  requestError: hasClass('invalid', '.t-ticket-request-validator'),
  assigneeErrorHidden: isHidden('.t-ticket-assignee-error'),
  assigneeErrorVisible: isVisible('.t-ticket-assignee-error'),
  assigneeErrorText: text('.t-ticket-assignee-error'),

  //DT
  continueDT: clickable('.t-dt-continue'),

  activityTwoPerson: text('.t-person-activity:eq(0)'),
});

export default TicketPage;
