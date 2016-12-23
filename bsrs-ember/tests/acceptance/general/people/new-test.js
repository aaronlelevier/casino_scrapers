import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PND from 'bsrs-ember/vendor/defaults/phone-number-type';
import LD from 'bsrs-ember/vendor/defaults/locale';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import config from 'bsrs-ember/config/environment';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/person';
import random from 'bsrs-ember/models/random';
import BASEURLS, { PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_INDEX_URL = BASE_PEOPLE_URL + '/index';
const DETAIL_URL = BASE_PEOPLE_URL + '/' + UUID.value;
const NEW_URL = BASE_PEOPLE_URL + '/new/1';
const PD = PERSON_DEFAULTS.defaults();

var payload, detail_xhr, list_xhr, people_detail_data, detailEndpoint, username_search;

moduleForAcceptance('Acceptance | general person new test', {
  beforeEach() {
    payload = {
      id: UUID.value,
      username: PD.username,
      password: PD.password,
      first_name: PD.first_name,
      middle_initial: PD.middle_initial,
      last_name: PD.last_name,
      role: PD.role,
      status: SD.activeId,
      locale: LD.idOne
    };
    list_xhr = xhr(PEOPLE_URL + '?page=1','GET',null,{},200,PF.empty());
    detailEndpoint = PEOPLE_URL;
    people_detail_data = {id: UUID.value, username: PD.username, role: RD.idOne, phone_numbers:[], addresses: [], locations: [], status_fk: SD.activeId, locale: PD.locale_id};
    const username_response = {'count':0,'next':null,'previous':null,'results': []};
    username_search = xhr(PEOPLE_URL + '?username=mgibson1', 'GET', null, {}, 200, username_response);
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    payload = null;
  }
});

test('username backend validation', function(assert) {
  clearxhr(username_search);
  clearxhr(list_xhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(find('.t-existing-error').text().trim(), '');
  });
  const username_response = {'count':1,'next':null,'previous':null,'results': [{'id': PD.idOne}]};
  username_search = xhr(PEOPLE_URL + '?username=mgibson1', 'GET', null, {}, 200, username_response);
  fillIn('.t-person-username', PD.username);
  andThen(() => {
    assert.equal(find('.t-existing-error').text().trim(), t(GLOBALMSG.existing_username, {value: PD.username}));
  });
});

test('clicking save reveals validation messages', function(assert) {
  clearxhr(list_xhr);
  visit(NEW_URL);
  page.usernameFillIn(PD.username);
  page.passwordFillIn(PD.password);
  page.firstNameFill(PD.first_name);
  page.middleInitialFill(PD.middle_initial);
  page.lastNameFill(PD.last_name);
  andThen(() => {
    assert.equal(document.title, t('doctitle.people.new'));
    assert.equal(find('[data-test-id="first-name"] .invalid').length, 0);
    assert.equal(find('[data-test-id="last-name"] .invalid').length, 0);
    assert.equal(find('[data-test-id="middle-initial"] .invalid').length, 0);
    assert.equal(find('.t-person-username-validator .invalid').length, 0);
  });
  page.firstNameFill('');
  triggerEvent('.t-person-first-name', 'keyup', {keyCode: 32});
  page.lastNameFill('');
  triggerEvent('.t-person-last-name', 'keyup', {keyCode: 32});
  page.middleInitialFill('');
  triggerEvent('.t-person-middle-initial', 'keyup', {keyCode: 32});
  page.usernameFillIn('');
  triggerEvent('.t-person-username', 'keyup', {keyCode: 32});
  andThen(() => {
    assert.equal(find('[data-test-id="first-name"] .invalid').length, 1);
    assert.equal(find('[data-test-id="last-name"] .invalid').length, 1);
    assert.equal(find('[data-test-id="middle-initial"] .invalid').length, 0);
    assert.equal(find('.t-person-username-validator').hasClass('invalid'), true);
  });
  page.firstNameFill(PD.first_name);
  triggerEvent('.t-person-first-name', 'keyup', {keyCode: 68});
  andThen(() => {
    assert.equal(find('[data-test-id="first-name"] .invalid').length, 0);
    assert.equal(find('[data-test-id="last-name"] .invalid').length, 1);
    assert.equal(find('[data-test-id="middle-initial"] .invalid').length, 0);
    assert.equal(find('.t-person-username-validator').hasClass('invalid'), true);
  });
  page.lastNameFill(PD.last_name);
  triggerEvent('.t-person-last-name', 'keyup', {keyCode: 68});
  andThen(() => {
    assert.equal(find('[data-test-id="first-name"] .invalid').length, 0);
    assert.equal(find('[data-test-id="last-name"] .invalid').length, 0);
    assert.equal(find('[data-test-id="middle-initial"] .invalid').length, 0);
    assert.equal(find('.t-person-username-validator').hasClass('invalid'), true);
  });
  page.usernameFillIn(PD.username);
  triggerEvent('.t-person-username', 'keyup', {keyCode: 68});
  andThen(() => {
    assert.equal(find('[data-test-id="first-name"] .invalid').length, 0);
    assert.equal(find('[data-test-id="last-name"] .invalid').length, 0);
    assert.equal(find('[data-test-id="middle-initial"] .invalid').length, 0);
    assert.equal(find('.t-person-username-validator').hasClass('invalid'), false);
  });
});

