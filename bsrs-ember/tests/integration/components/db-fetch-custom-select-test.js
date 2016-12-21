import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import { typeInSearch, clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
// import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import waitFor from 'ember-test-helpers/wait';

let store, dtd, link_one, dtd_two, run = Ember.run, dtd_repo;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const LINK = PERSON_DEFAULTS.defaults();

moduleForComponent('db-fetch-custom-select', 'integration: db-fetch-custom-select test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:dtd', 'model:link']);
    run(() => {
      dtd = store.push('dtd', {id: DTD.idOne, destination_links: [LINK.idOne]});
      dtd_two = store.push('dtd', {id: DTD.idTwo});
      link_one = store.push('link', {id: LINK.idOne, text: LINK.textOne, destination_fk: DTD.idOne});
    });
    dtd_repo = repository.initialize(this.container, this.registry, 'dtd');
    dtd_repo.findDTD = function() {
      return [
        {id: DTD.idOne, key: DTD.keyOne, description: DTD.descriptionOne},
        {id: DTD.idTwo, key: DTD.keyTwo, description: DTD.descriptionTwo},
        {id: DTD.unusedId, key: DTD.keyThree, description: DTD.descriptionThree}
      ];
    };
  }
});

// test('should render a selectbox when dtd options are empty (initial state of power select)', function(assert) {
//   this.link = link_one;
//   this.repository = dtd_repo;
//   this.render(hbs`{{db-fetch-custom-select model=link selectedAttr=model.destination className="t-link-destination-select" componentName="dtds/dtd-key-desc" change_func="change_destination" remove_func="remove_destination" repository=repository searchMethod="findDTD"}}`);
//   assert.equal(1,1);
//   clickTrigger();
//   assert.equal($(DROPDOWN).length, 1);
// });

// test('should render a selectbox with bound options after type ahead for search', function(assert) {
//   assert.equal(link_one.get('destination').get('id'), dtd.get('id'));
//   this.model = link_one;
//   this.repository = dtd_repo;
//   this.render(hbs`{{db-fetch-custom-select model=model selectedAttr=model.destination className="t-link-destination-select" componentName="dtds/dtd-key-desc" change_func="change_destination" remove_func="remove_destination" repository=repository searchMethod="findDTD"}}`);
//   clickTrigger();
//   run(() => { typeInSearch('a'); });
//   return waitFor().
//     then(() => {
//       assert.equal($(DROPDOWN).length, 1);
//       assert.equal($('.ember-power-select-option').length, 3);
//       assert.equal($('.t-dtd-key-select-option:eq(1)').text().trim(), DTD.keyOne);
//       assert.equal($('.t-dtd-desc-select-option:eq(1)').text().trim(), DTD.descriptionOne);
//       assert.equal($('.t-dtd-key-select-option:eq(2)').text().trim(), DTD.keyTwo);
//       assert.equal($('.t-dtd-desc-select-option:eq(2)').text().trim(), DTD.descriptionTwo);
//     });
// });

test('should be able to select new destination when one doesnt exist', function(assert) {
  dtd.set('destination_links', []);
  assert.equal(link_one.get('destination.id'), undefined);
  this.model = link_one;
  this.set('repository', dtd_repo);
  this.render(hbs`{{db-fetch-custom-select model=model selectedAttr=model.destination className="t-link-destination-select" componentName="dtds/dtd-key-desc" selectedComponent="dtds/dtd-key-desc-selected" change_func="change_destination" remove_func="remove_destination" repository=repository searchMethod="findDTD"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal(Ember.$(DROPDOWN).length, 1);
      assert.equal(Ember.$('.ember-power-select-options > li').length, 3);
      assert.equal(link_one.get('destination.id'), undefined);
      nativeMouseUp(`.ember-power-select-option:contains(${DTD.keyOne})`);
      assert.equal(link_one.get('destination.id'), DTD.idOne);
      assert.equal(Ember.$(PowerSelect).text().trim(), `${DTD.keyOne} ${DTD.descriptionOne}`);
    });
});

test('should be able to select same dtd when dtd already has a dtd', function(assert) {
  this.model = link_one;
  this.set('repository', dtd_repo);
  this.render(hbs`{{db-fetch-custom-select model=model selectedAttr=model.destination className="t-link-destination-select" componentName="dtds/dtd-key-desc" selectedComponent="dtds/dtd-key-desc-selected" change_func="change_destination" remove_func="remove_destination" repository=repository searchMethod="findDTD"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal(Ember.$(DROPDOWN).length, 1);
      assert.equal(Ember.$('.ember-basic-dropdown-content').length, 1);
      assert.equal(Ember.$('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${DTD.keyOne})`);
      assert.equal(Ember.$(DROPDOWN).length, 0);
      assert.equal(Ember.$('.ember-basic-dropdown-content').length, 0);
      assert.equal(Ember.$('.ember-power-select-options > li').length, 0);
      assert.equal(Ember.$(PowerSelect).text().trim(), `${DTD.keyOne} ${DTD.descriptionOne}`);
      assert.equal(link_one.get('destination').get('id'), DTD.idOne);
      assert.deepEqual(dtd.get('destination_links'), [LINK.idOne]);
    });
});

test('should be able to select diff dtd when dtd already has a dtd', function(assert) {
  this.model = link_one;
  this.set('repository', dtd_repo);
  this.render(hbs`{{db-fetch-custom-select model=model selectedAttr=model.destination className="t-link-destination-select" componentName="dtds/dtd-key-desc" selectedComponent="dtds/dtd-key-desc-selected" change_func="change_destination" remove_func="remove_destination" repository=repository searchMethod="findDTD"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal(Ember.$(DROPDOWN).length, 1);
      assert.equal(Ember.$('.ember-basic-dropdown-content').length, 1);
      assert.equal(Ember.$('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${DTD.keyTwo})`);
      assert.equal(Ember.$(DROPDOWN).length, 0);
      assert.equal(Ember.$('.ember-basic-dropdown-content').length, 0);
      assert.equal(Ember.$('.ember-power-select-options > li').length, 0);
      assert.equal(Ember.$(PowerSelect).text().trim(), `${DTD.keyTwo} ${DTD.descriptionTwo}`);
      assert.equal(link_one.get('destination').get('id'), DTD.idTwo);
      assert.deepEqual(dtd_two.get('destination_links'), [LINK.idOne]);
      assert.deepEqual(dtd.get('destination_links'), []);
      assert.equal(link_one.get('destination_fk'), DTD.idOne);
    });
});

test('should not send off xhr within DEBOUNCE INTERVAL', function(assert) {
  var done = assert.async();
  this.model = link_one;
  this.set('repository', dtd_repo);
  this.render(hbs`{{db-fetch-custom-select model=model selectedAttr=model.destination className="t-link-destination-select" componentName="dtds/dtd-key-desc" selectedComponent="dtds/dtd-key-desc-selected" change_func="change_destination" remove_func="remove_destination" repository=repository searchMethod="findDTD"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  Ember.run.later(() => {
    assert.equal(Ember.$('.ember-power-select-options > li').length, 1);
    done();
  }, 150);//50ms used to allow repo to get hit, but within the DEBOUNCE INTERVAL, thus option length is not 3 yet
});
