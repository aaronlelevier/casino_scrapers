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
    set(this, 'isError', false);
  }
  exit({ next = false }) {
    set(this, 'isActive', false);

    if (this.exitStep) {
      this.exitStep(this.model);
    }

    // if step has NO properties
    if (!this.properties.length) {
      // only if going forward, set isCompleted on current step
      if (next) {
        set(this, 'isCompleted', true);
      }
      return;
    }

    // if step has properties
    if (this.isFinished()) {
      set(this, 'isCompleted', true);
    } else {
      set(this, 'isError', true);
    }

  }
  /**
   * checks the steps properties and if present
   * initially true, if ever get a falsy property, will return false
   * @method isFinished
   * @return {Bool}
   */
  isFinished() {
    const properties = this.properties;
    return properties.reduce((prev, prop) => {
      // TODO: should check validations object
      return !!get(this.model, prop) && prev;
    }, true);
  }
}
