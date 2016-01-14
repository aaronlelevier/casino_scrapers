import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const SORT_PRIORITY_DIR = '.t-sort-priority-translated-name-dir';
const FILTER_PRIORITY = '.t-filter-priority-translated-name';
const SAVE_FILTERSET_MODAL = '.t-show-save-filterset-modal';
const NUMBER_ONE = {keyCode: 49};

var application, store;

module('Acceptance | filter set test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('save filterset button is not available when page size or page is altered and only sort/find/search are persisted', function(assert) {
    const updated_pg_size = PAGE_SIZE*2;
    ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, TF.list());
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&page_size=${updated_pg_size}`, 'GET',null,{},200,TF.paginated(updated_pg_size));
    alterPageSize('.t-page-size', updated_pg_size);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&related_ordering=priority__name&page_size=${updated_pg_size}` ,'GET',null,{},200,TF.paginated(updated_pg_size));
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, TF.list());
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=2`, 'GET',null,{},200,TF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&page_size=${updated_pg_size}`, 'GET',null,{},200,TF.paginated(PAGE_SIZE));
    alterPageSize('.t-page-size', updated_pg_size);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&related_ordering=priority__name&page_size=${updated_pg_size}` ,'GET',null,{},200,TF.paginated(updated_pg_size));
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, TF.list());
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&request__icontains=num` ,'GET',null,{},200,TF.list());
    filterGrid('request', 'num');
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&page_size=${updated_pg_size}&request__icontains=num`, 'GET',null,{},200,TF.paginated(updated_pg_size));
    alterPageSize('.t-page-size', updated_pg_size);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&related_ordering=priority__name&page_size=${updated_pg_size}&request__icontains=num`, 'GET',null,{},200,TF.paginated(PAGE_SIZE));
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1&related_ordering=priority__name&page_size=${PAGE_SIZE}&request__icontains=num`, 'GET',null,{},200,TF.paginated(PAGE_SIZE));
    alterPageSize('.t-page-size', PAGE_SIZE);
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=2&related_ordering=priority__name&page_size=${PAGE_SIZE}&request__icontains=num`, 'GET',null,{},200,TF.paginated(PAGE_SIZE));
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
    });
    let query = '?find=request%3Anum&sort=priority.translated_name';
    let payload = {id: 'abc123', name: 'example', endpoint_name: 'tickets.index', endpoint_uri: query};
    patchRandomAsync(0);
    click(SAVE_FILTERSET_MODAL);
    ajax('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
    saveFilterSet('example', 'tickets.index');
    andThen(() => {
        const filterset = store.find('filterset', 'abc123');
        assert.equal(filterset.get('endpoint_uri'), query);
    });
});
