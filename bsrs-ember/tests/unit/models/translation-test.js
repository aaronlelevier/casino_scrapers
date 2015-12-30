import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import Translation from 'bsrs-ember/models/translation';
import TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/translation';
import LOCALE_TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/locale-translation';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';


let store;

module('unit: translation', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:translation', 'model:locale-translation']);
    }
});

test('copy attr "key" as "id" ', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});

    assert.equal(translation.get('id'), translation.get('key'));
});

test('isNotDirty - test property', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});

    assert.ok(translation.get('key'));
    assert.ok(translation.get('isNotDirty'));
});

test('locales - push in actual object structure w/ 3 key:value', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    var locale_trans = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOne,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOne,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };

    var locale = store.push('locale-translation', locale_trans);

    assert.equal(translation.get('locales').get('length'), 1);
    assert.equal(translation.get('locales').objectAt(0).get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(translation.get('locales').objectAt(0).get('locale'), LOCALE_TRANSLATION_DEFAULTS.localeOne);
    assert.equal(translation.get('locales').objectAt(0).get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
    assert.deepEqual(translation.get('locale_ids'), [LOCALE_TRANSLATION_DEFAULTS.idOne]);

    store.remove('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);

    assert.equal(translation.get('locales').get('length'), 0);
});

test('dirty track related - when the first locale isDirtyOrRelatedDirty is true', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    var one = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOne,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOne,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };
    store.push('locale-translation', one);
    var two = {
        id: LOCALE_TRANSLATION_DEFAULTS.idTwo,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeTwo,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };
    store.push('locale-translation', two);
    var three = {
        id: LOCALE_TRANSLATION_DEFAULTS.idThree,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeThree,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };
    store.push('locale-translation', three);
    // confirm setUp
    assert.equal(translation.get('locales').get('length'), 3);
    assert.equal(translation.get('locales').objectAt(0).get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(translation.get('locales').objectAt(1).get('id'), LOCALE_TRANSLATION_DEFAULTS.idTwo);
    assert.equal(translation.get('locales').objectAt(2).get('id'), LOCALE_TRANSLATION_DEFAULTS.idThree);
    assert.equal(translation.get('locales').objectAt(0).get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
    assert.equal(translation.get('locales').objectAt(2).get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
    assert.ok(translation.get('isNotDirty'));
    assert.ok(translation.get('isNotDirtyOrRelatedNotDirty'));
    // change a Locale's 'translation', and trigger 'isDirtryOrRelatedDirty'
    var locale = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idTwo);

    locale.set('translation', LOCALE_TRANSLATION_DEFAULTS.translationTwo);

    assert.ok(locale.get('isDirty'));
    assert.ok(translation.get('isDirtyOrRelatedDirty'));

    locale.rollback();

    // translation.rollbackLocales(); // TODO: Fix this method

    assert.ok(translation.get('isNotDirty'));
    assert.ok(translation.get('isNotDirtyOrRelatedNotDirty'));
    var locale_two = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idTwo);
    var locale_three = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idThree);
    locale_two.set('translation', LOCALE_TRANSLATION_DEFAULTS.translationThree);
    locale_three.set('translation', LOCALE_TRANSLATION_DEFAULTS.translationThree);
    assert.ok(locale_two.get('isDirty'));
    assert.ok(locale_three.get('isDirty'));
    assert.ok(translation.get('isDirtyOrRelatedDirty'));


});

// NEXT: ``translation.saveRelated();`` - why is this not setting the 'model' and related 'models' back to clean??
test('saveRelated - will call "saveLocales"', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    var model = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOne,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOne,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };
    var locale_trans = store.push('locale-translation', model);
    locale_trans.set('translation', LOCALE_TRANSLATION_DEFAULTS.translationTwo);
    assert.ok(locale_trans.get('isDirty'));
    assert.ok(translation.get('isDirtyOrRelatedDirty'));

    translation.saveRelated();

    assert.ok(locale_trans.get('isNotDirty'));
    assert.ok(translation.get('isNotDirty'));
    assert.ok(translation.get('isNotDirtyOrRelatedNotDirty'));
    var ret = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(ret.get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationTwo);
});

test('rollbackLocales', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    var model = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOne,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOne,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };
    var locale_trans = store.push('locale-translation', model);
    locale_trans.set('translation', LOCALE_TRANSLATION_DEFAULTS.translationTwo);
    assert.ok(locale_trans.get('isDirty'));
    assert.ok(translation.get('isDirtyOrRelatedDirty'));

    translation.rollbackLocales();

    assert.ok(locale_trans.get('isNotDirty'));
    assert.ok(translation.get('isNotDirtyOrRelatedNotDirty'));
    var ret = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(ret.get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
});
