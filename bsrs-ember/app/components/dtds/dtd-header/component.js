import Ember from 'ember';

export default Ember.Component.extend({
    showing: {
        previewShowing: true,
        detailShowing: true,
        listShowing: true,
    },
    actions: {
        togglePreview(){
            const showing = this.get('showing');
            if(showing.listShowing || showing.detailShowing){
                this.toggleProperty('showing.previewShowing');
            }
        },
        toggleDetail(){
            const showing = this.get('showing');
            if(showing.listShowing || showing.previewShowing){
                this.toggleProperty('showing.detailShowing');
            }
        },
        toggleList(){
            const showing = this.get('showing');
            if(showing.detailShowing || showing.previewShowing){
                this.toggleProperty('showing.listShowing');
            }
        }
    }
});
