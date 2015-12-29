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

    store.push('locale-translation', locale_trans);

    assert.equal(translation.get('locales').get('length'), 1);
    assert.equal(translation.get('locales').objectAt(0).get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(translation.get('locales').objectAt(0).get('locale'), LOCALE_TRANSLATION_DEFAULTS.localeOne);
    assert.equal(translation.get('locales').objectAt(0).get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
    assert.deepEqual(translation.get('locale_ids'), [LOCALE_TRANSLATION_DEFAULTS.idOne]);
});

test('dirty track related', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    var model = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOne,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOne,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };
    var locale_trans = store.push('locale-translation', model);
    assert.equal(translation.get('locales').objectAt(0).get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);

    locale_trans.set('translation', LOCALE_TRANSLATION_DEFAULTS.translationTwo);

    assert.ok(locale_trans.get('isDirty'));
    assert.ok(translation.get('isDirtyOrRelatedDirty'));
});

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

    translation.saveRelated();

    assert.notOk(locale_trans.get('isDirty'));
    assert.notOk(translation.get('isDirty'));
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

    translation.rollbackLocales();

    assert.notOk(locale_trans.get('isDirty'));
    assert.notOk(translation.get('isDirty'));
    var ret = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(ret.get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
});
