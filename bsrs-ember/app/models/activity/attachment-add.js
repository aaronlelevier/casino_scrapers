import Ember from 'ember';

export default Ember.Object.extend({
    filepath: Ember.computed('file', function() {
        const file = this.get('file');
        return `/media/${file}`;
    }),
    image_thumb: Ember.computed('image_thumbnail', function() {
        const image_thumbnail = this.get('image_thumbnail');
        if(image_thumbnail !== ''){
            return `/media/${image_thumbnail}`;
        }else{
            return '';
        }
    })
});
