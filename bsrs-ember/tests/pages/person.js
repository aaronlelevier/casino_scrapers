import PageObject from '../page-object';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import PD from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';

let {
  visitable,
  text,
  clickable,
  count
} = PageObject;

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;
const STATUS = '.t-person-status-select > .ember-basic-dropdown-trigger';
const STATUS_DROPDOWN = '.t-person-status-select-dropdown > .ember-power-select-options';


export default PageObject.create({
  visit: visitable('/'),
  visitDetail: visitable(DETAIL_URL),
  statusInput: text(`${STATUS}`),
  statusClickDropdown: clickable(`${STATUS}`),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${SD.activeName})`),
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${SD.inactiveName})`),
  statusOptionLength: count(`${STATUS_DROPDOWN} > li`),
  statusOne: text(`${STATUS_DROPDOWN} > li:eq(0)`),
  statusTwo: text(`${STATUS_DROPDOWN} > li:eq(1)`),
  statusThree: text(`${STATUS_DROPDOWN} > li:eq(2)`),
});
