import PageObject from 'bsrs-ember/tests/page-object';
let { visitable, text, clickable, count, fillable, hasClass } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import SD from 'bsrs-ember/vendor/defaults/status';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';


const PREFIX = config.APP.NAMESPACE;
const BASE_THIRD_PARTY_URL = BASEURLS.base_third_parties_url;
const DETAIL_URL = `${BASE_THIRD_PARTY_URL}/${TPD.idOne}`;
const STATUS = '.t-status-select .ember-basic-dropdown-trigger';
const STATUS_DROPDOWN = '.t-person-status-select-dropdown > .ember-power-select-options';


export default PageObject.create({
  visitDetail: visitable(DETAIL_URL),
  nameFill: fillable('.t-third-party-name'),
  numberFill: fillable('.t-third-party-number'),
  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${options} > .ember-power-select-option:contains(${SD.activeNameTranslated})`),
  statusClickOptionTwo: clickable(`${options} > .ember-power-select-option:contains(${SD.inactiveNameTranslated})`),
  statusOptionLength: count(`${options} > li`),
  statusOne: text(`${options} > li:eq(0)`),
  statusTwo: text(`${options} > li:eq(1)`),
  statusThree: text(`${options} > li:eq(2)`),
  
  //validation
  nameValidationErrorVisible: hasClass('invalid', '.t-third-party-name-validator'),
  numberValidationErrorVisible: hasClass('invalid', '.t-third-party-number-validator'),
});
