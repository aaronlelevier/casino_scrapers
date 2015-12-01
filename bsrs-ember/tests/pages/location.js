import PageObject from '../page-object';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LDS from 'bsrs-ember/vendor/defaults/location-status';

let {
  visitable, 
  clickable,
  text,
  count
} = PageObject;

const LOCATIONLEVEL = '.t-location-level-select > .ember-basic-dropdown-trigger';
const LOCATIONLEVEL_DROPDOWN = '.t-location-level-select-dropdown > .ember-power-select-options';
const STATUS = '.t-location-status-select > .ember-basic-dropdown-trigger';
const STATUS_DROPDOWN = '.t-location-status-select-dropdown > .ember-power-select-options';

export default PageObject.create({
  visit: visitable('/'),

  locationLevelInput: text(LOCATIONLEVEL),
  locationLevelClickDropdown: clickable(LOCATIONLEVEL),
  locationLevelClickOptionOne: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  locationLevelClickOptionTwo: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`),

  statusInput: text(`${STATUS}`),
  statusClickDropdown: clickable(`${STATUS}`),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${LDS.openName})`),
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${LDS.closedName})`),
  statusOptionLength: count(`${STATUS_DROPDOWN} > li`),
});
