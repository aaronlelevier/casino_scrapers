import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import waitFor from 'ember-test-helpers/wait';
import repository from 'bsrs-ember/tests/helpers/repository';
import LCD from 'bsrs-ember/vendor/defaults/location-children';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LD from 'bsrs-ember/vendor/defaults/location';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

var store, locationz, location_repo, m2m, m2m_two, trans, run = Ember.run;

const PowerSelect = '.ember-power-select-trigger > .ember-power-select-multiple-options';
const COMPONENT = '.t-location-children-select';
const DROPDOWN = '.ember-power-select-dropdown';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('location-children-select', 'integration: location-children-select test', {
    integration: true,
    setup() {
        trans = this.container.lookup('service:i18n');
        loadTranslations(trans, translations.generate('en'));
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-children', 'model:location-level']);
        run(function() {
            m2m = store.push('location-children', {id: LCD.idOne, location_pk: LD.idOne, children_pk: LD.idTwo});
            m2m_two = store.push('location-children', {id: LCD.idTwo, location_pk: LD.idOne, children_pk: LD.idThree});
            locationz = store.push('location', {id: LD.idOne, name: LD.storeName, location_children_fks: [LCD.idOne, LCD.idTwo]});
            store.push('location', {id: LD.idTwo, name: 'wat', location_level: LLD.idOne});
            store.push('location', {id: LD.idThree, name: 'bat', location_level: LLD.idOne});
            store.push('location', {id: LD.unusedId, name: 'wit', location_level: LLD.idTwo});
            store.push('location-level', {id: LLD.idOne});
            store.push('location-level', {id: LLD.idTwo});
        });
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.findLocationChildren = function() {
            return store.find('location', LD.idOne).get('children');
        };
    }
});

test('should render a selectbox when with options selected (initial state of children select)', function(assert) {
    run(function() {
        store.clear('location-children');
    });
    let location_children_options = Ember.A([]);
    this.set('model', locationz);
    this.repository = location_repo;
    this.render(hbs`{{db-fetch-multi-select model=model isDisabled=isDisabled multiAttr="children" multiAttrIds="children_ids" selectedAttr=model.children className="t-location-child-select" displayName="name" add_func="add_child" remove_func="remove_child" repository=repository searchMethod="findLocationChildren" extra_params=extra_params}}`);
    let $component = this.$(COMPONENT);
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($(OPTION).text().trim(), GLOBALMSG.power_search);
    assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let location_children_options = store.find('location');
    this.set('model', locationz);
    this.repository = location_repo;
    this.render(hbs`{{db-fetch-multi-select model=model isDisabled=isDisabled multiAttr="children" multiAttrIds="children_ids" selectedAttr=model.children className="t-location-child-select" displayName="name" add_func="add_child" remove_func="remove_child" repository=repository searchMethod="findLocationChildren" extra_params=extra_params}}`);
    let $component = this.$(COMPONENT);
    assert.equal(locationz.get('children').get('length'), 2);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(DROPDOWN).length, 1);
            assert.equal($('.ember-power-select-options > li').length, 2);
            assert.equal($(`${OPTION}:eq(0)`).text().trim(), 'wat');
            assert.equal($(`${OPTION}:eq(1)`).text().trim(), 'bat');
            assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
            assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains('wat')`));
            assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains('bat')`));
        });
});
