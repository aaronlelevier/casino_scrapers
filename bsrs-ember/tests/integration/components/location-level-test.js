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
import generalPage from 'bsrs-ember/tests/pages/general';

let store, location_level, location_levels, location_level_repo, run = Ember.run;

moduleForComponent('location-level', 'integration: location-level test', {
  integration: true,
  setup() {
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:location-level']);
    const all_location_levels = LOCATION_LEVEL_FIXTURES.all_location_levels();
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
  },
  afterEach() {
    generalPage.removeContext(this);
  }
});

test('if save isRunning, btn is disabled', function(assert) {
  run(() => {
    this.model = store.push('location-level', {id: LLD.idOne});
  });
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.permissions = ['change_locationlevel'];
  this.saveIsRunning = { isRunning: 'disabled' };
  this.setName = function(name) { location_level.set('name', name); };
  this.render(hbs`{{location_level-general 
    model=model 
    saveTask=saveIsRunning 
    setName=setName
    permissions=permissions
  }}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});
