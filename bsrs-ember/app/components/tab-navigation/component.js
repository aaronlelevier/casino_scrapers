import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    actions: {
        close(tab){
            this.attrs.close(tab);
        }
    }
});
