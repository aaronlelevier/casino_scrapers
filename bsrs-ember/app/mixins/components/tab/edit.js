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
            });
        },
        delete() {
            let id = this.get('model').get('id');
            let repository = this.get('repository');
            let callback = function() {
                repository.delete(id);
            };
            this.sendAction('close', this.tab(), callback);
        }
    }
});

export default EditMixin;

