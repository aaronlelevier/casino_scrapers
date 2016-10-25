import Ember from 'ember';
import { visitable, fillable, value, create, clickable, text, isVisible } from 'ember-cli-page-object';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;

export default create({
  visitDetail: visitable(DETAIL_URL),
  clickFilterCompanyName: clickable('.t-filter-company-name'),
  clickFilterCompanyCode: clickable('.t-filter-company-code'),

  companyName: value('.t-tenant-company_name'),
  companyNameFill: fillable('.t-tenant-company_name'),
});
