import Ember from 'ember';

var EditMixin = Ember.Mixin.create({
    actions: { 
        save() {
            let model = this.get('model'); 
            let repository = this.get('repository');
            repository.update(model).then(() => {
                this.attrs.save(this.tab());
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

