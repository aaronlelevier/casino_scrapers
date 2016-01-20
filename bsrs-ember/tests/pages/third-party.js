import PageObject from '../page-object';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import SD from 'bsrs-ember/vendor/defaults/status';

let {
  visitable,
  text,
  clickable,
  count
} = PageObject;

const PREFIX = config.APP.NAMESPACE;
const BASE_THIRD_PARTY_URL = BASEURLS.base_third_parties_url;
const DETAIL_URL = `${BASE_THIRD_PARTY_URL}/${TPD.idOne}`;
const STATUS = '.t-person-status-select > .ember-basic-dropdown-trigger';
const STATUS_DROPDOWN = '.t-person-status-select-dropdown > .ember-power-select-options';


export default PageObject.create({
  visit: visitable('/'),
  visitDetail: visitable(DETAIL_URL),
  statusInput: text(`${STATUS}`),
  statusClickDropdown: clickable(`${STATUS}`),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${SD.activeNameTranslated})`),
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${SD.inactiveNameTranslated})`),
  statusOptionLength: count(`${STATUS_DROPDOWN} > li`),
  statusOne: text(`${STATUS_DROPDOWN} > li:eq(0)`),
  statusTwo: text(`${STATUS_DROPDOWN} > li:eq(1)`),
  statusThree: text(`${STATUS_DROPDOWN} > li:eq(2)`),
});
