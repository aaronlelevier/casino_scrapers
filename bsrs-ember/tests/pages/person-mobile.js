import { create, visitable, clickable } from 'ember-cli-page-object';
import PD from 'bsrs-ember/vendor/defaults/person';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_INDEX_URL = `${BASE_PEOPLE_URL}/index`;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;

export default create({
  visit: visitable(PEOPLE_INDEX_URL),
  visitDetail: visitable(DETAIL_URL),
  clickFilterUsername: clickable('.t-filter-username'),
});
