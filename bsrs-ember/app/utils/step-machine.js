import Ember from 'ember';
const { get, set } = Ember;
/**
 * 1. Determine what component to render next (setting a property w/ or w/o an action)
 * 2. The state is whether or not the computed returns true / false (which will disable or not disable a button)
 * STATE MACHINE 
 * */
export default class Step {
  constructor(componentName, model) {
    this.componentName = componentName; 
    this.model = model;
    this.isCompleted = false; 
    this.isActive = false; 
    this.isError = false; 
  }
  enter() {
    set(this, 'isActive', true);
    set(this, 'isCompleted', false);
  }
  exit() {
    set(this, 'isActive', false);
    if (this.isFinished()) {
      set(this, 'isCompleted', true);
    } else {
      set(this, 'isError', true);
    }
  }
  /**
   * checks the steps properties and if present
   * @method isFinished
   * @return {Bool}
   */
  isFinished() {
    const properties = this.properties;
    return properties.reduce((prev, prop) => {
      // TODO: should check validations object
      return get(this.model, prop) || prev;
    }, false);
  }
}
