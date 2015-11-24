import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import config from 'bsrs-ember/config/environment';

var PREFIX = config.APP.NAMESPACE;

var AttachmentRepo = Ember.Object.extend({
    uuid: inject('uuid'),
    upload(file, model) {
        let store = this.get('store');
        let id = this.get('uuid').v4();
        store.push('attachment', {id: id, local: true, percent: 25});
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
