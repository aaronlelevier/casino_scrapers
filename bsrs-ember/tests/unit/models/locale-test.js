import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import LOCALE_DEFAULTS from 'bsrs-ember/vendor/defaults/locale';
import LOCALE_FIXTURES from 'bsrs-ember/vendor/locale_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, locale;

module('unit: locale', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:locale']);
    }
});

test('test generic attrs on the model', (assert) => {
    let data = LOCALE_FIXTURES.get();
    locale = store.push('locale', data);
    assert.equal(locale.get('id'), LOCALE_DEFAULTS.idOne);
    assert.equal(locale.get('native_name'), LOCALE_DEFAULTS.native_nameOne);
    assert.equal(locale.get('locale'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('name'), LOCALE_DEFAULTS.nameOne);
    assert.equal(locale.get('presentation_name'), LOCALE_DEFAULTS.presentation_nameOne);
    assert.equal(locale.get('rtl'), LOCALE_DEFAULTS.rtlOne);
});
