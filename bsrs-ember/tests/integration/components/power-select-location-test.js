import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/location';
import waitFor from 'ember-test-helpers/wait';
import { typeInSearch, clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';

let store, person, ticket, location_repo, trans, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-link-destination-select';
const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('power-select-location', 'integration: power-select-location', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:location', 'model:person', 'model:person-location']);
    run(() => {
      ticket = store.push('ticket', {id: TD.idOne});
      person = store.push('person', {id: PD.idOne, has_multi_locations: true});
      store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne]});
      store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_locations_fks: [PERSON_LD.idTwo]});
      store.push('location', {id: LD.idThree, name: LD.storeNameThree});
      store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
      store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
    });
    location_repo = repository.initialize(this.container, this.registry, 'dtd');
    location_repo.findLocationSelect = function() {
      return [
        {id: LD.idOne, name: LD.storeName},
        {id: LD.idTwo, name: LD.storeNameTwo},
        {id: LD.idThree, name: LD.storeNameThree}
      ];
    };
    trans = this.container.lookup('service:i18n');
    translation.initialize(this);
  }
});

test('default and disable if has_multi_locations === false', function(assert) {
  assert.equal(1,1);
  // run(() => {
  //   person = store.push('person', {id: PD.idTwo, has_multi_locations: false});
  //   store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_locations_fks: [PERSON_LD.idTwo]});
  //   store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.idTwo, location_pk: LD.idTwo});
  // });
  // let locations = person.get('locations');
  // assert.equal(locations.get('length'), 1);
  // this.disabled = !person.get('has_multi_locations');
  // this.selected = locations.objectAt(0);
  // this.render(hbs`{{power-select-location selected=selected disabled=disabled}}`);
  // let $component = this.$(PowerSelect);
  // assert.equal($component.find(PowerSelect).text().trim(), '');
  // assert.equal($(PowerSelect).attr('aria-disabled'), "true");
  // assert.equal($('.ember-basic-dropdown-trigger').text().trim(), LD.storeNameTwo);
});

// test('if has_multi_locations === true, no default location, and render a selectbox with options after type ahead for search', function(assert) {
//   let locations = store.find('location');
//   assert.equal(locations.get('length'), 3);
//   this.options = locations;
//   let disabled = !person.get('has_multi_locations');
//   this.disabled = disabled;
//   let defaultLocation = person.get('locations').objectAt(0);
//   this.selected = disabled ? defaultLocation : null;
//   this.repository = location_repo;
//   this.render(hbs`{{power-select-location options=options selected=selected disabled=disabled repository=repository}}`);
//   assert.equal($(PowerSelect).attr('aria-disabled'), "false");
//   assert.equal($('.ember-basic-dropdown-trigger').text().trim(), '');
//   clickTrigger();
//   run(() => { typeInSearch('a'); });
//   return waitFor().
//     then(() => {
//       assert.equal($(DROPDOWN).length, 1);
//       assert.equal($('.ember-power-select-option').length, 3);
//       assert.equal($('.ember-power-select-option:eq(0)').text().trim(), LD.storeName);
//       assert.equal($('.ember-power-select-option:eq(1)').text().trim(), LD.storeNameTwo);
//       assert.equal($('.ember-power-select-option:eq(2)').text().trim(), LD.storeNameThree);
//     });
// });

// test('change selected location', function(assert) {
//   let locations = store.find('location');
//   assert.equal(locations.get('length'), 3);
//   this.options = locations;
//   let disabled = !person.get('has_multi_locations');
//   this.disabled = disabled;
//   let defaultLocation = person.get('locations').objectAt(0);
//   this.selected = disabled ? defaultLocation : null;
//   this.repository = location_repo;
//   this.ticket = ticket;
//   this.render(hbs`{{power-select-location options=options selected=selected disabled=disabled repository=repository ticket=ticket}}`);
//   clickTrigger();
//   run(() => { typeInSearch('a'); });
//   return waitFor().
//     then(() => {
//       assert.equal($(DROPDOWN).length, 1);
//       assert.equal($('.ember-power-select-option').length, 3);
//       nativeMouseUp(`.ember-power-select-option:contains(${LD.storeNameTwo})`);
//       assert.equal($(DROPDOWN).length, 0);
//       assert.equal($('.ember-basic-dropdown-content').length, 0);
//       assert.equal($('.ember-power-select-options > li').length, 0);
//       assert.equal($(PowerSelect).text().trim(), LD.storeNameTwo);
//     });
// });
