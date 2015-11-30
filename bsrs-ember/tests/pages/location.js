import PageObject from '../page-object';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

let {
  visitable, 
  clickable,
  text
} = PageObject;

const LOCATIONLEVEL = '.t-location-level-select > .ember-basic-dropdown-trigger';
const LOCATIONLEVEL_DROPDOWN = '.t-location-level-select-dropdown > .ember-power-select-options';

export default PageObject.create({
  visit: visitable('/'),
  locationLevelInput: text(LOCATIONLEVEL),
  locationLevelClickDropdown: clickable(LOCATIONLEVEL),
  locationLevelClickOptionOne: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  locationLevelClickOptionTwo: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`),
});
