import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'article',
    classNames: ['main', 'full', 'dtd-row'],
    classNameBindings: ['countPanes'],
    countPanes: Ember.computed('previewShowing', 'detailShowing', 'listShowing', function() {
        const showing = this.get('showing');
        var count = Object.keys(showing).reduce((prev, key) => {
            return prev += (showing[key] ? 1 : 0);
        }, 0);
        return `col-count-${count}`;
    }),
    previewShowing: true,
    detailShowing: true,
    listShowing: true,
    showing: Ember.computed(function(){ 
        return {
            previewShowing: this.get('previewShowing'),
            detailShowing: this.get('detailShowing'),
            listShowing: this.get('listShowing'),
        };
    }),
    actions: {
        togglePreview(){
            const showing = this.get('showing');
            if(showing.listShowing || showing.detailShowing){
                const bool = this.toggleProperty('showing.previewShowing');
                this.set('previewShowing', bool);
            }
        },
        toggleDetail(){
            const showing = this.get('showing');
            if(showing.listShowing || showing.previewShowing){
                const bool = this.toggleProperty('showing.detailShowing');
                this.set('detailShowing', bool);
            }
        },
        toggleList(){
            const showing = this.get('showing');
            if(showing.detailShowing || showing.previewShowing){
                const bool = this.toggleProperty('showing.listShowing');
                this.set('listShowing', bool);
            }
        }
    }
});
