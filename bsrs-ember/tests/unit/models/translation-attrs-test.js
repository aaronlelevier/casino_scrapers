import {test, module} from 'qunit';
import Translation from 'bsrs-ember/models/translation';
import TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/translation';


module('unit: translation attrs test');

test('copy attr "key" as "id" ', (assert) => {
    var translation = Translation.create({id: TRANSLATION_DEFAULTS.keyOne});

    assert.equal(translation.get('id'), translation.get('key'));
});

test('isNotDirty - test property', (assert) => {
    var translation = Translation.create({id: TRANSLATION_DEFAULTS.keyOne});

    assert.ok(translation.get('key'));
    assert.ok(translation.get('isNotDirty'));
});