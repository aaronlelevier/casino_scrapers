import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/status';
import STORE_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/location-status';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import PND from 'bsrs-ember/vendor/defaults/phone-number-type';
import ED from 'bsrs-ember/vendor/defaults/email-type';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/ticket';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LOCALE_DEFAULTS from 'bsrs-ember/vendor/defaults/locale';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currency';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import { eachPermission } from 'bsrs-ember/utilities/permissions';

const HOME_URL = '/';
const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const { run } = Ember;
const WOSD = WORK_ORDER_STATUS_DEFAULTS.defaults();

moduleForAcceptance('Acceptance | general bootup test', {
  beforeEach() {
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  }
});

test('on boot we should fetch and load the email configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('email-type').get('length'), 2);
    assert.equal(this.store.find('email-type').objectAt(0).get('id'), ED.workId);
    assert.equal(this.store.find('email-type').objectAt(0).get('name'), ED.workEmail);
    assert.equal(this.store.find('email-type').objectAt(1).get('id'), ED.personalId);
    assert.equal(this.store.find('email-type').objectAt(1).get('name'), ED.personalEmail);
  });
});

test('on boot we should fetch and load the phone number configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('phone-number-type').get('length'), 2);
    assert.equal(this.store.find('phone-number-type').objectAt(0).get('id'), PND.officeId);
    assert.equal(this.store.find('phone-number-type').objectAt(0).get('name'), PND.officeName);
    assert.equal(this.store.find('phone-number-type').objectAt(1).get('id'), PND.mobileId);
    assert.equal(this.store.find('phone-number-type').objectAt(1).get('name'), PND.mobileName);
  });
});

test('on boot we should fetch and load the address configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('address-type').get('length'), 2);
    assert.equal(this.store.find('address-type').objectAt(0).get('id'), ATD.officeId);
    assert.equal(this.store.find('address-type').objectAt(0).get('name'), ATD.officeName);
    assert.equal(this.store.find('address-type').objectAt(1).get('id'), ATD.shippingId);
    assert.equal(this.store.find('address-type').objectAt(1).get('name'), ATD.shippingName);
  });
});

test('on boot we should fetch and load the person status configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('status').get('length'), 3);
    assert.equal(this.store.find('status').objectAt(0).get('id'), STATUS_DEFAULTS.activeId);
    assert.equal(this.store.find('status').objectAt(0).get('name'), STATUS_DEFAULTS.activeName);
    assert.equal(this.store.find('status').objectAt(1).get('id'), STATUS_DEFAULTS.inactiveId);
    assert.equal(this.store.find('status').objectAt(1).get('name'), STATUS_DEFAULTS.inactiveName);
    assert.equal(this.store.find('status').objectAt(2).get('id'), STATUS_DEFAULTS.expiredId);
    assert.equal(this.store.find('status').objectAt(2).get('name'), STATUS_DEFAULTS.expiredName);
  });
});

test('on boot we should fetch and load the this.store status configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('location-status').get('length'), 3);
    assert.equal(this.store.find('location-status').objectAt(0).get('id'), STORE_STATUS_DEFAULTS.openId);
    assert.equal(this.store.find('location-status').objectAt(0).get('name'), STORE_STATUS_DEFAULTS.openName);
    assert.equal(this.store.find('location-status').objectAt(1).get('id'), STORE_STATUS_DEFAULTS.closedId);
    assert.equal(this.store.find('location-status').objectAt(1).get('name'), STORE_STATUS_DEFAULTS.closedName);
    assert.equal(this.store.find('location-status').objectAt(2).get('id'), STORE_STATUS_DEFAULTS.futureId);
    assert.equal(this.store.find('location-status').objectAt(2).get('name'), STORE_STATUS_DEFAULTS.futureName);
  });
});

