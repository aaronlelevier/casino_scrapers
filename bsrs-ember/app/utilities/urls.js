import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;

// API Urls
export const ADMIN_URL = `${PREFIX}/admin/`;
export const ADMIN_TRANSLATIONS_URL = `${PREFIX}/admin/translations/`;
export const AUTOMATION_URL = `${PREFIX}/admin/automations/`;
export const AUTOMATION_AVAILABLE_FILTERS_URL = `${PREFIX}/admin/automation-available-filters/`;
export const ATTACHMENTS_URL = `${PREFIX}/admin/attachments/`;
export const CATEGORIES_URL = `${PREFIX}/admin/categories/`;
export const COUNTRY_URL = `${PREFIX}/countries/`;
export const DASHBOARD_URL = `${PREFIX}/dashboard/`;
export const DTD_URL = `${PREFIX}/dtds/`;
export const DTD_ERROR_URL = `${PREFIX}/dtds/dtd-error/`;
export const DT_URL = `${PREFIX}/dt/`;
export const ERROR_URL = '/error/';
export const EXPORT_DATA_URL = `${PREFIX}/export-data/`;
export const LOCATIONS_URL = `${PREFIX}/admin/locations/`;
export const LOCATION_LEVELS_URL = `${PREFIX}/admin/location-levels/`;
export const PEOPLE_URL = `${PREFIX}/admin/people/`;
export const ROLES_URL = `${PREFIX}/admin/roles/`;
export const SETTING_URL = `${PREFIX}/admin/settings/`;
export const STATE_URL = `${PREFIX}/states/`;
export const THIRD_PARTIES_URL = `${PREFIX}/admin/third-parties/`;
export const TRANSLATION_URL = `${PREFIX}/admin/translations/`;
export const TICKETS_URL = `${PREFIX}/tickets/`;
export const WOS_URL = `${PREFIX}/work-orders/`;

// App Urls
export const automation_LIST_URL = '/admin/automations/index';
export const CATEGORY_LIST_URL = '/admin/categories/index';
export const I18N_LIST_URL = '/admin/translations/index';
export const LOCATION_LIST_URL = '/admin/locations/index';
export const LOCATION_LEVEL_LIST_URL = '/admin/location-levels/index';
export const PEOPLE_LIST_URL = '/admin/people/index';
export const ROLE_LIST_URL = '/admin/roles/index';
export const THIRD_PARTY_LIST_URL = '/admin/third-parties/index';
export const TICKET_LIST_URL = '/tickets/index';

var BASEURLS = {
  base_admin_url: '/admin',
  BASE_AUTOMATION_URL: '/admin/automations',
  ADMIN_MOBILE_URL: '/admin-mobile',
  base_admin_translations_url: '/admin/translations',
  base_categories_url: '/admin/categories',
  base_dtd_url: '/dtds',
  base_dt_url: '/dt',
  base_locations_url: '/admin/locations',
  base_location_levels_url: '/admin/location-levels',
  base_people_url: '/admin/people',
  base_roles_url: '/admin/roles',
  base_third_parties_url: '/admin/third-parties',
  base_tickets_url: '/tickets',
  base_wos_url: '/work-orders',
  base_setting_url: '/admin/settings',
  DASHBOARD_URL: '/dashboard',
  dtd_error_url: '/dtds/dtd-error',
  error_url: '/error',
};


export default BASEURLS;
