import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location-level_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';

let store, location_level, all_location_levels, location_levels, location_level_repo, run = Ember.run;

moduleForComponent('location-level', 'integration: location-level test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:location-level']);
    all_location_levels = LOCATION_LEVEL_FIXTURES.all_location_levels();
    run(function() {
      all_location_levels.forEach((location_level) => { 
        location_level.children_fks = location_level.children || [];
        delete location_level.children;
        store.push('location-level', location_level); 
      });
    });
    location_level = store.find('location-level', LLD.idOne);
    location_levels = store.find('location-level');
    translation.initialize(this);
    var service = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(service, json);
    location_level_repo = repository.initialize(this.container, this.registry, 'location-level');
    location_level_repo.peek = (filter) => { return store.find('location-level', filter); };
  }
});

test('validation should enforce basic location name property', function(assert) {
  this.set('model', location_level);
  this.set('location_level_options', location_levels);
  this.setName = function(name) { location_level.set('name', name); };
  this.render(hbs`{{location-level-general model=model location_level_options=location_level_options setName=setName}}`);
  var $component = this.$('.t-location-level-name');
  let $validation = this.$('.t-name-validation-error');
  assert.ok($validation.is(':hidden'));
  assert.equal($component.val(), LLD.nameCompany);
  $component.val('').trigger('input');
  $validation = this.$('.t-name-validation-error');
  assert.ok($validation.is(':visible'));
  $component.val(LLD.nameRegion).trigger('input');
  $validation = this.$('.t-name-validation-error');
  assert.ok($validation.is(':hidden'));
});

test('if save isRunning, btn is disabled', function(assert) {
  run(() => {
    this.model = store.push('location-level', {id: LLD.idOne});
  });
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.setName = function(name) { location_level.set('name', name); };
  this.render(hbs`{{location_level-general model=model saveTask=saveIsRunning setName=setName}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});
