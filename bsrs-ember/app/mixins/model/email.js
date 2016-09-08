import Ember from 'ember';

const { run } = Ember;

var EmailMixin = Ember.Mixin.create({
    emails_all: Ember.computed(function() {
        const filter = (email) => {
            return this.get('id') === email.get('model_fk');
        };
        return this.get('simpleStore').find('email', filter);
    }),
    emails: Ember.computed(function() {
        const filter = (email) => {
            return this.get('id') === email.get('model_fk') && !email.get('removed');
        };
        return this.get('simpleStore').find('email', filter);
    }),
    email_ids: Ember.computed('emails.[]', function() {
        return this.get('emails').mapBy('id');
    }),
    emailsIsDirty: Ember.computed('emails.[]', 'emails.@each.{isDirty,email,email_type}', function() {
        let email_dirty = false;
        const emails = this.get('emails');
        const email_fks = this.get('email_fks');
        let filtered_emails = emails.map((email) => {
            return this.copy(email);
        });
        let filtered_email_fks = Ember.$.extend(true, [], email_fks);
        if (filtered_email_fks.length < filtered_emails.length) {
            //if add new email email and ask right away if dirty, need to update fk array
            emails.forEach((email) => {
                if (Ember.$.inArray(email.get('id'), filtered_email_fks) < 0) {
                    filtered_email_fks.push(email.get('id'));
                }
            });
        }
        emails.forEach((email) => {
            //if dirty
            if (email.get('isDirtyOrRelatedDirty')) {
                email_dirty = true;
            }
            //get rid of invalid emails and provide updated array for dirty check; only if off by one.  If same length, then don't want to filter out.
            if (email.get('invalid_email') && filtered_email_fks.length !== filtered_emails.length) {
                filtered_email_fks = filtered_email_fks.filter((fk) => {
                        return fk !== email.get('id');
                });
                filtered_emails = filtered_emails.filter((email) => {
                    return email.email !== '' || email.email !== 'undefined';
                });
            }
        });
        //if not dirty, but delete email email, then mark as dirty and clean up array
        if (this.get('emails_all').get('length') > 0 && filtered_email_fks.length !== filtered_emails.length) {
            email_dirty = true;
        }
        return email_dirty;
    }),
    emailsIsNotDirty: Ember.computed.not('emailsIsDirty'),
    saveEmails() {
        this.cleanupEmails();
        const emails = this.get('emails');
        emails.forEach((email) => {
            email.save();
            email.saveRelated();
        });
    },
    rollbackEmails() {
        const store = this.get('simpleStore');
        const emails_to_remove = [];
        const emails = this.get('emails_all');
        emails.forEach((email) => {
            //remove
            if (email.get('removed')) {
                run(function() {
                    store.push('email', {id: email.get('id'), removed: undefined});
                });
            }
            //add
            if(email.get('invalid_email') && email.get('isNotDirty')) {
                emails_to_remove.push(email.get('id'));
            }
            email.rollback();
        });
        run(function() {
            emails_to_remove.forEach((id) => {
                store.remove('email', id);
            });
        });
    },
    cleanupEmails() {
        const store = this.get('simpleStore');
        const emails_to_remove = [];
        const emails = this.get('emails');
        const emails_all = this.get('emails_all');
        const email_fks = this.get('email_fks');
        const email_ids = this.get('email_ids');
        emails_all.forEach((email) => {
            if(email.get('invalid_email') || email.get('removed')) {
                emails_to_remove.push(email.get('id'));
            }
        });
        run(function() {
            emails_to_remove.forEach((id) => {
                store.remove('email', id);
            });
        });
        this.cleanupEmailFKs();
    },
    cleanupEmailFKs() {
        const email_fks = this.get('email_fks');
        const email_ids = this.get('email_ids');
        //add
        email_ids.forEach((id) => {
            if (Ember.$.inArray(id, email_fks) < 0) {
                email_fks.push(id);
            }
        });
        //remove
        email_fks.forEach((fk, indx) => {
            if (email_ids.indexOf(fk) < 0) {
               email_fks.splice(indx, 1); 
            }
        });
    }
});

export default EmailMixin;
