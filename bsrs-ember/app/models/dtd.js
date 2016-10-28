import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/store';
import equal from 'bsrs-ember/utilities/equal';
import OptConf from 'bsrs-ember/mixins/optconfigure/dtd';
import { attr, Model } from 'ember-cli-simple-store/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { many_to_many, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';

const Validations = buildValidations({
  key: [
    validator('presence', {
      presence: true,
      message: 'errors.dtd.key'
    }),
    validator('length', {
      max: 12,
      message: 'errors.dtd.key.length',
    }),
  ],
  links: validator(function(value, options, model, attribute) {
    return model.get(attribute).reduce((prev, model) => {
      return prev && model.get('validations').get('isValid');
    }, true);
  }),
});

var DTDModel = Model.extend(Validations, OptConf, {
  init() {
    many_to_many.bind(this)('link', 'dtd', {plural:true, dirty:false});
    many_to_many.bind(this)('field', 'dtd', {plural:true, dirty:false});
    many_to_many.bind(this)('attachment', 'generic', {plural: true});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  generic_attachments_fks: [],
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
  linksIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('dtd_links'),
  linksIsDirty: Ember.computed('links.@each.{isDirtyOrRelatedDirty}', 'linksIsDirtyContainer', function() {
    const links = this.get('links');
    return links.isAny('isDirtyOrRelatedDirty') || this.get('linksIsDirtyContainer');
  }),
  linksIsNotDirty: Ember.computed.not('linksIsDirty'),
  fieldsIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('dtd_fields'),
  fieldsIsDirty: Ember.computed('fields.@each.{isDirtyOrRelatedDirty}', 'fieldsIsDirtyContainer', function() {
    const fields = this.get('fields');
    return fields.isAny('isDirtyOrRelatedDirty') || this.get('fieldsIsDirtyContainer');
  }),
  fieldsIsNotDirty: Ember.computed.not('fieldsIsDirty'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'linksIsDirty', 'fieldsIsDirty', 'attachmentsIsDirty', function() {
    return this.get('isDirty') || this.get('linksIsDirty') || this.get('fieldsIsDirty') || this.get('attachmentsIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  serialize(){
    const links = this.get('links').map((link) => {
      return link.serialize();
    });
    const fields = this.get('fields').filter(field => field.get('type')).map(field => field.serialize());
    return {
      id: this.get('id'),
      key: this.get('key'),
      description: this.get('description'),
      prompt: this.get('prompt'),
      note: this.get('note'),
      note_type: this.get('note_type'),
      link_type: this.get('link_type'),
      fields: fields,
      links: links,
      attachments: this.get('attachments_ids')
    };
  },
  /* @method rollbackAttachmentsContainer
   * sets attachment fks to be removed in transitionCB from route
   */ 
  rollbackAttachmentsContainer() {
    const store = this.get('simpleStore');
    const attachment_ids = this.get('attachments_ids');
    const previous_attachment_fks = this.get('generic_attachments_fks').map((m2m_fk) => {
      const m2m = store.find('generic-join-attachment', m2m_fk);
      return m2m.get('attachment_pk');
    });
    const remove_attachment_ids = attachment_ids.filter(id => !previous_attachment_fks.includes(id));
    remove_attachment_ids.forEach((attachment_id) => store.remove('attachment', attachment_id));
    store.push('dtd', {id: this.get('id'), remove_attachment_ids: remove_attachment_ids});
  },
  rollback() {
    this.linkRollbackContainer();
    this.rollbackLinks();
    this.fieldRollbackContainer();
    this.rollbackFields();
    this.rollbackAttachmentsContainer();
    this.rollbackAttachments();
    this._super(...arguments);
  },
  linkRollbackContainer() {
    const links = this.get('links');
    links.forEach((model) => {
      model.rollback();
    });
  },
  fieldRollbackContainer() {
    const fields = this.get('fields');
    fields.forEach((model) => {
      model.rollback();
    });
  },
  saveAttachmentsContainer() {
    this.get('attachments').forEach((attachment) => {
      attachment.save();
    });
  },
  save(){
    this.saveLinksContainer();
    this.saveLinks();
    this.saveFieldsContainer();
    this.saveFields();
    this.saveAttachmentsContainer();
    this.saveAttachments();
    this._super(...arguments);
  },
  saveLinksContainer() {
    const links = this.get('links');
    links.forEach((link) => {
      // link.saveRelated();
      link.save();
    });
  },
  saveFieldsContainer() {
    const fields = this.get('fields');
    fields.forEach((field) => {
      field.saveRelated();
      field.save();
    });
  },
  removeRecord(){
    run(() => {
      this.get('simpleStore').remove('dtd', this.get('id'));
    });
  },
});


export default DTDModel;
