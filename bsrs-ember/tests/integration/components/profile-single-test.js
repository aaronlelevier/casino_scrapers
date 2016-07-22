import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import generalPage from 'bsrs-ember/tests/pages/general';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PFD from 'bsrs-ember/vendor/defaults/profile-filter';
import page from 'bsrs-ember/tests/pages/profile';

var store, model, trans;

const ERR_TEXT = '.validated-input-error-dialog';

moduleForComponent('profile-single', 'integration: profile-single test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:profile']);
    trans = this.container.lookup('service:i18n');
    run(() => {
      model = store.push('profile', {
        id: PD.idOne,
        description: PD.descOne,
      });
    });
  },
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
  var done = assert.async();
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'description';
  run(() => {
    model = store.push('profile', {
      id: PD.idTwo,
    });
  });
  this.set('model', model);
  this.render(hbs `{{profiles/profile-single model=model}}`);
  // like new template
  const $component = this.$('.invalid');
  assert.notOk($component.is(':visible'));
  this.$('.t-ap-description').val('').keyup();
  Ember.run.later(() => {
    const $component = this.$('.invalid');
    assert.ok($component.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.profile.description'));
    this.$('.t-ap-description').val('a'.repeat(500)).keyup();
    Ember.run.later(() => {
      const $component = this.$('.invalid');
      assert.notOk($component.is(':visible'));
      this.$('.t-ap-description').val('a'.repeat(501)).keyup();
      Ember.run.later(() => {
        const $component = this.$('.invalid');
        assert.ok($component.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.profile.description.min_max'));
        this.$('.t-ap-description').val('a'.repeat(4)).keyup();
        Ember.run.later(() => {
          const $component = this.$('.invalid');
          assert.ok($component.is(':visible'));
          assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.profile.description.min_max'));
          this.$('.t-ap-description').val('a'.repeat(5)).keyup();
          Ember.run.later(() => {
            const $component = this.$('.invalid');
            assert.notOk($component.is(':visible'));
            done();
          }, 200);
        }, 1800);
      }, 1800);
    }, 200);
  }, 1800);
});
