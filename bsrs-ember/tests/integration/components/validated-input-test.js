import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';

moduleForComponent('validated-input', 'integration: validated-input test', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:person', 'service:i18n']);
    translation.initialize(this);
    this.trans = this.container.lookup('service:i18n');
  },
  afterEach() {
    delete this.store;
    delete this.trans;
  }
});

test('passing a type will change the form fields type', function(assert) {
  run(() => {
    this.set('model', this.store.push('person', {}));
  });
  this.render(hbs`
    {{validated-input
      model=model
      placeholder=(t 'admin.person.label.password')
      valuePath='password'
      className='t-person-password'
      class='t-person-password-validator'
      type='password'
      maxlength=2
    }}`);
  let $component = this.$('.t-person-password');
  assert.equal($component.attr('type'), 'password');
  assert.equal($component.attr('placeholder'), this.trans.t('admin.person.label.password'));
  assert.equal($component.attr('class'), 'form-control t-person-password ember-text-field ember-view');
  assert.equal($component.attr('id'), 'password');
  assert.equal($component.attr('maxlength'), '2');
  assert.equal($component.val(), '');
  $component.val('wat');
  assert.equal($component.val(), 'wat');
});

test('readonly default is false, so input has no readonly attribute', function(assert) {
  this.set('model', Ember.Object.create({name: '', isReadOnly: false}));
  this.render(hbs`
    {{validated-input
      model=model
      valuePath='name'
      readonly=model.isReadOnly
    }}`);
  let el = this.$('input')[0];
  assert.equal(el.readOnly, false, 'readonly attribute not present on input');
});

test('when readonly is true, input has a readonly attribute', function(assert) {
  this.set('model', Ember.Object.create({name: '', isReadOnly: true}));
  this.render(hbs`
    {{validated-input
      model=model
      valuePath='name'
      readonly=model.isReadOnly
    }}`);
  let el = this.$('input')[0];
  assert.equal(el.readOnly, true, 'readonly attribute is present on input');
});

test('readonly default is false, so textarea has no readonly attribute', function(assert) {
  this.set('model', Ember.Object.create({name: '', isReadOnly: false}));
  this.render(hbs`
    {{validated-input
      model=model
      valuePath='name'
      textarea=true
      readonly=model.isReadOnly
    }}`);
  let el = this.$('textarea')[0];
  assert.equal(el.readOnly, false, 'readonly attribute not present on textarea');
});

test('when readonly is true, textarea has a readonly attribute', function(assert) {
  this.set('model', Ember.Object.create({name: '', isReadOnly: true}));
  this.render(hbs`
    {{validated-input
      model=model
      valuePath='name'
      textarea=true
      readonly=model.isReadOnly
    }}`);
  let el = this.$('textarea')[0];
  assert.equal(el.readOnly, true, 'readonly attribute is present on textarea');
});

