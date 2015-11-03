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
                this.attrs.save(tab);
            });
        },
        delete() {
            let model = this.get('model'); 
            let repository = this.get('repository');
            this.attrs.delete(this.tab(), repository);
        }
    }
});

export default EditMixin;

