import Ember from 'ember';
import injectStore from 'bsrs-ember/utilities/store';

export default Ember.Component.extend({
    store: injectStore('main'),
    tagName: 'article',
    classNames: ['main', 'full', 'dtd'],
    classNameBindings: ['countPanes'],
    countPanes: Ember.computed('previewShowing.[]', 'detailShowing.[]', 'listShowing.[]', function() {
        const _s = this.get('store').find('dtd-header').objectAt(0);
        const count = (_s.get('showingDetail') ? 1 : 0) + (_s.get('showingList') ? 1 : 0) + (_s.get('showingPreview') ? 1 : 0);
        // var count = Object.keys(showing).reduce((prev, key) => {
        //     return prev += (showing[key] ? 1 : 0);
        // }, 0);
        return `col-count-${count}`;
    }),
    detailShowing: Ember.computed(function(){
        const filter = (dtdHeader) => {
            return dtdHeader.get('showingDetail');
        };
        return this.get('store').find('dtd-header', filter);
    }),
    previewShowing: Ember.computed(function(){
        const filter = (dtdHeader) => {
            return dtdHeader.get('showingPreview');
        };
        return this.get('store').find('dtd-header', filter);
    }),
    listShowing: Ember.computed(function(){
        const filter = (dtdHeader) => {
            return dtdHeader.get('showingList');
        };
        return this.get('store').find('dtd-header', filter);
    }),
    actions: {
        togglePreview(){
            const store = this.get('store');
            const model = store.find('dtd-header').objectAt(0);
            if(model.get('showingList') || model.get('showingDetail')){
                const bool = model.toggleProperty('showingPreview');
                const showingPreview = bool;
                store.push('dtd-header', {id: 1, showingPreview:showingPreview});
            }
        },
        toggleDetail(){
            const store = this.get('store');
            const model = store.find('dtd-header').objectAt(0);
            if(model.get('showingList') || model.get('showingPreview')){
                const bool = model.toggleProperty('showingDetail');
                const showingDetail = bool;
                store.push('dtd-header', {id: 1, showingDetail:showingDetail});
            }
        },
        toggleList(){
            const store = this.get('store');
            const model = store.find('dtd-header').objectAt(0);
            if(model.get('showingDetail') || model.get('showingPreview')){
                const bool = model.toggleProperty('showingList');
                const showingList = bool;
                store.push('dtd-header', {id: 1, showingList:showingList});
            }
        }
    }
});
