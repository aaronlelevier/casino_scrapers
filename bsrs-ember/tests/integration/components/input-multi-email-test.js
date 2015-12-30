import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import Person from 'bsrs-ember/models/person';
import Email from 'bsrs-ember/models/email';
import EmailType from 'bsrs-ember/models/email-type';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PD from 'bsrs-ember/vendor/defaults/person';

var store, default_type, trans, email_types;

moduleForComponent('input-multi-email', 'scott integration: input-multi-email test', {
    integration: true,
    setup() {
        translation.initialize(this);
        default_type = EmailType.create({id: ETD.personalId, name: ETD.personalEmail});
        store = module_registry(this.container, this.registry, ['model:person', 'model:email']);
        trans = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(trans, json);
        email_types = [EmailType.create({id: ETD.personalId, name: ETD.personalEmail }), EmailType.create({ id: ETD.workId, name: ETD.workEmail})];
    }
});

test('defaults to use email model with field name of email', function(assert) {
    var person = store.push('person', {id: PD.idOne});
    var model = store.find('email', {model_fk: PD.idOne});
    this.set('model', model);
    this.set('related_pk', PD.idOne);
    this.set('related_field', 'model_fk');
    this.set('default_type', default_type);
    this.render(hbs`{{input-multi-email model=model related_pk=related_pk related_field=related_field default_type=default_type}}`);
    assert.equal(model.get('content.length'), 0);
    var $component = this.$('.t-input-multi-email');
    assert.equal(this.$('.t-new-entry').length, 0);
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    $first_btn.trigger('click').trigger('change');
    assert.equal(this.$('.t-new-entry').length, 1);
    assert.equal(store.find('email').get('length'), 1);
    assert.equal(model.get('content.length'), 1);
    assert.equal(model.objectAt(0).get('model_fk'), PD.idOne);
    assert.equal(model.objectAt(0).get('type'), ETD.personalId);
    assert.equal(model.objectAt(0).get('id').length, 36);
    assert.equal(model.objectAt(0).get('email'), undefined);
    assert.ok(model.objectAt(0).get('isNotDirty'));
    this.$('.t-new-entry').val('snew@gmail.com').trigger('change');
    assert.equal(model.objectAt(0).get('email'), 'snew@gmail.com');
});

test('once added a button for email type appears with a button to delete it', function(assert) {
    var model = store.find('email', {model_fk: PD.idOne});
    var email_types = [EmailType.create({id: ETD.personalId, name: ETD.personalEmail }), EmailType.create({ id: ETD.workId, name: ETD.workEmail})];
    this.set('model', model);
    this.set('related_pk', PD.idOne);
    this.set('related_field', 'model_fk');
    this.set('email_types', email_types);
    this.set('default_type', default_type);
    this.render(hbs`{{input-multi-email model=model types=email_types related_pk=related_pk related_field=related_field default_type=default_type}}`);
    var $component = this.$('.t-input-multi-email');
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    var $first_type_select = $component.find('.t-multi-email-type');
    var $first_del = $component.find('.t-del-btn:eq(0)');
    assert.equal($first_type_select.length, 0);
    assert.equal($first_del.length, 0);
    $first_btn.trigger('click');
    $first_del = $component.find('.t-del-btn:eq(0)');
    $first_type_select = $component.find('.t-multi-email-type');
    assert.equal($first_del.length, 1);
    assert.equal($first_type_select.length, 1);
    assert.equal($first_type_select.find('option').length, 2);
    assert.equal($first_type_select.find('option:eq(0)').text(), trans.t(ETD.personalEmail));
    assert.equal($first_type_select.find('option:eq(1)').text(), trans.t(ETD.workEmail));
    assert.equal(model.objectAt(0).get('type'), ETD.personalId);
});

