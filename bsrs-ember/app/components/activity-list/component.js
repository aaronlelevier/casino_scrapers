import Ember from 'ember';
const { Route, inject } = Ember;

export default Ember.Component.extend({
    i18n: inject.service(),
    sortedModels: Ember.computed.sort('model', function(a,b) {
        if (a.get('created') > b.get('created')) {
            return -1;
        }else if (a.get('created') < b.get('created')) {
            return 1;
        }
        return 0;
    }),
    actions: {
        filter(filterType, event){
            Ember.$('.activity-list-tabs li').removeClass('active');
            Ember.$(event.target).addClass('active');
            Ember.$('.activity-list-item').each(function(i, elem){
                switch(filterType){
                    case 'comments':
                        if(Ember.$(elem).hasClass('activity-comment')){
                            Ember.$(elem).removeClass('hide');
                        }else{
                            Ember.$(elem).addClass('hide');
                        }
                    break;
                    case 'status_updates':
                        if(Ember.$(elem).hasClass('activity-status')){
                            Ember.$(elem).removeClass('hide');
                        }else{
                            Ember.$(elem).addClass('hide');
                        }
                    break;
                    default:
                        Ember.$(elem).removeClass('hide');
                    break;
                }
            });
        }
    }
});
