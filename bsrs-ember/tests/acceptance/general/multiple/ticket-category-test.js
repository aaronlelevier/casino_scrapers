import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LF from 'bsrs-ember/vendor/location_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const TICKET_LIST_URL = `${BASEURLS.base_tickets_url}/index`;
const TICKET_DETAIL_URL = `${BASEURLS.base_tickets_url}/${TD.idOne}`;
const CATEGORY_DETAIL_URL = `${BASEURLS.base_categories_url}/${CD.idOne}`;
const CATEGORY_DONALD_DETAIL_URL = `${BASEURLS.base_category_url}/${CD.idDonald}`;
const TOP_LEVEL_CATEGORIES_URL = `${PREFIX}/admin/categories/parents/`;
const TICKET_ACTIVITIES_URL = `${PREFIX}/tickets/${TD.idOne}/activity/`;
const LOCATION = '.t-category-locations-select > .ember-basic-dropdown-trigger';
const LOCATION_DROCDOWN = '.t-category-locations-select-dropdown > .ember-power-select-options';
const LOCATION_SEARCH = '.ember-power-select-trigger-multiple-input';

var application, store, category, ticket;

module('Acceptance | ticket and category test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking between category detail and ticket detail will not dirty the active category model', (assert) => {
    ajax(TICKET_ACTIVITIES_URL, 'GET', null, {}, 200, TA_FIXTURES.empty());
    ajax(`${PREFIX}${BASEURLS.base_tickets_url}/${TD.idOne}/`, 'GET', null, {}, 200, TF.detail());
    visit(TICKET_DETAIL_URL);
    ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [], CD.idOne));
    page.categoryTwoClickDropdown();
    page.categoryTwoClickOptionOne();
    andThen(() => {
        category = store.find('category', CD.idOne);
        assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    });
    ajax(`${PREFIX}${CATEGORY_DETAIL_URL}/`, 'GET', null, {}, 200, CF.detail(CD.idOne));
    visit(CATEGORY_DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_DETAIL_URL);
        category = store.find('category', CD.idOne);
        assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    });
});
