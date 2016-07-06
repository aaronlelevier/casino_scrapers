import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, run = Ember.run;

moduleForComponent('validated-input', 'integration: validated-input test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person']);
  }
});

test('passing a type will change the form fields type', function(assert) {
  run(() => {
    this.set('model', store.push('person', {}));
  });
  this.render(hbs`
    {{validated-input
      model=model
      value=model.password
      placeholder=(t "admin.person.label.password")
      valuePath="password"
      className="form-control t-person-password"
      didValidate=didValidate
      class="t-person-password-validator"
      idZ="password"
      type="password"
    }}`);
  let $component = this.$('.t-person-password');
  assert.equal($component.attr('type'), 'password');
});
