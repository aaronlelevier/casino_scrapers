import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import generalPage from 'bsrs-ember/tests/pages/general';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PFD from 'bsrs-ember/vendor/defaults/profile-filter';
import page from 'bsrs-ember/tests/pages/profile';

var store, model, run = Ember.run, trans;

moduleForComponent('profile-single', 'integration: profile-single test', {
  integration: true,
  setup() {
    page.setContext(this);
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:profile']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      model = store.push('profile', {
        id: PD.idOne,
        description: PD.descOne,
      });
    });
    this.set('model', model);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('filter section and add filter button - onClick of button, a related filter is added to the profile', function(assert) {
  this.set('model', model);
  this.render(hbs `{{profiles/profile-single model=model}}`);
  assert.equal(page.filterSectionTitleText, trans.t('admin.section.title.filter'));
  assert.equal(page.addFilterBtnText, trans.t('admin.btn.add_filter'));
  assert.equal(model.get('pfs').get('length'), 0);
  assert.equal(this.$('.t-filter-selector').length, 0);
  page.addFilterBtnClick();
  assert.equal(model.get('pfs').get('length'), 1);
  assert.equal(this.$('.t-filter-selector').length, 1);
  // pfilter added to model has default properties
  assert.equal(model.get('pfs').objectAt(0).get('context'), PFD.contextOne);
  assert.equal(model.get('pfs').objectAt(0).get('field'), PFD.fieldOne);
});

test('remove filter', function(assert) {
  this.set('model', model);
  this.render(hbs `{{profiles/profile-single model=model}}`);
  assert.equal(model.get('pfs').get('length'), 0);
  assert.equal(this.$('.t-filter-selector').length, 0);
  page.addFilterBtnClick();
  assert.equal(model.get('pfs').get('length'), 1);
  assert.equal(this.$('.t-filter-selector').length, 1);
  page.removeFilterBtnClick();
  assert.equal(model.get('pfs').get('length'), 0);
  assert.equal(this.$('.t-filter-selector').length, 0);
});

test('description is required validation, cannot save w/o description', function(assert) {
  // like new template
  run(() => {
    model = store.push('profile', {
      id: PD.idTwo,
    });
  });
  this.set('model', model);
  this.render(hbs `{{profiles/profile-single model=model}}`);
  let $err = this.$('.t-ap-description-validation-error');
  assert.notOk($err.is(':visible'));
  generalPage.save();
  $err = this.$('.t-ap-description-validation-error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.profile.description'));
  page.descFill('a');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.profile.description.min_max'));
  page.descFill('a'.repeat(6));
  assert.notOk($err.is(':visible'));
  // like detail
  page.descFill('a'.repeat(501));
  $err = this.$('.t-ap-description-validation-error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.profile.description.min_max'));
});

test('header - shows detail if not model.new', function(assert) {
  this.render(hbs `{{profiles/profile-single model=model}}`);
  assert.equal(this.$('.t-profile-header').text().trim(), trans.t('admin.profile.detail'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.set('model', model);
  this.render(hbs `{{profiles/profile-single model=model}}`);
  assert.equal(this.$('.t-profile-header').text().trim(), trans.t('admin.profile.new'));
});

test('translation keys for labels', function(assert) {
  this.render(hbs `{{profiles/profile-single}}`);
  assert.equal(getLabelText('description'), trans.t('admin.profile.description'));
  assert.equal(getLabelText('assignee'), trans.t('admin.profile.assignee'));
});

test('placeholders', function(assert) {
  this.render(hbs `{{profiles/profile-single}}`);
  assert.equal(this.$('.t-ap-description').get(0)['placeholder'], trans.t('admin.profile.description'));
});
