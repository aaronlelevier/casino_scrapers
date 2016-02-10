import Ember from 'ember';

var EditMixin = Ember.Mixin.create({
    actions: {
        save() {
            let model = this.get('model');
            let persisted = model.get('new');
            let repository = this.get('repository');
            let action = persisted === true ? 'insert' : 'update';
            repository[action](model).then(() => {
                let tab = this.tab();
                tab.set('saveModel', persisted);
                this.sendAction('close', tab);
            }, (xhr) => {
                if(xhr.status === 400) {
                    var response = JSON.parse(xhr.responseText), errors = [];
                    Object.keys(response).forEach(function(key) {
                        errors.push({name: key, value: response[key].toString()});
                    });
                    this.set('ajaxError', errors);
                }
            });
        },
        delete() {
            let id = this.get('model').get('id');
            let repository = this.get('repository');
            let callback = function() {
                return repository.delete(id);
            };
            this.sendAction('delete', this.tab(), callback, id);
        }
    }
});

export default EditMixin;
