import Ember from 'ember';

var NewTabMixin = Ember.Mixin.create({
    actions: {
        save() {
            let model = this.get('model'); 
            let repository = this.get('repository');
            return new Ember.RSVP.Promise(function(resolve) {
                return repository.insert(model).then(() => {
                    let tab = this.tab();
                    tab.set('saveModel', true);
                    this.attrs.save(tab);
                    resolve(1);
                });
            }.bind(this));
        }
    }
});

export default NewTabMixin;
