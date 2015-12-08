import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import CD from 'bsrs-ember/vendor/defaults/category';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import RD from 'bsrs-ember/vendor/defaults/role';
import ROLE_CD from 'bsrs-ember/vendor/defaults/role-category';

let store, m2m, m2m_two, role, category_one, category_two, category_three, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-role-category-select';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('role-category-select', 'integration: role-category-select test', {
    integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:role', 'model:category', 'model:role-category']);
        let service = this.container.lookup('service:i18n');
        loadTranslations(service, translations.generate('en'));
        m2m = store.push('role-category', {id: ROLE_CD.idOne, role_fk: RD.idOne, category_fk: CD.idOne});
        m2m_two = store.push('role-category', {id: ROLE_CD.idTwo, role_fk: RD.idOne, category_fk: CD.idTwo});
        role = store.push('role', {id: RD.idOne, role_category_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
        category_one = store.push('category', {id: CD.idOne, name: CD.nameOne});
        category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo});
        category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree});
    }
});

test('should render a selectbox when with no options (initial state)', function(assert) {
    let categories_children = Ember.A([]);
    this.set('role', role);
    this.set('categories_children', categories_children);
    this.set('search', '');
    this.render(hbs`{{role-category-select role=role search=search categories_children=categories_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($(`${OPTION}`).text(), GLOBALMSG.power_search);
    assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 2);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let categories_children = store.find('category');
    this.set('role', role);
    this.set('categories_children', categories_children);
    this.set('search', 'x');
    this.render(hbs`{{role-category-select role=role search=search categories_children=categories_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($(`${OPTION}:eq(0)`).text().trim(), CD.nameOne);
    assert.equal($(`${OPTION}:eq(1)`).text().trim(), CD.nameTwo);
    assert.equal($(`${OPTION}:eq(2)`).text().trim(), CD.nameThree);
    assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
    assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${CD.nameOne})`));
});

test('should render power select with bound options after type ahead for search with search params for category children', function(assert) {
    let one = store.push('category', {id: 'abcde4', name: 'a'});
    let two = store.push('category', {id: 'abcde5', name: 'c'});
    let three = store.push('category', {id: 'abcde6', name: 'e'});
    let categories_children = Ember.ArrayProxy.extend({
        content: Ember.computed(function() {
            return Ember.A(this.get('source'));
        })
    }).create({
        source: [one, two, three]
    });
    this.set('role', role);
    this.set('categories_children', categories_children);
    this.set('search', 'abcde');
    this.render(hbs`{{role-category-select role=role search=search categories_children=categories_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($(`${OPTION}:eq(0)`).text().trim(), 'a');
    assert.equal($(`${OPTION}:eq(1)`).text().trim(), 'c');
    assert.equal($(`${OPTION}:eq(2)`).text().trim(), 'e');
    assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
    assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:eq(0)`).text().indexOf(CD.nameOne) > -1);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     this.set('category', category);
//     this.set('search', undefined);
//     this.set('model', category.get('locations'));
//     this.render(hbs`{{category-locations-select model=model category=category search=search}}`);
//     let $component = this.$('.t-category-locations-select');
//     this.$('div.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search'), 'x');
//             done();
//         }, 15);
//     }, 290);
// });


