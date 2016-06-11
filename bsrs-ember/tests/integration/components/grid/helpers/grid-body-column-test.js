import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

const TRANSLATION_KEY = 'admin.person.one';
const TRANSLATION_VALUE = 'Person';
const FakeModel = Ember.Object.extend({
    nice_hat: Ember.computed('hat', function() {
        return `${this.get('hat')} !!`;
    })
});

moduleForComponent('grid/helpers/grid-body-column', 'integration: grid-body-column', {
    integration: true,
    setup() {
        translation.initialize(this);
        const trans = this.container.lookup('service:i18n');
        loadTranslations(trans, translations.generate('en'));
        translation.initialize(this);
        this.set('item', FakeModel.create({hat: TRANSLATION_KEY}));
    }
});

test('field will be the actual value shown in the td element when isTranslatable is not present', function(assert) {
    this.set('column', {
        field: 'hat'
    });
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.equal($component.text().trim(), TRANSLATION_KEY);
});

test('the value will be translated when isTranslatable is true', function(assert) {
    this.set('column', {
        field: 'hat',
        isTranslatable: true
    });
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.equal($component.text().trim(), TRANSLATION_VALUE);
});

test('the value will not be translated when isTranslatable is false', function(assert) {
    this.set('column', {
        field: 'hat',
        isTranslatable: false
    });
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.equal($component.text().trim(), TRANSLATION_KEY);
});

test('any classNames present are applied to the component', function(assert) {
    this.set('column', {
        field: 'hat',
        classNames: ['one', 'two', 'three']
    });
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.ok($component.hasClass('one'));
    assert.ok($component.hasClass('two'));
    assert.ok($component.hasClass('three'));
});

test('noun is used to set a developer friendly class for the content', function(assert) {
    this.set('column', {
        field: 'hat'
    });
    this.set('noun', 'zap');
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.ok($component.hasClass('t-zap-hat'));
});

test('developer friendly class replaces any dot with a dash', function(assert) {
    this.set('column', {
        field: 'hat.cat.wat'
    });
    this.set('noun', 'zap');
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.ok($component.hasClass('t-zap-hat-cat-wat'));
});

test('the entire template will be replaced when a custom templateName is defined', function(assert) {
    this.registry.register('template:components/zap-zap', hbs`<span>AXE {{get item column.field}}</span>`);
    this.set('column', {
        field: 'hat',
        templateName: 'zap-zap'
    });
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.equal($component.text().trim(), `AXE ${TRANSLATION_KEY}`);
});

test('htmlbars will blow up when component is not found', function(assert) {
    assert.expect(1);
    this.set('column', {
        field: 'hat',
        templateName: 'abc-abc'
    });
    try {
        this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    } catch(e) {
        assert.ok(e.message.indexOf('Could not find component') > -1);
    }
});

test('formattedField will be the actual value shown in the td element when present', function(assert) {
    this.set('column', {
        field: 'hat',
        formattedField: 'nice_hat'
    });
    this.render(hbs`{{grid/helpers/grid-body-column tagName='td' noun=noun item=item column=column}}`);
    let $component = this.$('td');
    assert.equal($component.length, 1);
    assert.equal($component.text().trim(), `${TRANSLATION_KEY} !!`);
});
