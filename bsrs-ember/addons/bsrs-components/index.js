/* jshint node: true */
'use strict';

module.exports = {
    name: 'bsrs-components',
    contentFor: function(type) {
        var environment = this.app.env.toString();
        var config_data = '';
        if (type === 'head') {
            if (environment === 'production' || process.env.LOCAL_SERVER === 'true') {
                config_data += "<script type='text/preload' charset='utf-8' data-preload-phonenumber_types='phonenumber_types' data-configuration='{{phone_number_types_config|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-email_types='email_types' data-configuration='{{email_types_config|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-address_types='address_types' data-configuration='{{address_types|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-person-statuses='statuses' data-configuration='{{person_status_config|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-roles='roles' data-configuration='{{role_config|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-role-types='role-types' data-configuration='{{role_types_config|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-location-statuses='location_statuses' data-configuration='{{location_status_config|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-location-levels='location_levels' data-configuration='{{location_level_config|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-locales='locales' data-configuration='{{locales|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-currencies='currencies' data-configuration='{{currencies|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-person-current='person_current' data-configuration='{{person_current|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-saved-filterset='saved_filterset' data-configuration='{{saved_search|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-ticket-statuses='ticket_statuses' data-configuration='{{ticket_statuses|escape}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-ticket-priorities='ticket_priorities' data-configuration='{{ticket_priorities|escape}}'></script>";
            } else {
                config_data += "<script type='text/preload' charset='utf-8' data-preload-email_types='email_types' data-configuration='[{ \"id\": \"c41834fb-7997-4a04-8f7e-f3b57b214c51\", \"name\": \"admin.emailtype.work\" }, { \"id\": \"60898078-dafe-4cf1-8aa5-867b0ebc5e2e\", \"name\": \"admin.emailtype.personal\" }]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-phonenumber_types='phonenumber_types' data-configuration='[{ \"id\": \"2bff27c7-ca0c-463a-8e3b-6787dffbe7de\", \"name\": \"admin.phonenumbertype.office\" }, { \"id\": \"9416c657-6f96-434d-aaa6-0c867aff3270\", \"name\": \"admin.phonenumbertype.mobile\" }]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-address_types='address_types' data-configuration='[{ \"id\": \"8e16a68c-fda6-4c30-ba7d-fee98257e92d\", \"name\": \"admin.address_type.office\" }, { \"id\": \"f7e55e71-1ff2-4cc2-8700-139802738bd0\", \"name\": \"admin.address_type.shipping\" }]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-person-statuses='statuses' data-configuration='[{\"id\": \"88b54767-fa08-4960-abbb-4fc28cd7908b\",\"name\":\"admin.person.status.active\", \"default\": \"true\"},{\"id\": \"fba38ad1-ff6b-4f2d-8264-c0a4d7670927\",\"name\":\"admin.person.status.inactive\"},{\"id\": \"1a19181d-5a00-419f-940e-809e72b8a4e5\",\"name\":\"admin.person.status.expired\"}]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-roles='roles' data-configuration='[{\"id\": \"af34ee9b-833c-4f3e-a584-b6851d1e04b1\",\"name\": \"System Administrator\",\"location_level\": \"85c18266-dfca-4499-9cff-7c5c6970af7e\",\"role_type\": \"admin.role.type.internal\",\"default\": true, \"inherited\": {\"dashboard_text\": {\"value\": null,\"inherited_value\": \"Welcome\",\"inherits_from\": \"tenant\",\"inherits_from_id\": \"63774987-65d2-4475-b998-091059c90e10\"},\"auth_currency\": {\"inherited_value\": \"2e92dc64-8646-4ef4-823f-407b5a3a2853\",\"inherits_from\": \"tenant\",\"inherits_from_id\": \"63774987-65d2-4475-b998-091059c90e10\"}}}, {\"id\": \"af34ee9b-833c-4f3e-a584-b6851d1e04b2\",\"name\":\"District Manager\", \"location_level\": \"73dcbd73-8fad-4152-b92c-3408c2029a65\", \"role_type\": \"admin.role.type.internal\"}, {\"id\": \"af34ee9b-833c-4f3e-a584-b6851d1e04e4\",\"name\":\"Regional Manager\", \"location_level\": \"c42bd2fc-d959-4896-9b89-aa2b2136ab9a\", \"role_type\": \"admin.role.type.internal\"}, {\"id\": \"af34ee9b-833c-4f3e-a584-b6851d1e04b3\",\"name\":\"Store Manager\", \"location_level\": \"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"role_type\": \"admin.role.type.internal\"}, {\"id\": \"af34ee9b-833c-4f3e-a584-b6851d1e14e9\", \"name\":\"Coordinator\", \"location_level\": \"ef2b1f9c-f277-433f-8431-bda21d2d9a74\", \"role_type\": \"admin.role.type.internal\"}, {\"id\": \"af34ee9b-833c-4f3e-a584-b6851d1e15e8\",\"name\":\"Contractor\", \"role_type\": \"admin.role.type.third_party\"}]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-role-types='role-types' data-configuration='[\"admin.role.type.internal\", \"admin.role.type.third_party\"]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-location-statuses='location_statuses' data-configuration='[{\"id\": \"aca00958-987d-4576-aa4c-2093dc7d40f4\",\"name\":\"admin.location.status.open\", \"default\": \"true\"},{\"id\": \"aca00958-987d-4576-aa4c-2093dc7d40f5\",\"name\":\"admin.location.status.closed\", \"default\": \"false\"},{\"id\": \"aca00958-987d-4576-aa4c-2093dc7d40f6\", \"name\":\"admin.location.status.future\", \"default\": \"false\"}]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-location-levels='location_levels' data-configuration='[ {\"id\": \"85c18266-dfca-4499-9cff-7c5c6970af7e\",\"name\":\"Company\", \"children\": [\"c42bd2fc-d959-4896-9b89-aa2b2136ab9a\", \"ef2b1f9c-f277-433f-8431-bda21d2d9a74\", \"f7199d15-b78b-4db9-b28f-cc95b4662804\", \"558d3cb9-f076-4303-a818-84799806d698\", \"73dcbd73-8fad-4152-b92c-3408c2029a65\", \"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\"] } , {\"id\": \"c42bd2fc-d959-4896-9b89-aa2b2136ab9a\",\"name\":\"Region\", \"children\": [\"73dcbd73-8fad-4152-b92c-3408c2029a65\", \"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\"], \"parents\": [\"85c18266-dfca-4499-9cff-7c5c6970af7e\"]} , {\"id\":\"73dcbd73-8fad-4152-b92c-3408c2029a65\", \"name\": \"District\", \"children\": [\"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\"], \"parents\": [\"c42bd2fc-d959-4896-9b89-aa2b2136ab9a\"] } , {\"id\": \"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"name\": \"Store\", \"children\":[\"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\"], \"parents\": [\"73dcbd73-8fad-4152-b92c-3408c2029a65\", \"ef2b1f9c-f277-433f-8431-bda21d2d9a74\", \"558d3cb9-f076-4303-a818-84799806d698\"]} , {\"id\": \"ef2b1f9c-f277-433f-8431-bda21d2d9a74\",\"name\":\"Facility Management\", \"children\": [\"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\"], \"parents\": [\"85c18266-dfca-4499-9cff-7c5c6970af7e\"]} , {\"id\": \"f7199d15-b78b-4db9-b28f-cc95b4662804\", \"name\": \"Loss Prevention Region\", \"children\":[\"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\", \"558d3cb9-f076-4303-a818-84799806d698\"], \"parents\": [\"85c18266-dfca-4499-9cff-7c5c6970af7e\"]} , {\"id\": \"558d3cb9-f076-4303-a818-84799806d698\", \"name\": \"Loss Prevention District\", \"children\":[\"8854f6c5-58c7-4849-971f-e8df9e15e559\", \"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\"], \"parents\": [\"f7199d15-b78b-4db9-b28f-cc95b4662804\"]} , {\"id\": \"b42bd1fc-d959-4896-9b89-aa2b2136ab7f\",\"name\":\"Department\", \"children\": [], \"parents\": [\"8854f6c5-58c7-4849-971f-e8df9e15e559\"]}]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-locales='locales' data-configuration='[{\"id\":\"a7ae2835-ee7c-4604-92f7-045f3994936e\", \"locale\":\"en\", \"name\":\"admin.locale.en\", \"native_name\": \"en\", \"presentation_name\": \"en\", \"rtl\": false, \"default\": true}, {\"id\":\"51905ba8-024f-4739-ae5c-2d90ffc3f726\", \"locale\":\"es\", \"name\":\"admin.locale.es\", \"native_name\": \"Español\", \"presentation_name\": \"Español\", \"rtl\": false}]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-currencies='currencies' data-configuration='{\"USD\": {\"id\": \"2e92dc64-8646-4ef4-823f-407b5a3a2853\", \"symbol\": \"$\", \"name\": \"US Dollar\", \"symbol_native\": \"$\", \"decimal_digits\": 2, \"rounding\": 0, \"code\": \"USD\", \"name_plural\": \"US dollars\", \"default\": true}, \"CAD\": {\"id\": \"7c6b8e17-05ba-4f67-be42-15348df790ba\", \"symbol\": \"CA$\", \"name\": \"Canadian Dollar\", \"symbol_native\": \"$\", \"decimal_digits\": 2, \"rounding\": 0, \"code\": \"CAD\", \"name_plural\": \"Canadian dollars\" }, \"EUR\": {\"id\": \"ace31029-1a97-4759-a986-76cf84f657c7\", \"symbol\": \"€\", \"name\": \"Euro\", \"symbol_native\": \"€\", \"decimal_digits\": 2, \"rounding\": 0, \"code\": \"EUR\", \"name_plural\": \"euros\" }, \"CNY\": {\"id\": \"2b15a7e7-d4a2-47b5-adfd-7fd9cb55193d\", \"symbol\": \"CN¥\", \"name\": \"Chinese Yuan\", \"symbol_native\": \"CN¥\", \"decimal_digits\": 2, \"rounding\": 0, \"code\": \"CNY\", \"name_plural\": \"Chinese yuan\" }}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-person-current='person_current' data-configuration='{\"id\":\"b783a238-5631-4623-8d24-81a672bb4ea0\", \"first_name\": \"Donald\", \"middle_name\": \"A.\", \"last_name\": \"Trump\", \"username\": \"wanker\", \"title\": \"Wanker Extrodinare\", \"employee_id\": \"1\", \"locale\":\"a7ae2835-ee7c-4604-92f7-045f3994936e\", \"role\": \"af34ee9b-833c-4f3e-a584-b6851d1e04b1\", \"tenant\": \"63774987-65d2-4475-b998-091059c90e10\", \"status_fk\": \"88b54767-fa08-4960-abbb-4fc28cd7908b\", \"has_multi_locations\": \"true\", \"locations\": [{\"id\": \"a7b84195-6086-44b3-9d0c-1e71d69546be\", \"name\": \"Andys Pianos\", \"number\": \"1\", \"location_level\": \"85c18266-dfca-4499-9cff-7c5c6970af7e\", \"status_fk\": \"aca00958-987d-4576-aa4c-2093dc7d40f4\"}], \"inherited\": {\"auth_currency\": {\"inherited_value\": \"2e92dc64-8646-4ef4-823f-407b5a3a2853\", \"inherits_from_id\": \"af34ee9b-833c-4f3e-a584-b6851d1e04b1\", \"inherits_from\": \"role\"}, \"auth_amount\": {\"inherited_value\": 50000.0000, \"inherits_from_id\": \"af34ee9b-833c-4f3e-a584-b6851d1e04b1\", \"inherits_from\": \"role\"}}}'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-saved-filterset='saved_filterset' data-configuration='[{\"id\": \"55639133-fd6f-4a03-b7bc-ec2a6a3cb040\", \"name\": \"ordered by assignee\", \"endpoint_name\": \"tickets.index\", \"endpoint_uri\": \"?sort=assignee.fullname\"}, {\"id\": \"55639133-fd6f-4a03-b7bc-ec2a6a3cb041\", \"name\": \"ordered by location\", \"endpoint_name\": \"tickets.index\", \"endpoint_uri\": \"?sort=assignee.fullname\"}, {\"id\": \"55639133-fd6f-4a03-b7bc-ec2a6a3cb042\", \"name\": \"ordered by assignee2\", \"endpoint_name\": \"tickets.index\", \"endpoint_uri\": \"?sort=assignee.fullname\"}, {\"id\": \"55639133-fd6f-4a03-b7bc-ec2a6a3cb043\", \"name\": \"ordered by assignee3\", \"endpoint_name\": \"tickets.index\", \"endpoint_uri\": \"?sort=assignee.fullname\"}, {\"id\": \"55639133-fd6f-4a03-b7bc-ec2a6a3cb045\", \"name\": \"ordered by title\", \"endpoint_name\": \"admin.people.index\", \"endpoint_uri\": \"?sort=title\"}, {\"id\": \"55639133-fd6f-4a03-b7bc-ec2a6a3cb046\", \"name\": \"find trump\", \"endpoint_name\": \"admin.people.index\", \"endpoint_uri\": \"?find=username%3Awa\"}, {\"id\": \"55639133-fd6f-4a03-b7bc-ec2a6a3cb047\", \"name\": \"25 roles shown\", \"endpoint_name\": \"admin.roles.index\", \"endpoint_uri\": \"?page_size=25\"}]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-ticket-statuses='ticket_statuses' data-configuration='[{\"id\": \"5ab9b1fb-c624-4214-bb4c-16567b3d37e6\",\"name\":\"ticket.status.new\"},{\"id\": \"e30f3033-ae2a-4af6-9d3a-ea7c98056c1d\",\"name\":\"ticket.status.deferred\"},{\"id\": \"3ca0de41-540a-423b-84ca-a48add0acbdf\", \"name\":\"ticket.status.in_progress\"},{\"id\": \"ba2ed214-269b-455b-af40-fe4d74fa9551\", \"name\":\"ticket.status.complete\"},{\"id\": \"2926a989-3192-4f8f-9a37-cfb3985d0821\", \"name\":\"ticket.status.denied\"},{\"id\": \"e845fd81-1fef-4eee-ad38-7460c818854a\", \"name\":\"ticket.status.problem_solved\"},{\"id\": \"dfa1f64f-d0d7-4915-be85-54b8c38d3aeb\", \"name\":\"ticket.status.draft\", \"default\": true},{\"id\": \"820dfa6c-003b-42f4-8f10-6b78f8b40c6a\", \"name\":\"ticket.status.unsatisfactory_completion\"}]'></script>";
                config_data += "<script type='text/preload' charset='utf-8' data-preload-ticket-priorities='ticket_priorities' data-configuration='[{\"id\": \"dfe28a24-307f-4da0-85e7-cdac016808c0\",\"name\":\"ticket.priority.emergency\"},{\"id\": \"2a4c8c9c-7acb-44ca-af95-62a84e410e09\",\"name\":\"ticket.priority.high\"},{\"id\": \"d7c1cc5c-eecd-49f0-bf46-c1ec489271ae\",\"name\":\"ticket.priority.medium\", \"default\": true},{\"id\": \"7562051b-f5b7-40bf-a640-5c4cfb3a72a8\",\"name\":\"ticket.priority.low\"}]'></script>";
            }
            return config_data;
        }
        if (type === 'body-footer') {
            if (environment === 'production' || process.env.LOCAL_SERVER === 'true') {
                return '<script type="text/javascript">jQuery(document).ajaxSend(function(event, xhr, settings) { if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) { xhr.setRequestHeader("X-CSRFToken", "{{csrf_token}}"); } }); </script>';
            } else {
                return '<script type="text/javascript">jQuery(document).ajaxSend(function(event, xhr, settings) { if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) { xhr.setRequestHeader("X-CSRFToken", "faketoken1234"); } }); </script>';
            }
        }
    },

    isDevelopingAddon: function() {
        return true;
    },

    /**
      Copy build output into the sibling Django app

      To run the build, watch and develop with the backend server use:

      - `export LOCAL_SERVER=true && ember build -w`

      Be sure you have your python env activated and source env vars for Django app
    */
    outputReady: function() {
        if (process.env.LOCAL_SERVER === 'true') {
            this.promoteToDjango();
        }
    },
    promoteToDjango: function() {
        var fs = require('fs-extra');
        var exec = require('child_process').execSync;
        try {
            fs.emptyDirSync(serverPath(['ember', 'assets']));
            fs.copySync(distPath(['assets']), serverPath(['ember', 'assets']));
            fs.emptyDirSync(serverPath(['ember', 'css']));
            fs.copySync(distPath(['css']), serverPath(['ember', 'css']));
            fs.emptyDirSync(serverPath(['ember', 'fonts']));
            fs.copySync(distPath(['fonts']), serverPath(['ember', 'fonts']));
            fs.copySync(distPath(['index.html']), serverPath(['templates', 'index.html']));
            exec('./manage.py collectstatic --noinput', { cwd: serverPath() });
        } catch (e) {
            console.error(e);
        }
    }
};

function serverPath(array) {
    array = array || [];
    var path = require('path');
    var cwd = process.cwd(); // path to… bsrs-ember
    var serverDir = [cwd, '../', 'bsrs-django', 'bigsky'];
    return path.resolve.apply(null, serverDir.concat(array));
}

function distPath(array) {
    array = array || [];
    var path = require('path');
    var cwd = process.cwd(); // path to… bsrs-ember
    var distDir = [cwd, 'dist'];
    return path.resolve.apply(null, distDir.concat(array));
}

