import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

var AttachmentRepo = Ember.Object.extend({
    remove(id) {
        let store = this.get('store');
        store.remove('attachment', id);
        PromiseMixin.xhr(`${PREFIX}/admin/attachments/${id}/`, 'DELETE');
    },
    upload(id, file, model) {
        let store = this.get('store');
        store.push('attachment', {id: id, local: true, percent: 25, new: true});
        model.add_attachment(id);
        let data = new FormData();
        data.append('id', id);
        data.append('filename', file.name);
        data.append('file', file);
        let endpoint = `${PREFIX}/admin/attachments/`;
        let options = {method: 'POST', cache: false, processData: false, contentType: false, data: data, url: endpoint};
        return new Ember.RSVP.Promise(function(resolve, reject) {
            options.success = function(json) {
                return Ember.run(null, resolve, json);
            };
            Ember.$.ajax(options);
        });
    }
});

export default AttachmentRepo;
