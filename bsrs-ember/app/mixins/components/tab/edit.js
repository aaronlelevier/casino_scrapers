import Ember from 'ember';

var EditMixin = Ember.Mixin.create({
    actions: {
        save(update) {
            const model = this.get('model');
            const pk = this.get('model').get('id');
            const persisted = model.get('new');
            const repository = this.get('repository');
            const action = persisted === true ? 'insert' : 'update';
            repository[action](model).then(() => {
                let tab = this.tab();
                tab.set('saveModel', persisted);
                if(!update){
                    this.sendAction('close', tab);
                }else{
                    this.get('activityRepository').find('ticket', 'tickets', pk);
                }
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
