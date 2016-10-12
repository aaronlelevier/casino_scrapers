import Ember from 'ember';
const { run, get } = Ember;
import equal from 'bsrs-ember/utilities/equal';

export default Ember.Mixin.create({
  attachmentsIsNotDirty: Ember.computed.not('attachmentsIsDirty'),
  attachmentsIsDirty: Ember.computed('attachment_ids.[]', 'previous_attachments_fks.[]', function() {
    const attachment_ids = this.get('attachment_ids') || [];
    const previous_attachments_fks = this.get('previous_attachments_fks') || [];
    if(attachment_ids.get('length') !== previous_attachments_fks.get('length')) {
      return true;
    }
    return equal(attachment_ids, previous_attachments_fks) ? false : true;
  }),
  attachment_ids: Ember.computed('attachments.[]', function() {
    return get(this, 'attachments').mapBy('id');
  }).readOnly(),
  attachments: Ember.computed('current_attachment_fks.[]', function() {
    const related_fks = this.get('current_attachment_fks');
    const filter = (attachment) => {
      return Ember.$.inArray(attachment.get('id'), related_fks) > -1;
    };
    return this.get('simpleStore').find('attachment', filter);
  }),
  rollbackAttachments() {
    const { current_attachment_fks, previous_attachments_fks } = this.getProperties('current_attachment_fks', 'previous_attachments_fks');
    current_attachment_fks.forEach((id) => {
      this.remove_attachment(id);
    });
    previous_attachments_fks.forEach((id) => {
      this.add_attachment(id);
    });
  },
  remove_attachment(attachment_id) {
    const store = this.get('simpleStore');
    const attachment = store.find('attachment', attachment_id);
    attachment.set('rollback', true);
    const current_fks = this.get('current_attachment_fks') || [];
    return current_fks.filter((id) => {
      return id !== attachment_id;
    });
  },
  add_attachment(attachment_id) {
    const store = this.get('simpleStore');
    const attachment = store.find('attachment', attachment_id);
    attachment.set('rollback', undefined);
    return this.get('current_attachment_fks') || [];
  },
});
