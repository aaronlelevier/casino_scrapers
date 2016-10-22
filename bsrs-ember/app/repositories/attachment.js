import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE, run = Ember.run;

var AttachmentRepo = Ember.Object.extend({
  remove(id) {
    const store = this.get('simpleStore');
    run(() => {
      store.remove('attachment', id);
    });
    PromiseMixin.xhr(`${PREFIX}/admin/attachments/${id}/`, 'DELETE');
  },
  /* @method removeAllUnrelated
   * when rolling back, any attachment that exists on the _ids array but not on the _fks array
   */
  removeAllUnrelated(ids) {
    if(ids && ids.length > 0) {
      let endpoint = `${PREFIX}/admin/attachments/batch-delete/`;
      let options = {method: 'DELETE', cache: false, data: {ids: ids}, url: endpoint};
      return new Ember.RSVP.Promise(function(resolve, reject) {
        options.success = function(json) {
          return Ember.run(null, resolve, json);
        };
        Ember.$.ajax(options);
      });
    }
  },
  didProgress(e, id) {
    const attachment = this.get('simpleStore').find('attachment', id);
    attachment.set('percent', Math.round(e.loaded / e.total * 100));
  },
  upload(id, file, model) {
    let self = this;
    let store = this.get('simpleStore');
    run(() => {
      store.push('attachment', {id: id, new: true, title: file.name, percent: 0});
    });
    let data = new FormData();
    data.append('id', id);
    data.append('filename', file.name);
    data.append('file', file);
    let endpoint = `${PREFIX}/admin/attachments/`;
    let options = {
      method: 'POST',
      cache: false,
      processData: false,
      contentType: false,
      data: data,
      url: endpoint,
      xhr: function() {
        var xhr = Ember.$.ajaxSettings.xhr();
        xhr.upload.onprogress = function(e) {
          self.didProgress(e, id);
        };
        return xhr;
      },
    };
    return new Ember.RSVP.Promise((resolve, reject) => {
      options.success = function(json) {
        return Ember.run(null, resolve, json);
      };
      options.error = (xhr, errorThrown) => {
        return Ember.run(null, reject, xhr);
      };
      Ember.$.ajax(options);
    });
  }
});

export default AttachmentRepo;
