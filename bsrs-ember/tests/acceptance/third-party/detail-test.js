import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import THIRD_PARTY_FIXTURES from 'bsrs-ember/vendor/third_party_fixtures';
import THIRD_PARTY_DEFAULTS from 'bsrs-ember/vendor/defaults/third-party';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_third_parties_url;
const LIST_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + THIRD_PARTY_DEFAULTS.idOne;

let application, store, endpoint, endpoint_detail, list_xhr, detail_xhr;

module('Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        let third_party_list_data = THIRD_PARTY_FIXTURES.list();
        let third_party_detail_data = THIRD_PARTY_FIXTURES.detail();
        endpoint = PREFIX + BASE_URL + '/';
        endpoint_detail = PREFIX + DETAIL_URL + '/';
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, third_party_list_data);
        detail_xhr = xhr(endpoint_detail, 'GET', null, {}, 200, third_party_detail_data);
    },
    afterEach() {
       Ember.run(application, 'destroy');
       detail_xhr = null;
       list_xhr = null;
    }
});

test('clicking on a third party name will redirect them to the detail view', (assert) => {
    visit(LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), LIST_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), LIST_URL);
    });
});

test('visiting admin/third-parties detail and update all fields on the record', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let third_party = store.find('third-party').objectAt(0);
        assert.ok(third_party.get('isNotDirty'));
        assert.equal(find('.t-third-party-name').val(), THIRD_PARTY_DEFAULTS.nameOne);
        assert.equal(find('.t-third-party-number').val(), THIRD_PARTY_DEFAULTS.numberOne);
        assert.equal(find('.t-third-party-status').val(), THIRD_PARTY_DEFAULTS.statusActive);
    });
    let response = THIRD_PARTY_FIXTURES.detail(THIRD_PARTY_DEFAULTS.idOne);
    let payload = THIRD_PARTY_FIXTURES.put({
        name: THIRD_PARTY_DEFAULTS.nameTwo,
        number: THIRD_PARTY_DEFAULTS.numberTwo,
        status: THIRD_PARTY_DEFAULTS.statusInactive
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    fillIn('.t-third-party-number', THIRD_PARTY_DEFAULTS.numberTwo);
    fillIn('.t-third-party-status', THIRD_PARTY_DEFAULTS.statusInactive);
    andThen(() => {
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.ok(third_party.get('isDirty'));
    });
    xhr(endpoint_detail, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LIST_URL);
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo);
        assert.equal(third_party.get('number'), THIRD_PARTY_DEFAULTS.numberTwo);
        assert.equal(third_party.get('status'), THIRD_PARTY_DEFAULTS.statusInactive);
        assert.ok(third_party.get('isNotDirty'));
    });
});

test('admin/third-parties detail: when editing name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-third-party-name', '');
    fillIn('.t-third-party-number', '');
    fillIn('.t-third-party-status', '');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid Name');
        assert.equal(find('.t-number-validation-error').text().trim(), 'Invalid Number');
        assert.equal(find('.t-status-validation-error').text().trim(), 'Invalid Status');
    });
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    fillIn('.t-third-party-number', THIRD_PARTY_DEFAULTS.numberTwo);
    fillIn('.t-third-party-status', THIRD_PARTY_DEFAULTS.statusInactive);
    let response = THIRD_PARTY_FIXTURES.detail(THIRD_PARTY_DEFAULTS.idOne);
    let payload = THIRD_PARTY_FIXTURES.put({
        name: THIRD_PARTY_DEFAULTS.nameTwo,
        number: THIRD_PARTY_DEFAULTS.numberTwo,
        status: THIRD_PARTY_DEFAULTS.statusInactive
    });
    xhr(endpoint_detail, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), LIST_URL);
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameTwo);
        assert.equal(third_party.get('number'), THIRD_PARTY_DEFAULTS.numberTwo);
        assert.equal(third_party.get('status'), THIRD_PARTY_DEFAULTS.statusInactive);
        assert.ok(third_party.get('isNotDirty'));
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    andThen(() => {
        let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
        assert.ok(third_party.get('isDirty'));
    });
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-third-party-name').val(), THIRD_PARTY_DEFAULTS.nameTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-third-party-name', THIRD_PARTY_DEFAULTS.nameTwo);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LIST_URL);
            let third_party = store.find('third-party', THIRD_PARTY_DEFAULTS.idOne);
            assert.equal(third_party.get('name'), THIRD_PARTY_DEFAULTS.nameOne);
        });
    });
});

test('when click delete, third-party is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    var delete_url = PREFIX + BASE_URL + '/' + THIRD_PARTY_DEFAULTS.idOne + '/';
    xhr(delete_url, 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), LIST_URL);
        assert.equal(store.find('third-party', THIRD_PARTY_DEFAULTS.idOne).get('length'), undefined);
    });
});
