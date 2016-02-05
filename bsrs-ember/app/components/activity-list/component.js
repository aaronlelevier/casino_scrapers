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
    allCounts: Ember.computed(function() {
        return this.get('model').get('length');
    }),
    commentCounts: Ember.computed(function() {
        return this.get('model').filterBy('type', 'comment').get('length');
    }),
    statusCounts: Ember.computed(function() {
        return this.get('model').filterBy('type', 'status').get('length');
    }),
    actions: {
        filter(filterType, event){
            Ember.$('.activity-list-tabs li').removeClass('active');
            Ember.$(event.target).addClass('active');
            Ember.$('.activity-list-item').each(function(i, elem){
                if(!Ember.$(elem).hasClass('activity-create')){
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
                }
            });

            if(Ember.$('.activity-list-item').filter(':visible').length === 0){
                Ember.$('.activity-spacer').hide();
                switch(filterType){
                    case 'comments':
                        Ember.$('.activity-empty-comments').removeClass('hide');
                        Ember.$('.activity-empty-status_updates').addClass('hide');
                    break;
                    case 'status_updates':
                        Ember.$('.activity-empty-comments').addClass('hide');
                        Ember.$('.activity-empty-status_updates').removeClass('hide');
                    break;
                    default:
                    break;
                }
            }else{
                Ember.$('.activity-empty-comments').addClass('hide');
                Ember.$('.activity-empty-status_updates').addClass('hide');
                Ember.$('.activity-spacer').show();
            }

        }
    }
});
