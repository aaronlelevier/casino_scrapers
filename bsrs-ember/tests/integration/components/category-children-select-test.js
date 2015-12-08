import Ember from 'ember';
import trim from 'bsrs-ember/utilities/trim';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

let store, category, category_two, category_three, category_repo, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-category-children-select';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('category-children-select', 'integration: category-children-select-test', {
    integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:category']);
        const service = this.container.lookup('service:i18n');
        loadTranslations(service, translations.generate('en'));
        category = store.push('category', {id: CD.idOne, name: CD.nameOne, children_fks: [CD.idTwo]});
        category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo, children_fks: []});
        category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree, children_fks: []});
        category_repo = repository.initialize(this.container, this.registry, 'category');
        category_repo.findCategoryChildren = function() { 
            return store.find('category'); 
        };
    }
});

test('should render a selectbox when with options selected (initial state)', function(assert) {
    let categories_children = Ember.A([]);
    this.set('category', category_two);
    this.set('categories_children', categories_children);
    this.set('search', '');
    this.render(hbs`{{category-children-select category=category search=search categories_children=categories_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($(`${OPTION}`).text(), GLOBALMSG.power_search);
    assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let categories_children = store.find('category');
    this.set('category', category);
    this.set('categories_children', categories_children);
    this.set('search', 'x');
    this.render(hbs`{{category-children-select category=category search=search categories_children=categories_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($(`${OPTION}:eq(0)`).text().trim(), CD.nameOne);
    assert.equal($(`${OPTION}:eq(1)`).text().trim(), CD.nameTwo);
    assert.equal($(`${OPTION}:eq(2)`).text().trim(), CD.nameThree);
    assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 1);
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
    this.set('category', category);
    this.set('categories_children', categories_children);
    this.set('search', 'abcde');
    this.render(hbs`{{category-children-select category=category search=search categories_children=categories_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($(`${OPTION}:eq(0)`).text().trim(), 'a');
    assert.equal($(`${OPTION}:eq(1)`).text().trim(), 'c');
    assert.equal($(`${OPTION}:eq(2)`).text().trim(), 'e');
    assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 1);
    assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:eq(0)`).text().indexOf(CD.nameTwo) > -1);
});

//// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
////     var done = assert.async();
////     this.set('model', category);
////     this.set('search', undefined);
////     this.set('categories_children', store.find('category'));
////     this.render(hbs`{{category-children-select search=search category=model categories_children=categories_children}}`);
////     this.$('div.selectize-input input').val('x').trigger('keyup');
////     setTimeout(() => {
////         assert.equal(this.get('search'), undefined);
////         setTimeout(() => {
////             assert.equal(this.get('search'), 'x');
////             done();
////         }, 11);
////     }, 290);
//// });

