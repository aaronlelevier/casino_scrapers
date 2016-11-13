import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/person';

let store, person;

moduleForComponent('photo-avatar', 'Integration | Component | photo avatar', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:attachment']);
    person = store.push('person', {id: PD.idOne, photo_fk: 1});
    store.push('attachment', {id: 1, image_thumbnail: 'wat.jpg', people: [PD.idOne]});
  }
});

test('it renders with person photo', function(assert) {
  this.item = person;
  this.render(hbs`{{photo-avatar item=item}}`);
  assert.ok(this.$('[data-test-id="user-avatar"]').css('background-image').indexOf('wat.jpg'));
});

test('if no photo renders fa-icon', function(assert) {
  this.item = {id: 1};
  this.render(hbs`{{photo-avatar item=item}}`);
  assert.equal(this.$('[data-test-id="user-avatar"]').css('background-image').indexOf('wat.jpg'), -1);
  assert.ok(this.$('[data-test-id="user-avatar"]').hasClass('empty'));
});
