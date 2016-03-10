import Ember from 'ember';

export function tabWidth(params) {
    const maxw = 180;
    let w = (window.innerWidth-maxw)/params[0];
    w = w < maxw ? w : maxw;
    return w.toString() + 'px';
}

export default Ember.Helper.helper(tabWidth);
