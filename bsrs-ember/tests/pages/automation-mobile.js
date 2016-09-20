import Ember from 'ember';
import { visitable, fillable, value, create, clickable, text, isVisible } from 'ember-cli-page-object';
import AD from 'bsrs-ember/vendor/defaults/automation';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;

export default create({
  visitDetail: visitable(DETAIL_URL),
  clickFilterDescription: clickable('.t-filter-description')
});
