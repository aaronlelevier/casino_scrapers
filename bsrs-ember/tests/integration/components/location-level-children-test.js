import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';

let store, location_level, all_location_levels, location_levels, run = Ember.run;

moduleForComponent('location-level-children', 'integration: location-level-children test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location-level']);
        all_location_levels = LOCATION_LEVEL_FIXTURES.all_location_levels();
        all_location_levels.forEach((location_level) => { store.push('location-level', location_level); } );
        location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        location_levels = store.find('location-level');
    }
});

test('should render a selectbox with bound options and multiple set to true', function(assert) {
    this.set('model', location_level);
    this.set('options', location_levels);
    this.render(hbs`{{location-level-children model=model location_level=model options=options}}`);
    let $component = this.$('.t-location-level-location-level-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.option').length, 8);
});

test('selecting a location level will update the model when location level had no locations to begin with', function(assert) {
    let new_location_level = store.push('location-level', {id: UUID.value});
    this.set('model', new_location_level);
    this.set('options', location_levels);
    this.render(hbs`{{location-level-children model=model location_level=model options=options}}`);
    let $component = this.$('.t-location-level-location-level-select');
    assert.equal(new_location_level.get('children').get('length'), 0);
    assert.equal($component.find('div.item').length, 0);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.option:eq(0)').trigger('click').trigger('change'); });
    assert.equal($component.find('div.item').length, 1);
    assert.equal(new_location_level.get('children').get('length'), 1);
});

test('removing a child will remove from the children_fks in new template', function(assert) {
    let new_location_level = store.push('location-level', {id: UUID.value});
    this.set('model', new_location_level);
    this.set('options', location_levels);
    this.render(hbs`{{location-level-children model=model location_level=model options=options}}`);
    let $component = this.$('.t-location-level-location-level-select');
    assert.equal($component.find('div.option').length, 8);
    assert.equal($component.find('div.option:eq(0)').data('value'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal($component.find('div.option:eq(1)').data('value'), LOCATION_LEVEL_DEFAULTS.idThree);
    assert.ok(new_location_level.get('isNotDirty'));
    assert.ok(new_location_level.get('isNotDirtyOrRelatedNotDirty'));
    let children_fks = new_location_level.get('children_fks') || [];
    assert.equal(children_fks.length, 0);
    assert.equal(new_location_level.get('children').get('length'), 0);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.option:eq(0)').trigger('click').trigger('change'); });
    assert.equal($component.find('div.item').length, 1);
    assert.equal(new_location_level.get('children').get('length'), 1);
    assert.ok(new_location_level.get('isDirty'));
    assert.ok(new_location_level.get('isDirtyOrRelatedDirty'));
    assert.deepEqual(new_location_level.get('children_fks'), [LOCATION_LEVEL_DEFAULTS.idOne]);
    assert.equal(new_location_level.get('children').objectAt(0).get('id'), [LOCATION_LEVEL_DEFAULTS.idOne]);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.item:eq(0) a').trigger('click').trigger('change'); });
    assert.equal(new_location_level.get('children_fks').get('length'), 0);
    assert.ok(new_location_level.get('isNotDirty'));
    assert.ok(new_location_level.get('isNotDirtyOrRelatedNotDirty'));
});

