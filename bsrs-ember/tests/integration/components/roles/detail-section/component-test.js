import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import RD from 'bsrs-ember/vendor/defaults/role';

let store, role;

moduleForComponent('roles/detail-section', 'Integration | Component | roles/detail section', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:role']);
    role = store.push('role', {id: RD.idOne, name: RD.nameOne});
  }
});

test('it renders with correct fields', function(assert) {
  this.model = role;
  this.render(hbs`{{roles/detail-section model=model}}`);
  assert.equal(this.$('.t-role-name').val(), RD.nameOne);
  // TODO: llevel / role_type
});
