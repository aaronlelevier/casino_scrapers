import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store;

moduleForComponent('input-read-only', 'integration: input-read-only', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:role']);
        translation.initialize(this);
    }
});

test('component has form-control-static bootstrap class', function(assert) {
    var role = store.push('role', {id: ROLE_DEFAULTS.id, role_type: ROLE_DEFAULTS.role_type_general});
    this.set('model', role);
    this.render(hbs`{{input-read-only model=model}}`);
    var $component = this.$('.form-control-static');
    assert.equal($component.length, 1);
    //assert.equal(this.$('.t-val'), 'General');
});
