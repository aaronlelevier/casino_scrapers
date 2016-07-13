import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;

export const ADMIN_URL = `${PREFIX}/admin/`;
export const ADMIN_TRANSLATIONS_URL = `${PREFIX}/admin/translations/`;
export const ATTACHMENTS_URL = `${PREFIX}/admin/attachments/`;
export const CATEGORIES_URL = `${PREFIX}/admin/categories/`;
export const DTD_URL = `${PREFIX}/dtds/`;
export const DT_URL = `${PREFIX}/dt/`;
export const ROLES_URL = `${PREFIX}/admin/roles/`;
export const LOCATIONS_URL = `${PREFIX}/admin/locations/`;
export const LOCATION_LEVELS_URL = `${PREFIX}/admin/location-levels/`;
export const PEOPLE_URL = `${PREFIX}/admin/people/`;
export const PROFILE_URL = `${PREFIX}/admin/profiles/`;
export const THIRD_PARTIES_URL = `${PREFIX}/admin/third-parties/`;
export const TRANSLATION_URL = `${PREFIX}/admin/translations/`;
export const TICKETS_URL = `${PREFIX}/tickets/`;
export const WOS_URL = `${PREFIX}/work-orders/`;
export const SETTING_URL = `${PREFIX}/admin/settings/`;
export const DASHBOARD_URL = `${PREFIX}/dashboard/`;
export const DTD_ERROR_URL = `${PREFIX}/dtds/dtd-error/`;
export const ERROR_URL = '/error/';

var BASEURLS = {
    base_admin_url: '/admin',
    base_admin_translations_url: '/admin/translations',
    base_categories_url: '/admin/categories',
    base_dtd_url: '/dtds',
    base_dt_url: '/dt',
    base_locations_url: '/admin/locations',
    base_location_levels_url: '/admin/location-levels',
    base_people_url: '/admin/people',
    base_profile_url: '/admin/profiles',
    base_roles_url: '/admin/roles',
    base_third_parties_url: '/admin/third-parties',
    base_tickets_url: '/tickets',
    base_wos_url: '/work-orders',
    base_setting_url: '/admin/settings',
    dashboard_url: '/dashboard',
    dtd_error_url: '/dtds/dtd-error',
    error_url: '/error',
};


export default BASEURLS;
