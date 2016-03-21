import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';
import { rollbackAll } from 'bsrs-ember/utilities/rollback-all';

const Validations = buildValidations({
  key: validator('presence', {
    presence: true,
    message: 'Key must be provided'
  }),
  description: validator('presence', {
    presence: true,
    message: 'Description must be provided'
  }),
  links: validator(function(value, options, model, attribute) {
    return model.get(attribute).reduce((prev, model) => {
      return prev && model.get('validations').get('isValid');
    }, true);
  }),
});

var DTDModel = Model.extend(Validations, {
  store: inject('main'),
  key: attr(''),
  description: attr(''),
  note: attr(''),
  note_type: attr(''),
  note_types: [
    'admin.dtd.note_type.success',
    'admin.dtd.note_type.warning',
    'admin.dtd.note_type.info',
    'admin.dtd.note_type.danger'
  ],
  prompt: attr(''),
  link_type: attr(''),
  link_types: [
    'admin.dtd.link_type.buttons',
    'admin.dtd.link_type.links'
  ],
  // Links
  links: many_models('dtd_links', 'link_pk', 'link'),
  dtd_links: many_to_many('dtd-link', 'dtd_pk'),
  dtd_link_ids: many_to_many_ids('dtd_links'),
  dtd_link_fks: [],
  add_link: add_many_to_many('dtd-link', 'link', 'link_pk', 'dtd_pk'),
  remove_link: remove_many_to_many('dtd-link', 'link_pk', 'dtd_links'),
  linksIsDirtyContainer: many_to_many_dirty('dtd_link_ids', 'dtd_link_fks'),
  linksIsDirty: Ember.computed('links.@each.{isDirtyOrRelatedDirty}', 'linksIsDirtyContainer', function() {
    const links = this.get('links');
    return links.isAny('isDirtyOrRelatedDirty') || this.get('linksIsDirtyContainer');
  }),
  linksIsNotDirty: Ember.computed.not('linksIsDirty'),
  // Fields
  fields: many_models('dtd_fields', 'field_pk', 'field'),
  dtd_fields: many_to_many('dtd-field', 'dtd_pk'),
  dtd_field_ids: many_to_many_ids('dtd_fields'),
  dtd_field_fks: [],
  add_field: add_many_to_many('dtd-field', 'field', 'field_pk', 'dtd_pk'),
  remove_field: remove_many_to_many('dtd-field', 'field_pk', 'dtd_fields'),
  fieldsIsDirtyContainer: many_to_many_dirty('dtd_field_ids', 'dtd_field_fks'),
  fieldsIsDirty: Ember.computed('fields.@each.{isDirtyOrRelatedDirty}', 'fieldsIsDirtyContainer', function() {
    const fields = this.get('fields');
    return fields.isAny('isDirtyOrRelatedDirty') || this.get('fieldsIsDirtyContainer');
  }),
  fieldsIsNotDirty: Ember.computed.not('fieldsIsDirty'),
  // dirty tracking
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'linksIsDirty', 'fieldsIsDirty', function() {
    return this.get('isDirty') || this.get('linksIsDirty') || this.get('fieldsIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  serialize(){
    const links = this.get('links').map((link) => {
      return link.serialize();
    });
    return {
      id: this.get('id'),
      key: this.get('key'),
      description: this.get('description'),
      prompt: this.get('prompt'),
      note: this.get('note'),
      note_type: this.get('note_type'),
      link_type: this.get('link_type'),
      links: links
    };
  },
  rollback() {
    this.linkRollbackContainer();
    this.linkRollback();
    this.fieldRollbackContainer();
    this.fieldRollback();
    this._super();
  },
  linkRollbackContainer() {
    const links = this.get('links');
    rollbackAll(links);
  },
  linkRollback: many_to_many_rollback('dtd-link', 'dtd_link_fks', 'dtd_pk'),
  fieldRollbackContainer() {
    const fields = this.get('fields');
    rollbackAll(fields);
  },
  fieldRollback: many_to_many_rollback('dtd-field', 'dtd_field_fks', 'dtd_pk'),
  save(){
    this.saveLinksContainer();
    this.saveLinks();
    this.saveFieldsContainer();
    this.saveFields();
    this._super();
  },
  saveLinksContainer() {
    const links = this.get('links');
    links.forEach((link) => {
      // link.saveRelated();
      link.save();
    });
  },
  saveLinks: many_to_many_save('dtd', 'dtd_links', 'dtd_link_ids', 'dtd_link_fks'),
  saveFields: many_to_many_save('dtd', 'dtd_fields', 'dtd_field_ids', 'dtd_field_fks'),
  saveFieldsContainer() {
    const fields = this.get('fields');
    fields.forEach((field) => {
      field.saveRelated();
      field.save();
    });
  },
  removeRecord(){
    run(() => {
      this.get('store').remove('dtd', this.get('id'));
    });
  },
  saved: false,
  keyErrorMsg: Ember.computed('saved', function(){
    return this.get('validations.isValid') ? undefined : this.get('saved') ?
      this.get('validations.attrs.key.message') : undefined;
  }),
  descriptionErrorMsg: Ember.computed('saved', function(){
    return this.get('validations.isValid') ? undefined : this.get('saved') ?
      this.get('validations.attrs.description.message') : undefined;
  })
});


export default DTDModel;
