import Ember from 'ember';

var attachmentAddRemove = Ember.Component.extend({
    person: Ember.computed(function() {
        const i18n_string = this.get('i18nString');
        if (i18n_string) {
            const str = i18n_string.string;
            const [beg_string, count, timestamp] = str.split('$');
            //uploaded
            this.set('begString', beg_string.trim());
            this.set('count', count.trim());
            this.set('timestamp', timestamp.trim());
            //files
            return this.get('activity').get('person').get('fullname');
        }
    }),
    attachments: Ember.computed(function() {
        const activity = this.get('activity');
        let attachments;
        if (activity.type === 'attachment_add') {
            attachments = activity.get('added_attachment');
        }else{
            attachments = activity.get('removed_attachment');
        }
        return attachments;
    }),
});

export default attachmentAddRemove;
