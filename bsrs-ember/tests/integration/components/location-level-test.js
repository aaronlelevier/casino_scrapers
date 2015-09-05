import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';

let store, location_level, all_location_levels, location_levels, location_level_repo;

moduleForComponent('location-level', 'integration: location-level test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location-level']);
        all_location_levels = LOCATION_LEVEL_FIXTURES.all_location_levels();
        all_location_levels.forEach((location_level) => { 
            location_level.children_fks = location_level.children || [];
            delete location_level.children;
            store.push('location-level', location_level); 
        });
        location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        location_levels = store.find('location-level');
        translation.initialize(this);
        var service = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(service, json);
        location_level_repo = repository.initialize(this.container, this.registry, 'location-level');
        location_level_repo.peek = (filter) => { return store.find('location-level', filter, ['id']); };
    }
});

test('should render component and prevent duplicate name entries', function(assert) {
    this.set('model', location_level);
    this.set('options', location_levels);
    this.render(hbs`{{location-level model=model}}`);
    var $component = this.$('.t-location-level-name');
    assert.equal($component.val(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    var $select = this.$('.t-location-level-location-level-select');
    assert.equal($select.find('div.option').length, 0);
    assert.equal($select.find('div.item').length, 7);
});

test('validation should prevent duplicate location level names', function(assert) {
    this.set('model', location_level);
    this.set('options', location_levels);
    this.render(hbs`{{location-level model=model}}`);
    var $component = this.$('.t-location-level-name');
    assert.equal($component.val(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    var $select = this.$('.t-location-level-location-level-select');
    var $input = this.$('.t-location-level-name');
    $input.val(LOCATION_LEVEL_DEFAULTS.nameRegion).trigger('change');  
    $component = this.$('.t-name-validation-error');
    assert.ok($component.is(':visible'));
    $input.val('admin.locationlevel.regions').trigger('change');  
    $component = this.$('.t-name-validation-error');
    assert.ok($component.is(':hidden'));
});
