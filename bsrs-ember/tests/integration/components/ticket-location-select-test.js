import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import { typeInSearch, clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';
import LD from 'bsrs-ember/vendor/defaults/location';
import TD from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, location_one, location_two, trans, run = Ember.run, location_repo;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-location-select';

moduleForComponent('ticket-location-select', 'integration: ticket-location-select test', {
  integration: true,
  setup() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:ticket',
      'model:location', 'service:person-current']);
    run(function() {
      ticket = store.push('ticket', {id: TD.idOne, location_fk: LD.idOne});
      location_one = store.push('related-location', {id: LD.idOne, name: LD.storeName});
      location_two = store.push('related-location', {id: LD.idTwo, name: LD.storeNameTwo});
      store.push('related-location', {id: LD.unusedId, name: LD.storeNameThree});
    });
    location_repo = repository.initialize(this.container, this.registry, 'location');
    location_repo.findTicket = function() {
      return [
        {id: LD.idOne, name: LD.storeName},
        {id: LD.idTwo, name: LD.storeNameTwo},
        {id: LD.unusedId, name: LD.storeNameThree}
      ];
    };
  }
});

// test('should render a selectbox when location options are empty (initial state of power select)', function(assert) {
//   this.model = ticket;
//   this.locationRepo = location_repo;
//   this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" repository=locationRepo searchMethod="findTicket"}}`);
//   let $component = this.$(`${COMPONENT}`);
//   clickTrigger();
//   assert.equal(this.$(`${DROPDOWN}`).length, 1);
//   assert.equal(this.$('.ember-power-select-options > li').length, 1);
//   assert.equal(this.$('li.ember-power-select-option').text(), GLOBALMSG.power_search);
//   assert.equal(this.$('.ember-power-select-placeholder').text(), GLOBALMSG.location_power_select);
//   assert.ok(!ticket.get('location'));
// });

// test('should render a selectbox with bound options after type ahead for search', function(assert) {
//   location_one.set('tickets', [TD.idOne]);
//   this.model = ticket;
//   this.locationRepo = location_repo;
//   this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" repository=locationRepo searchMethod="findTicket"}}`);
//   let $component = this.$(`${COMPONENT}`);
//   clickTrigger();
//   run(() => { typeInSearch('a'); });
//   return waitFor().
//     then(() => {
//       assert.equal(this.$(`${DROPDOWN}`).length, 1);
//       assert.equal(this.$('.ember-power-select-options > li').length, 3);
//       assert.equal(this.$('li.ember-power-select-option:eq(0)').text().trim(), LD.storeName);
//       assert.equal(this.$('li.ember-power-select-option:eq(1)').text().trim(), LD.storeNameTwo);
//       assert.equal(this.$('li.ember-power-select-option:eq(2)').text().trim(), LD.storeNameThree);
//       assert.equal(this.$(`${PowerSelect}`).text().trim(), LD.storeName);
//     });
// });

test('should be able to select new location when one doesnt exist', function(assert) {
  this.model = ticket;
  this.locationRepo = location_repo;
  this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" repository=locationRepo searchMethod="findTicket"}}`);
  let $component = this.$(`${COMPONENT}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(`${DROPDOWN}`).length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${LD.storeName})`);
      assert.equal($component.find(`${PowerSelect}`).text().trim(), LD.storeName);
      assert.equal(ticket.get('location').get('id'), LD.idOne);
    });
});

test('should be able to select new location when ticket already has a location', function(assert) {
  location_one.set('tickets', [TD.idOne]);
  this.model = ticket;
  this.locationRepo = location_repo;
  this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" repository=locationRepo searchMethod="findTicket"}}`);
  let $component = this.$(`${COMPONENT}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(`${DROPDOWN}`).length, 1);
      assert.equal($('.ember-basic-dropdown-content').length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${LD.storeNameTwo})`);
      assert.equal($(`${DROPDOWN}`).length, 0);
      assert.equal($('.ember-basic-dropdown-content').length, 0);
      assert.equal($('.ember-power-select-options > li').length, 0);
      assert.equal($component.find(`${PowerSelect}`).text().trim(), LD.storeNameTwo);
      assert.equal(ticket.get('location').get('id'), LD.idTwo);
      assert.deepEqual(location_one.get('tickets'), []);
      assert.deepEqual(location_two.get('tickets'), [TD.idOne]);
    });
});

test('should not send off xhr within DEBOUNCE INTERVAL', function(assert) {
  var done = assert.async();
  this.model = ticket;
  this.locationRepo = location_repo;
  this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" repository=locationRepo searchMethod="findTicket"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  Ember.run.later(() => {
    assert.equal(Ember.$('.ember-power-select-options > li').length, 1);
    done();
  }, 50);//50ms used to allow repo to get hit, but within the DEBOUNCE INTERVAL, thus option length is not 3 yet
});
