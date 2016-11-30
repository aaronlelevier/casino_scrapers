import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, count, text, hasClass, isHidden, isVisible } = PageObject;
import config from 'bsrs-ember/config/environment';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';
import PD from 'bsrs-ember/vendor/defaults/person';
import { POWER_SELECT_OPTIONS } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { TICKET_LIST_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL;
const NEW_URL = BASE_URL + '/new/1';
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
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
  ccClickDonald: clickable(`.ember-power-select-option:contains(${PD.donald})`, { scope: POWER_SELECT_OPTIONS }),
  ccClickOptionOne: clickable(`.ember-power-select-option:contains(${PD.nameBoy} Man)`, { scope: POWER_SELECT_OPTIONS }),
  ccClickMel: clickable(`.ember-power-select-option:contains(${PD.nameMel})`, { scope: POWER_SELECT_OPTIONS }),
  ccOptionLength: count('li', { scope: POWER_SELECT_OPTIONS }),
  ccsSelected: count(CCS),

  powerSelectComponents: count('.t-model-category-select'),
  categoryOneClickDropdown: clickable(CATEGORY_ONE),
  categoryOneInput: text(CATEGORY_ONE),
  categoryOneClickOptionOne: clickable(`.ember-power-select-option:contains(${CD.nameOne})`, { scope: POWER_SELECT_OPTIONS }),
  categoryOneClickOptionTwo: clickable(`.ember-power-select-option:contains(${CD.nameThree})`, { scope: POWER_SELECT_OPTIONS }),
  categoryOneOptionLength: count(`li`, { scope: POWER_SELECT_OPTIONS }),

  categoryTwoInput: text(CATEGORY_TWO),
  categoryTwoClickDropdown: clickable(CATEGORY_TWO),
  categoryTwoClickOptionOne: clickable(`.ember-power-select-option:contains(${CD.nameTwo})`, { scope: POWER_SELECT_OPTIONS }),
  categoryTwoClickOptionTwo: clickable(`.ember-power-select-option:contains(${CD.nameUnused})`, { scope: POWER_SELECT_OPTIONS }),
  categoryTwoClickOptionPlumbing: clickable(`.ember-power-select-option:contains(${CD.nameRepairChild})`, { scope: POWER_SELECT_OPTIONS }),
  categoryTwoClickOptionElectrical: clickable(`.ember-power-select-option:contains(${CD.nameTwo})`, { scope: POWER_SELECT_OPTIONS }),
  categoryTwoClickOptionSecurity: clickable(`.ember-power-select-option:contains(${CD.nameLossPreventionChild})`, { scope: POWER_SELECT_OPTIONS }),
  categoryTwoOptionLength: count('li', { scope: POWER_SELECT_OPTIONS }),

  categoryThreeInput: text(CATEGORY_THREE),
  categoryThreeClickDropdown: clickable(CATEGORY_THREE),
  categoryThreeClickOptionOne: clickable(`.ember-power-select-option:contains(${CD.nameElectricalChild})`, { scope: POWER_SELECT_OPTIONS }),
  categoryThreeClickOptionToilet: clickable(`.ember-power-select-option:contains(${CD.namePlumbingChild})`, { scope: POWER_SELECT_OPTIONS }),
  categoryThreeOptionLength: count('li', { scope: POWER_SELECT_OPTIONS }),

  locationInput: text(LOCATION),
  locationClickDropdown: clickable(LOCATION),
  locationClickOptionOne: clickable(`.ember-power-select-option:contains(${LD.storeName})`, { scope: POWER_SELECT_OPTIONS }),
  locationClickOptionTwo: clickable(`.ember-power-select-option:contains(${LD.storeNameTwo})`, { scope: POWER_SELECT_OPTIONS }),
  locationClickIdThree: clickable(`.ember-power-select-option:contains(${LD.storeNameThree})`, { scope: POWER_SELECT_OPTIONS }),
  locationOptionLength: count('li', { scope: POWER_SELECT_OPTIONS }),

  priorityInput: text(PRIORITY),
  priorityClickDropdown: clickable(PRIORITY),
  priorityClickOptionOne: clickable(`.ember-power-select-option:contains(${TD.priorityOne})`, { scope: POWER_SELECT_OPTIONS }),
  priorityClickOptionTwo: clickable(`.ember-power-select-option:contains(${TD.priorityTwo})`, { scope: POWER_SELECT_OPTIONS }),
  priorityOne: text('li:eq(0)', { scope: POWER_SELECT_OPTIONS }),
  priorityTwo: text('li:eq(1)', { scope: POWER_SELECT_OPTIONS }),
  priorityThree: text('li:eq(2)', { scope: POWER_SELECT_OPTIONS }),
  priorityFour: text('li:eq(3)', { scope: POWER_SELECT_OPTIONS }),

  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`.ember-power-select-option:contains(${TD.statusOne})`, { scope: POWER_SELECT_OPTIONS }),
  statusClickOptionTwo: clickable(`.ember-power-select-option:contains(${TD.statusTwo})`, { scope: POWER_SELECT_OPTIONS }),
  statusOne: text('li:eq(0)', { scope: POWER_SELECT_OPTIONS }),
  statusTwo: text('li:eq(1)', { scope: POWER_SELECT_OPTIONS }),
  statusThree: text('li:eq(2)', { scope: POWER_SELECT_OPTIONS }),
  statusFour: text('li:eq(3)', { scope: POWER_SELECT_OPTIONS }),
  statusFive: text('li:eq(4)', { scope: POWER_SELECT_OPTIONS }),
  statusSix: text('li:eq(5)', { scope: POWER_SELECT_OPTIONS }),
  statusSeven: text('li:eq(6)', { scope: POWER_SELECT_OPTIONS }),
  statusEight: text('li:eq(7)', { scope: POWER_SELECT_OPTIONS }),
  statusNine: text('li:eq(8)', { scope: POWER_SELECT_OPTIONS }),

  assigneeInput: text(ASSIGNEE),
  assigneeClickOptionOne: clickable(`.ember-power-select-option:eq(0)`, { scope: POWER_SELECT_OPTIONS }),
  assigneeClickOptionTwo: clickable(`.ember-power-select-option:eq(1)`, { scope: POWER_SELECT_OPTIONS }),
  // assigneeClickIdThree: clickable(`${POWER_SELECT_OPTIONS} > .ember-power-select-option:contains(${PD.storeNameThree})`),
  assigneeOptionLength: count('li', { scope: POWER_SELECT_OPTIONS }),

  request: value('.t-ticket-request-single'),
  requestFillIn: fillable('.t-ticket-request-single'),
  requesterFillIn: fillable('.t-ticket-requester'),
  comment: value('.t-ticket-comment'),
  commentFillIn: fillable('.t-ticket-comment'),

  //validation
  requestError: hasClass('invalid', '.t-ticket-request-validator'),
  assigneeErrorHidden: isHidden('.t-ticket-assignee-error'),
  assigneeErrorVisible: isVisible('.t-ticket-assignee-error'),
  assigneeErrorText: text('.t-ticket-assignee-error'),
  requestValidationErrorVisible: hasClass('invalid', '.t-ticket-request-validator'),
  requesterValidationErrorVisible: hasClass('invalid', '.t-ticket-requester-validator'),
  locationValidationErrorVisible: hasClass('invalid', '.t-ticket-location-select .ember-power-select-trigger'),
  assigneeValidationErrorVisible: hasClass('invalid', '.t-ticket-assignee-select .ember-power-select-trigger'),
  categoryValidationErrorVisible: hasClass('invalid', '.t-model-category-select:eq(0)'),
  categoryTwoValidationErrorVisible: hasClass('invalid', '.t-model-category-select:eq(1)'),
  categoryThreeValidationErrorVisible: hasClass('invalid', '.t-model-category-select:eq(2)'),
  // statusValidationErrorVisible: hasClass('invalid', '.t-ticket-status-validator'),
  // priorityValidationErrorVisible: hasClass('invalid', '.t-ticket-priority-validator'),

  //DT
  continueDT: clickable('.t-dt-continue'),
  activityTwoPerson: text('.t-person-activity:eq(0)'),

  // Grid
  sortGridByNumber: clickable('.t-sort-number-dir'),
});

export default TicketPage;
