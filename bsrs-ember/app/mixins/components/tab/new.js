import Ember from 'ember';

var NewTabMixin = Ember.Mixin.create({
    actions: {
        save() {
            let model = this.get('model'); 
            let repository = this.get('repository');
            repository.insert(model).then(() => {
                let tab = this.tab();
                tab.set('saveModel', true);
                this.attrs.save(tab);
            });
        }
    }
});

export default NewTabMixin;