test('changing the email type will alter the bound value', function(assert) {
    var email_types = [EmailType.create({ id: ETD.personalId, name: ETD.personalEmail }), EmailType.create({ id: ETD.workId, name: ETD.workEmail })];
    var model = store.find('email', {model_fk: PD.idOne});
    this.set('model', model);
    this.set('related_pk', PD.idOne);
    this.set('related_field', 'model_fk');
    this.set('email_types', email_types);
    this.set('default_type', default_type);
    this.render(hbs`{{input-multi-email model=model types=email_types related_pk=related_pk related_field=related_field default_type=default_type}}`);
    var $component = this.$('.t-input-multi-email');
    var $first_btn = $component.find('.t-add-btn:eq(0)');
    var $first_type_select = $component.find('.t-multi-email-type');
    assert.equal($first_type_select.length, 0);
    $first_btn.trigger('click');
    $first_type_select = $component.find('.t-multi-email-type');
    assert.equal(model.objectAt(0).get('type'), ETD.personalId);
    $first_type_select.val(ETD.workId).trigger('change');
    assert.equal(model.objectAt(0).get('type'), ETD.workId);
    assert.equal($first_type_select.val(), ETD.workId);
});

test('changing existing email type will alter the model regardless of the primary key value', function(assert) {
    store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.personalId, model_fk: PD.idOne});
    store.push('email', {id: ED.idTwo, email: ED.emailTwo, type: ETD.workId, model_fk: PD.idOne});
    var model = store.find('email', {model_fk: PD.idOne});
    this.set('model', model);
    this.set('related_pk', PD.idOne);
    this.set('related_field', 'model_fk');
    this.set('default_type', default_type);
    this.set('email_types', email_types);
    this.render(hbs`{{input-multi-email model=model types=email_types related_pk=related_pk related_field=related_field default_type=default_type}}`);
    var $component = this.$('.t-input-multi-email');
    var $first_type_select = $component.find('.t-multi-email-type');
    assert.equal($first_type_select.length, 2);
    $first_type_select = $component.find('.t-multi-email-type');
    assert.equal(model.objectAt(0).get('type'), ETD.personalId);
    $first_type_select.val(ETD.workId).trigger('change');
    assert.equal(model.objectAt(0).get('type'), ETD.workId);
    assert.equal($first_type_select.val(), ETD.workId);
});

test('click delete btn will remove input', function(assert) {
    var person = store.push('person', {id: PD.id, email_fks: [ED.idOne, ED.idTwo]});
    store.push('email', {id: ED.idOne, email: ED.emailOne, type: ETD.personalId, model_fk: PD.idOne});
    store.push('email', {id: ED.idTwo, email: ED.emailTwo, type: ETD.workId, model_fk: PD.idOne});
    var model = store.find('email', {model_fk: PD.idOne});
    this.set('model', model);
    this.set('related_pk', PD.idOne);
    this.set('related_field', 'model_fk');
    this.set('email_types', email_types);
    this.set('default_type', default_type);
    this.render(hbs`{{input-multi-email model=model types=email_types related_pk=related_pk related_field=related_field default_type=default_type}}`);
    var $component = this.$('.t-input-multi-email');
    assert.equal(this.$('.t-new-entry').length, 2);
    var $first_del_btn = $component.find('.t-del-btn:eq(0)');
    assert.equal($first_del_btn.length, 1);
    $first_del_btn.trigger('click');
    var emails = store.find('email');
    assert.equal(emails.get('length'), 2);
    assert.equal(emails.objectAt(0).get('removed'), true);
});

test('filling in invalid email reveals validation message', function(assert) {
    var model = store.find('email', {model_fk: PD.idOne});
    this.set('model', model);
    this.set('related_pk', PD.idOne);
    this.set('related_field', 'model_fk');
    this.set('email_types', email_types);
    this.set('default_type', default_type);
    this.render(hbs`{{input-multi-email model=model types=email_types related_pk=related_pk related_field=related_field default_type=default_type}}`);
    var $first_btn = this.$('.t-add-btn:eq(0)');
    var $first_type_select = this.$('.t-multi-email-type');
    assert.equal($first_type_select.length, 0);
    $first_btn.trigger('click').trigger('change');
    var $component_format = this.$('.t-input-multi-email-validation-format-error');
    assert.ok($component_format.is(':hidden'));
    this.$('.t-new-entry').val('snew').trigger('change');
    assert.ok($component_format.is(':visible'));
    this.$('.t-new-entry').val('snewcomer@gmail.com').trigger('change');
    assert.ok($component_format.is(':hidden'));
});
