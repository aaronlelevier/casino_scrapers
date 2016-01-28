import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import repository from 'bsrs-ember/tests/helpers/repository';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import waitFor from 'ember-test-helpers/wait';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import CD from 'bsrs-ember/vendor/defaults/category';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import RD from 'bsrs-ember/vendor/defaults/role';
import ROLE_CD from 'bsrs-ember/vendor/defaults/role-category';

let store, m2m, m2m_two, role, category_one, category_two, category_three, run = Ember.run, category_repo;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-role-category-select';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('role-category-select', 'integration: amk role-category-select test', {
    integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:role', 'model:category', 'model:role-category']);
        let service = this.container.lookup('service:i18n');
        loadTranslations(service, translations.generate('en'));
        run(function() {
            m2m = store.push('role-category', {id: ROLE_CD.idOne, role_fk: RD.idOne, category_fk: CD.idOne});
            m2m_two = store.push('role-category', {id: ROLE_CD.idTwo, role_fk: RD.idOne, category_fk: CD.idTwo});
            role = store.push('role', {id: RD.idOne, role_category_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
            category_one = store.push('category', {id: CD.idOne, name: CD.nameOne});
            category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo});
            category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree});
        });
        category_repo = repository.initialize(this.container, this.registry, 'category');
        category_repo.findCategoryChildren = function() {
            return store.find('category');
        };
    }
});

test('should render a selectbox when with no options (initial state)', function(assert) {
    let categories_children = Ember.A([]);
    this.set('role', role);
    this.render(hbs`{{roles/role-category-select role=role}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($(`${OPTION}`).text(), GLOBALMSG.power_search);
    assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 2);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let categories_children = store.find('category');
    this.set('role', role);
    this.render(hbs`{{roles/role-category-select role=role}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            assert.equal($(`${OPTION}:eq(0)`).text().trim(), CD.nameOne);
            assert.equal($(`${OPTION}:eq(1)`).text().trim(), CD.nameTwo);
            assert.equal($(`${OPTION}:eq(2)`).text().trim(), CD.nameThree);
            assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
            assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${CD.nameOne})`));
        });
});