test('visiting /people/new and creating a new person', function(assert) {
  var response = Ember.$.extend(true, {}, payload);
  page.visitPeople();
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal(this.store.find('person').get('length'), 2);
    assert.equal(this.store.find('locale').get('length'), 2);
    assert.equal(page.roleInput, RD.nameOne);
    var person = this.store.find('person', UUID.value);
    assert.equal(person.get('id'), UUID.value);
    assert.ok(person.get('new'));
  });
  page.usernameFillIn(PD.username);
  page.passwordFillIn(PD.password);
  page.firstNameFill(PD.first_name);
  page.middleInitialFill(PD.middle_initial);
  page.lastNameFill(PD.last_name);
  xhr(PEOPLE_URL, 'POST', JSON.stringify(payload), {}, 201, response);
  xhr(detailEndpoint + UUID.value + '/', 'GET', null, {}, 200, people_detail_data);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(this.store.find('person').get('length'), 2);
    assert.equal(this.store.find('locale').get('length'), 2);
    var person = this.store.find('person').objectAt(1);
    assert.equal(person.get('id'), UUID.value);
    assert.equal(person.get('new'), undefined);
    assert.equal(person.get('new_pk'), undefined);
    assert.equal(person.get('username'), PD.username);
    assert.equal(person.get('password'), '');
    assert.equal(person.get('role').get('id'), PD.role);
    assert.equal(person.get('role_fk'), PD.role);
    assert.equal(person.get('locale.id'), LD.idOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', function(assert) {
  clearxhr(list_xhr);
  visit(NEW_URL);
  fillIn('.t-person-username', PD.username);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.equal(find('.t-person-username').val(), PD.username);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from this.store', function(assert) {
  visit(NEW_URL);
  andThen(() => {
    const person = this.store.find('person', UUID.value);
    assert.equal(person.get('id'), UUID.value);
    assert.equal(person.get('status_fk'), undefined);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  });
  fillIn('.t-person-username', PD.username);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
      var person = this.store.find('person', UUID.value);
      assert.equal(person.get('id'), UUID.value);
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      var person = this.store.find('person', UUID.value);
      // assert.equal(person.get('length'), 0);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the this.store', function(assert) {
  clearxhr(username_search);
  visit(NEW_URL);
  generalPage.cancel();
  andThen(() => {
    assert.equal(this.store.find('person').get('length'), 1);
  });
});

test('can change default role and locale', function(assert) {
  clearxhr(list_xhr);
  visit(NEW_URL);
  selectChoose('.t-person-role-select', RD.nameTwo);
  andThen(() => {
    const person = this.store.find('person', UUID.value);
    assert.equal(person.get('role').get('id'), RD.idTwo);
    assert.ok(person.get('roleIsDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.equal(page.roleInput, RD.nameTwo);
  });
  selectChoose('.t-locale-select', PD.localeTwo);
  andThen(() => {
    assert.equal(page.localeInput.replace(/\W+/, ''), LD.nameTwo);
  });
  const payload_two = {
    id: UUID.value,
    username: PD.username,
    password: PD.password,
    first_name: PD.first_name,
    middle_initial: PD.middle_initial,
    last_name: PD.last_name,
    role: RD.idTwo,
    status: SD.activeId,
    locale: LD.idTwo
  };
  fillIn('.t-person-username', PD.username);
  fillIn('.t-person-password', PD.password);
  fillIn('.t-person-first-name', PD.first_name);
  fillIn('.t-person-middle-initial', PD.middle_initial);
  fillIn('.t-person-last-name', PD.last_name);
  xhr(PEOPLE_URL, 'POST', JSON.stringify(payload_two), {}, 201, {});
  xhr(detailEndpoint + UUID.value + '/', 'GET', null, {}, 200, people_detail_data);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('adding a new person should allow for another new person to be created after the first is persisted', function(assert) {
  let person_count;
  uuidReset();
  payload.id = 'abc123';
  people_detail_data.id = 'abc123';
  patchRandomAsync(0);
  visit(NEW_URL);
  fillIn('.t-person-username', PD.username);
  fillIn('.t-person-password', PD.password);
  fillIn('.t-person-first-name', PD.first_name);
  fillIn('.t-person-middle-initial', PD.middle_initial);
  fillIn('.t-person-last-name', PD.last_name);
  xhr(PEOPLE_URL, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
  xhr(`${PEOPLE_URL}abc123/`, 'GET', null, {}, 200, people_detail_data);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), `${BASE_PEOPLE_URL}/abc123`);
    person_count = this.store.find('person').get('length');
  });
  selectChoose('.t-status-select', SD.inactiveNameTranslated);
  const multi_new_put_payload = {
    id: 'abc123',
    username: PD.username,
    first_name: PD.first_name,
    middle_initial: PD.middle_initial,
    last_name: PD.last_name,
    auth_amount: null,
    status: PD.statusInactive,
    role: PD.role,
    locations: [],
    emails: [],
    phone_numbers: [],
    locale: PD.locale_id,
  };
  xhr(`${PEOPLE_URL}abc123/`, 'PUT', JSON.stringify(multi_new_put_payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_INDEX_URL);
    assert.equal(this.store.find('person').get('length'), person_count);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal(this.store.find('person').get('length'), person_count + 1);
    assert.equal(find('.t-person-username').val(), '');
  });
});
