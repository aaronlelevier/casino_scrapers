import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'ul',
    classNames: ['nav navbar-nav navbar-right'],
    actions: {
        show_menu(){
            let isShowing = this.get('showing');
            if(isShowing){
                this.set('showing', false);
            }else{
                this.set('showing', true);
            }
        }
    }
});