test('on boot we should fetch and load the ticket status configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('ticket-status').get('length'), 8);
    assert.equal(this.store.find('ticket-status').objectAt(0).get('id'), LD.statusOneId);
    assert.equal(this.store.find('ticket-status').objectAt(0).get('name'), LD.statusOneKey);
    assert.equal(this.store.find('ticket-status').objectAt(1).get('id'), LD.statusTwoId);
    assert.equal(this.store.find('ticket-status').objectAt(1).get('name'), LD.statusTwoKey);
    assert.equal(this.store.find('ticket-status').objectAt(2).get('id'), LD.statusThreeId);
    assert.equal(this.store.find('ticket-status').objectAt(2).get('name'), LD.statusThreeKey);
    assert.equal(this.store.find('ticket-status').objectAt(3).get('id'), LD.statusFourId);
    assert.equal(this.store.find('ticket-status').objectAt(3).get('name'), LD.statusFourKey);
    assert.equal(this.store.find('ticket-status').objectAt(4).get('id'), LD.statusFiveId);
    assert.equal(this.store.find('ticket-status').objectAt(4).get('name'), LD.statusFiveKey);
    assert.equal(this.store.find('ticket-status').objectAt(5).get('id'), LD.statusSixId);
    assert.equal(this.store.find('ticket-status').objectAt(5).get('name'), LD.statusSixKey);
    assert.equal(this.store.find('ticket-status').objectAt(6).get('id'), LD.statusSevenId);
    assert.equal(this.store.find('ticket-status').objectAt(6).get('name'), LD.statusSevenKey);
    assert.equal(this.store.find('ticket-status').objectAt(7).get('id'), LD.statusEightId);
    assert.equal(this.store.find('ticket-status').objectAt(7).get('name'), LD.statusEightKey);
  });
});

test('on boot we should fetch and load the work order status configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('work-order-status').get('length'), 13);
    assert.equal(this.store.find('work-order-status').objectAt(0).get('id'), WOSD.idOne);
    assert.equal(this.store.find('work-order-status').objectAt(0).get('name'), WOSD.nameOne);
    assert.equal(this.store.find('work-order-status').objectAt(1).get('id'), WOSD.idTwo);
    assert.equal(this.store.find('work-order-status').objectAt(1).get('name'), WOSD.nameThree);
    assert.equal(this.store.find('work-order-status').objectAt(2).get('name'), WOSD.nameTwo);
    assert.equal(this.store.find('work-order-status').objectAt(3).get('name'), WOSD.nameFour);
    assert.equal(this.store.find('work-order-status').objectAt(4).get('name'), WOSD.nameFive);
    assert.equal(this.store.find('work-order-status').objectAt(5).get('name'), WOSD.nameSix);
    assert.equal(this.store.find('work-order-status').objectAt(6).get('name'), WOSD.nameSeven);
    assert.equal(this.store.find('work-order-status').objectAt(7).get('name'), WOSD.nameEight);
    assert.equal(this.store.find('work-order-status').objectAt(8).get('name'), WOSD.nameNine);
    assert.equal(this.store.find('work-order-status').objectAt(9).get('name'), WOSD.nameTen);
    assert.equal(this.store.find('work-order-status').objectAt(10).get('name'), WOSD.nameEleven);
    assert.equal(this.store.find('work-order-status').objectAt(11).get('name'), WOSD.nameTwelve);
    assert.equal(this.store.find('work-order-status').objectAt(12).get('name'), WOSD.nameThirteen);
  });
});

test('on boot we should fetch and load the ticket priority configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(this.store.find('ticket-priority').get('length'), 4);
    assert.equal(this.store.find('ticket-priority').objectAt(0).get('id'), LD.priorityOneId);
    assert.equal(this.store.find('ticket-priority').objectAt(0).get('name'), LD.priorityOneKey);
    assert.equal(this.store.find('ticket-priority').objectAt(1).get('id'), LD.priorityTwoId);
    assert.equal(this.store.find('ticket-priority').objectAt(1).get('name'), LD.priorityTwoKey);
    assert.equal(this.store.find('ticket-priority').objectAt(2).get('id'), LD.priorityThreeId);
    assert.equal(this.store.find('ticket-priority').objectAt(2).get('name'), LD.priorityThreeKey);
    assert.equal(this.store.find('ticket-priority').objectAt(3).get('id'), LD.priorityFourId);
    assert.equal(this.store.find('ticket-priority').objectAt(3).get('name'), LD.priorityFourKey);
  });
});

test('on boot we should fetch and load the currency configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    let currency_models = this.store.find('currency');
    assert.equal(currency_models.get('length'), 4);
    assert.equal(currency_models.objectAt(0).get('id'), CURRENCY_DEFAULTS.id);
    assert.equal(currency_models.objectAt(0).get('symbol'), CURRENCY_DEFAULTS.symbol);
    assert.equal(currency_models.objectAt(0).get('decimal_digits'), CURRENCY_DEFAULTS.decimal_digits);
    assert.equal(currency_models.objectAt(0).get('code'), CURRENCY_DEFAULTS.code);
    assert.equal(currency_models.objectAt(0).get('symbol_native'), CURRENCY_DEFAULTS.symbol_native);
    assert.equal(currency_models.objectAt(0).get('rounding'), CURRENCY_DEFAULTS.rounding);
    assert.equal(currency_models.objectAt(0).get('name_plural'), CURRENCY_DEFAULTS.name_plural);
    assert.equal(currency_models.objectAt(0).get('name'), CURRENCY_DEFAULTS.name);
  });
});

