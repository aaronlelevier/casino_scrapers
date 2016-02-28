import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PF from 'bsrs-ember/vendor/people_fixtures';
import RF from 'bsrs-ember/vendor/role_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PND from 'bsrs-ember/vendor/defaults/phone-number-type';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/person';
import random from 'bsrs-ember/models/random';
import {multi_new_put_payload} from 'bsrs-ember/tests/helpers/payloads/person';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_PEOPLE_URL + '/index';
const DETAIL_URL = BASE_PEOPLE_URL + '/' + UUID.value;
const NEW_URL = BASE_PEOPLE_URL + '/new/1';

var application, store, payload, detail_xhr, list_xhr, original_uuid, people_detail_data, detailEndpoint;

module('Acceptance | people-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            username: PD.username,
            password: PD.password,
            role: PD.role,
            status: SD.activeId
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = `${PREFIX}${BASE_PEOPLE_URL}/`;
        list_xhr = xhr(endpoint + '?page=1','GET',null,{},200,PF.empty());
        detailEndpoint = `${PREFIX}${BASE_PEOPLE_URL}/`;
        people_detail_data = {id: UUID.value, username: PD.username,
            role: RF.get() , phone_numbers:[], addresses: [], locations: [], status_fk: SD.activeId};
        detail_xhr = xhr(detailEndpoint + UUID.value + '/', 'GET', null, {}, 200, people_detail_data);
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
    },
    afterEach() {
        payload = null;
        detail_xhr = null;
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('visiting /people/new and creating a new person', (assert) => {
    clearxhr(detail_xhr);
    var response = Ember.$.extend(true, {}, payload);
    visit(PEOPLE_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        assert.equal(store.find('person').get('length'), 2);
        assert.equal(page.roleInput(), RD.nameOne);
        var person = store.find('person', UUID.value);
        assert.ok(person.get('new'));
        assert.equal(find('.t-person-password').attr('type'), 'password');
    });

    fillIn('.t-person-username', PD.username);
    fillIn('.t-person-password', PD.password);
    ajax(`${PREFIX}${BASE_PEOPLE_URL}/`, 'POST', JSON.stringify(payload), {}, 201, response);
    ajax(detailEndpoint + UUID.value + '/', 'GET', null, {}, 200, people_detail_data);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(store.find('person').get('length'), 2);
        var person = store.find('person').objectAt(1);
        assert.equal(person.get('id'), UUID.value);
        assert.equal(person.get('new'), undefined);
        assert.equal(person.get('username'), PD.username);
        assert.equal(person.get('password'), '');
        assert.equal(person.get('role').get('id'), PD.role);
        assert.equal(person.get('role_fk'), PD.role);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    var response = Ember.$.extend(true, {}, payload);
    var url = `${PREFIX}${BASE_PEOPLE_URL}/`;
    xhr( url,'POST',JSON.stringify(payload),{},201,response );
    visit(PEOPLE_URL);
    click('.t-add-new');
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':hidden'));
        assert.ok(find('.t-password-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.ok(find('.t-username-validation-error').is(':visible'));
        assert.equal(find('.t-username-validation-error').text(), GLOBALMSG.invalid_username);
        assert.ok(find('.t-password-validation-error').is(':visible'));
        assert.equal(find('.t-password-validation-error').text(), GLOBALMSG.invalid_password);
    });
    fillIn('.t-person-username', PD.username);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        assert.ok(find('.t-username-validation-error').is(':hidden'));
    });
    fillIn('.t-person-password', PD.password);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(detail_xhr);
    clearxhr(list_xhr);
    visit(NEW_URL);
    fillIn('.t-person-username', PD.username);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-person-username').val(), PD.username);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    andThen(() => {
        const person = store.find('person', UUID.value);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    fillIn('.t-person-username', PD.username);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            var person = store.find('person', {id: UUID.value});
            assert.equal(person.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            var person = store.find('person', {id: UUID.value});
            assert.equal(person.get('length'), 0);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    clearxhr(detail_xhr);
    visit(NEW_URL);
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('person').get('length'), 1);
    });
});

test('can change default role', (assert) => {
    clearxhr(list_xhr);
    visit(NEW_URL);
    page.roleClickDropdown();
    andThen(() => {
        const person = store.find('person', UUID.value);
        assert.equal(person.get('role').get('id'), RD.idOne);
    });
    page.roleClickOptionTwo();
    andThen(() => {
        const person = store.find('person', UUID.value);
        assert.equal(person.get('role').get('id'), RD.idTwo);
        assert.ok(person.get('roleIsDirty'));
        assert.ok(person.get('isDirtyOrRelatedDirty'));
        assert.equal(page.roleInput(), RD.nameTwo);
    });
    const payload_two = {
        id: UUID.value,
        username: PD.username,
        password: PD.password,
        role: RD.idTwo,
        status: SD.activeId
    };
    fillIn('.t-person-username', PD.username);
    fillIn('.t-person-password', PD.password);
    ajax(`${PREFIX}${BASE_PEOPLE_URL}/`, 'POST', JSON.stringify(payload_two), {}, 201, {});
    ajax(detailEndpoint + UUID.value + '/', 'GET', null, {}, 200, people_detail_data);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('adding a new person should allow for another new person to be created after the first is persisted', (assert) => {
    clearxhr(detail_xhr);
    let person_count;
    random.uuid = original_uuid;
    payload.id = 'abc123';
    people_detail_data.id = 'abc123';
    patchRandomAsync(0);
    visit(NEW_URL);
    fillIn('.t-person-username', PD.username);
    fillIn('.t-person-password', PD.password);
    ajax(`${PREFIX}${BASE_PEOPLE_URL}/`, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
    ajax(`${PREFIX}${BASE_PEOPLE_URL}/abc123/`, 'GET', null, {}, 200, people_detail_data);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), `${BASE_PEOPLE_URL}/abc123`);
        person_count = store.find('person').get('length');
    });
    page.roleClickDropdown();
    page.roleClickOptionOne();
    page.statusClickDropdown();
    page.statusClickOptionOne();
    ajax(`${PREFIX}${BASE_PEOPLE_URL}/abc123/`, 'PUT', JSON.stringify(multi_new_put_payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(store.find('person').get('length'), person_count);
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), NEW_URL);
        assert.equal(store.find('person').get('length'), person_count + 1);
        assert.equal(find('.t-person-username').val(), '');
    });
});
