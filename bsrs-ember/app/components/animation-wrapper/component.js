import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'animation-wrapper',
  classNameBindings: [
    'slideOutDown:slideOutDown',
    'slideInUp:slideInUp',
    'slideOutUp:slideOutUp',
    'slideOutRight:slideOutRight',
    'slideOutLeft:slideOutLeft',
    'slideInLeft:slideInLeft',
    'slideInRight:slideInRight',
    'fullScreen',
    'desktop',
  ],
  fullScreen: true,
  desktop: false,
  slideOutDown: false,
  slideInUp: false,
  slideOutUp: false,
  slideOutLeft: false,
  slideOutRight: false,
  slideInLeft: false,
  slideInRight: false,
});
