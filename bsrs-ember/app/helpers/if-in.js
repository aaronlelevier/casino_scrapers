import Ember from 'ember';

export default Ember.Helper.helper((params, {list, elem}) => {
    return list.includes(elem);
});
