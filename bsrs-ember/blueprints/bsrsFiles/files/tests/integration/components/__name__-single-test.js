import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, model, trans;

moduleForComponent('<%= dasherizedModuleName %>-single', 'integration: <%= dasherizedModuleName %>-single test', {
  integration: true,
  setup() {
    page.setContext(this);
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:<%= dasherizedModuleName %>']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      model = store.push('<%= dasherizedModuleName %>', {
        id: <%= FirstCharacterModuleName %>D.idOne,
        <%= firstProperty %>: <%= FirstCharacterModuleName %>D.descOne,
      });
    });
    this.set('model', model);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('<%= firstProperty %> is required validation, cannot save w/o <%= firstProperty %>', function(assert) {
  run(function() {
    model = store.push('<%= dasherizedModuleName %>', {
      id: <%= FirstCharacterModuleName %>D.idTwo,
    });
  });
  this.set('model', model);
  this.render(hbs `{{<%= dasherizedModuleName %>s/<%= dasherizedModuleName %>-single model=model}}`);
  let $err = this.$('.t-ap-<%= firstProperty %>-validation-error');
  assert.notOk($err.is(':visible'));
  generalPage.save();
  $err = this.$('.t-ap-<%= firstProperty %>-validation-error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('validation.invalid') + ' ' + trans.t('<%= dasherizedModuleName %>.<%= firstProperty %>'));
  page.<%= firstPropertyCamel %>Fill('a');
  assert.notOk($err.is(':visible'));
});

test('<%= firstProperty %> is max length validation is 500', function(assert) {
  const descriptionChars = 501;
  const <%= firstProperty %> = Array(descriptionChars+1).join("a");
  run(function() {
    model = store.push('<%= dasherizedModuleName %>', {
      id: <%= FirstCharacterModuleName %>D.idTwo,
      <%= firstProperty %>: <%= firstProperty %>
    });
  });
  this.set('model', model);
  this.render(hbs `{{<%= dasherizedModuleName %>s/<%= dasherizedModuleName %>-single model=model}}`);
  let $err = this.$('.t-ap-<%= firstProperty %>-validation-error');
  assert.notOk($err.is(':visible'));
  generalPage.save();
  $err = this.$('.t-ap-<%= firstProperty %>-validation-error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('validation.invalid') + ' ' + trans.t('<%= dasherizedModuleName %>.<%= firstProperty %>'));
  page.<%= firstPropertyCamel %>Fill(Array(descriptionChars).join("a"));
  assert.notOk($err.is(':visible'));
});

test('header - shows detail if not model.new', function(assert) {
  this.render(hbs `{{<%= dasherizedModuleName %>s/<%= dasherizedModuleName %>-single model=model}}`);
  assert.equal(this.$('.t-<%= dasherizedModuleName %>-header').text().trim(), trans.t('<%= dasherizedModuleName %>.detail'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.set('model', model);
  this.render(hbs `{{<%= dasherizedModuleName %>s/<%= dasherizedModuleName %>-single model=model}}`);
  assert.equal(this.$('.t-<%= dasherizedModuleName %>-header').text().trim(), trans.t('<%= dasherizedModuleName %>.new'));
});

test('translation keys for labels', function(assert) {
  this.render(hbs `{{<%= dasherizedModuleName %>s/<%= dasherizedModuleName %>-single}}`);
  assert.equal(getLabelText('<%= firstProperty %>'), trans.t('<%= dasherizedModuleName %>.<%= firstProperty %>'));
  assert.equal(getLabelText('<%= secondProperty %>'), trans.t('<%= dasherizedModuleName %>.<%= secondProperty %>'));
});

test('placeholders', function(assert) {
  this.render(hbs `{{<%= dasherizedModuleName %>s/<%= dasherizedModuleName %>-single}}`);
  assert.equal(this.$('.t-ap-<%= firstProperty %>').get(0)['placeholder'], trans.t('<%= dasherizedModuleName %>.<%= firstProperty %>'));
});
