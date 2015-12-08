import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import Translation from 'bsrs-ember/models/translation';
import TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/translation';
import LOCALE_TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/locale-translation';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';


let store;

module('unit: translation attrs test', {
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

test('locales - property returns associated array or empty array', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});

    assert.equal(translation.get('locale_fks').get('length'), 0);

    store.push('locale-translation', {id: 8});
    translation.set('locale_fks', [8]);
    assert.equal(translation.get('locales').get('length'), 1);

    store.push('locale-translation', {id: 9});
    assert.equal(translation.get('locales').get('length'), 1);

    store.push('locale-translation', {id: 7});
    translation.set('locale_fks', [8, 7]);
    assert.equal(translation.get('locales').get('length'), 2);
});

test('locales - push in actual object structure w/ 3 key:value', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    var locale_trans = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOne,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOne,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
    };

    store.push('locale-translation', locale_trans);

    translation.set('locale_fks', [LOCALE_TRANSLATION_DEFAULTS.idOne]);
    assert.equal(translation.get('locales').get('length'), 1);
    assert.equal(translation.get('locales').objectAt(0).get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(translation.get('locales').objectAt(0).get('locale'), LOCALE_TRANSLATION_DEFAULTS.localeOne);
    assert.equal(translation.get('locales').objectAt(0).get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
});

test('locale_ids - are computed based off of "locales" ', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});

    assert.equal(translation.get('locale_fks').get('length'), 0);
    store.push('locale-translation', {id: 8});
    translation.set('locale_fks', [8]);
    assert.equal(translation.get('locale_ids').get('length'), 1);
});

test('add_locale', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    store.push('locale-translation', {id: LOCALE_TRANSLATION_DEFAULTS.idOne});

    translation.add_locale(LOCALE_TRANSLATION_DEFAULTS.idOne);

    assert.equal(translation.get('locales').objectAt(0).get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
});

test('remove_locale', (assert) => {
    var translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    store.push('locale-translation', {id: LOCALE_TRANSLATION_DEFAULTS.idOne});
    translation.add_locale(LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(translation.get('locales').get('length'), 1);

    translation.remove_locale(LOCALE_TRANSLATION_DEFAULTS.idOne);

    assert.equal(translation.get('locales').get('length'), 0);
});