test('on boot we should fetch and load the role configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    let role_models = this.store.find('role');
    assert.equal(role_models.get('length'), 6);
    assert.equal(role_models.objectAt(0).get('id'), RD.idOne);
    assert.equal(role_models.objectAt(0).get('name'), RD.nameOne);
    assert.equal(role_models.objectAt(0).get('location_level').get('id'), LLD.idOne);
    assert.equal(role_models.objectAt(0).get('location_level').get('name'), LLD.nameCompany);
    assert.equal(role_models.objectAt(0).get('role_type'), RD.t_roleTypeGeneral);
    assert.equal(role_models.objectAt(0).get('location_level').get('id'), LLD.idOne);
    assert.equal(role_models.objectAt(1).get('location_level').get('id'), LLD.idDistrict);
    assert.equal(role_models.objectAt(2).get('location_level').get('id'), LLD.idThree);
    assert.equal(role_models.objectAt(3).get('location_level').get('id'), LLD.idStore);
  });
});

test('on boot we should fetch and load the role types configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    let role_types_models = this.store.find('role-type');
    assert.equal(role_types_models.get('length'), 2);
    assert.ok(role_types_models.objectAt(0).get('id') > 0);
    assert.equal(role_types_models.objectAt(0).get('name'), RD.t_roleTypeGeneral);
  });
});

test('on boot we should fetch and load the location level configuration', function(assert) {
  run(() => {
    this.store.clear('location-level');
  });
  visit(HOME_URL);
  andThen(() => {
    let location_level_models = this.store.find('location-level');
    assert.equal(location_level_models.get('length'), 8);
    assert.equal(location_level_models.objectAt(0).get('id'), LLD.idOne);
    assert.equal(location_level_models.objectAt(0).get('name'), LLD.nameCompany);
  });
});

test('locale', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    let locale = this.store.findOne('locale');
    assert.equal(locale.get('id'), LOCALE_DEFAULTS.idOne);
    assert.equal(locale.get('name'), LOCALE_DEFAULTS.nameOneKey);
    assert.equal(locale.get('locale'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('native_name'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('presentation_name'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('rtl'), LOCALE_DEFAULTS.rtlOne);
    assert.equal(locale.get('default'), LOCALE_DEFAULTS.defaultOne);
  });
});

test('on boot we should fetch and load the person-current, logged in Person, configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    let expected = PERSON_CURRENT.defaults();
    let person_current = this.store.findOne('person');
    assert.equal(person_current.get('id'), expected.id);
    assert.equal(person_current.get('first_name'), expected.first_name);
    assert.equal(person_current.get('last_name'), expected.last_name);
    assert.equal(person_current.get('username'), expected.username);
    assert.equal(person_current.get('title'), expected.title);
    assert.equal(person_current.get('status.id'), expected.status_fk);
    assert.equal(person_current.get('role.id'), this.store.find('person', expected.id).get('role').get('id'));
    assert.equal(person_current.get('locale.id'), expected.locale);
    assert.equal(person_current.get('timezone'), expected.timezone);
    assert.deepEqual(person_current.get('inherited'), expected.inherited);
  });
});

test('on boot we should fetch and load the saved filterset configuration', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    let filtersets = this.store.find('filterset');
    assert.equal(filtersets.get('length'), 7);
    assert.equal(filtersets.objectAt(0).get('endpoint_name'), 'main.tickets.index');
    assert.deepEqual(filtersets.objectAt(0).get('endpoint_uri'), '?sort=assignee.fullname');
  });
});

test('person-currents role comes with a permissions object and the other roles dont', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    let person_current = this.store.findOne('person');
    assert.equal(person_current.get('id'), PERSON_CURRENT.defaults().id);
    let perms = person_current.get('permissions');
    eachPermission((resource, prefix) => {
      assert.ok(perms.indexOf(`${prefix}_${resource}`) > -1);
    });
  });
});
