import Ember from 'ember';

export default Ember.Component.extend({
    previewShowing: true,
    actions: {
        togglePreview(){
            this.toggleProperty('previewShowing');
        }
    }
});
