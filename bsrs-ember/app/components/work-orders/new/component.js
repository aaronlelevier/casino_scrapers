import Ember from 'ember';
const { set, get, Component, computed } = Ember;
import injectRepo from 'bsrs-ember/utilities/inject';
import Step from 'bsrs-ember/utils/step-machine';
import { task } from 'ember-concurrency';
import parseError from 'bsrs-ember/utilities/error-response';

/* MUST BE ORDERED */
const STEPS = [
  'work-orders/new/step-1',
  'work-orders/new/step-2',
  'work-orders/new/step-3',
  'work-orders/new/step-4',
];

/* START STEP MACHINE */

/**
 * computed stored in each state b/c need way to enable disabled btn on the fly as the user
 * interacts with the form
 */
class BaseStep extends Step {
  constructor() {
    super(...arguments);
    this.completedClass = 'timeline__item--completed';
    this.activeClass = 'timeline__item--active';
    this.errorClass = 'timeline__item--error';
    this.properties = [];
  }
}

class Step1 extends BaseStep {
  constructor() {
    super(...arguments);
    this.hasNextBtn = true;
    this.nextStep = STEPS[1];
    this.properties = ['provider.id'];
    this.indx = 1;
  }
  computed(model) {
    return computed('model.provider', function() {
      return !model.get('provider.id');
    });
  }
}

class Step2 extends BaseStep {
  constructor() {
    super(...arguments);
    this.hasNextBtn = true;
    this.hasBackBtn = true;
    this.nextStep = STEPS[2];
    this.prevStep = STEPS[0];
    this.properties = ['approved_amount', 'scheduled_date'];
    this.indx = 2;
    this.exitStep = function(model) {
      if (get(model, 'approved_amount')) {
        return;
      }
      const cost_amount = get(model, 'category.cost_amount_or_inherited');
      set(model, 'approved_amount', cost_amount);
    };
  }
  computed(model) {
    return computed('model.scheduled_date', function() {
      return !model.get('scheduled_date');
    });
  } 
}

class Step3 extends BaseStep {
  constructor() {
    super(...arguments);
    this.hasNextBtn = false;
    this.hasBackBtn = true;
    this.hasWorkOrderDispatchBtn = true;
    this.nextStep = STEPS[3];
    this.prevStep = STEPS[1];
    this.indx = 3;
  }
}

class Step4 extends BaseStep {
  constructor() {
    super(...arguments);
    this.lastStep = true;
  }
}

/* END STEP MACHINE */


/* Wrapping Parent that controls the status-tracker component, buttons component, each rendered step component */
export default Component.extend({
  workOrderRepo: injectRepo('work-order'),

  init() {
    this._super(...arguments);

    const model = this.get('model');
    set(this, 'states', [
      new Step1(STEPS[0], model),
      new Step2(STEPS[1], model),
      new Step3(STEPS[2], model),
      new Step4(STEPS[3], model),
    ]);

    this.setState(get(this, 'states')[0]);

    /* used for btn component */
    Ember.defineProperty(this, 'disabled', get(this, 'states')[0].computed(model));

    /* used for status-tracker component */
    Ember.defineProperty(this, 'disabledStep1', get(this, 'states')[0].computed(model));
    Ember.defineProperty(this, 'disabledStep2', get(this, 'states')[1].computed(model));
  },

  componentRendered: computed('currentStateRendered', function() {
    return get(this, 'currentStateRendered').componentName;
  }).readOnly(),

  /**
   * @method setState
   */
  setState(state) {
    state.enter();

    if (state.lastStep) {
      set(this, 'allStepsCompleted', true);
    }

    return set(this, 'currentStateRendered', state);
  },
  /**
   * @method getState
   * @param {String} step_name - get step asked for
   * @return {Class} - state based on param passed
  */
  getState(step_name) {
    const states = get(this, 'states');
    return states.filter((state) => {
      return state.componentName === step_name; 
    })[0];
  },
  /**
   * calls exit function
   * @method exitState
   * @param {Object} - next properties (can be passed nothing)
   */
  exitState({ next } = {}) {
    const state = get(this, 'currentStateRendered');
    state.exit({ next });
  },
  saveWorkOrderTask: task(function * (work_order) {
    try {
      yield get(this, 'dispatchWorkOrder')(work_order);
      const currentStateRendered = get(this, 'currentStateRendered');
      this.send('next', currentStateRendered.nextStep);
    }
    catch (xhr) {
      if (xhr.status >= 400) {
        const error = parseError(xhr.status, xhr.responseText);
        this.setProperties({ saveError: error.message, level: error.level });
      }
    }
  }),

  actions: {

    /**
     * called from status-tracker component
     * no-op transitioning if on same component as indx
     * determines going forward or backwards depending on position relative to steps array
     * @method determineStep
     * @param {String} transition_to_step
     */
    determineStep(transition_to_step) {
      const currentState = get(this, 'currentStateRendered');
      const currentIndx = currentState.indx;
      const nextStepIndx = this.getState(transition_to_step).indx;

      if (currentIndx === nextStepIndx) {
        // you are on the step you clicked
        return;

      } else if (nextStepIndx > currentIndx) {
        this.send('next', transition_to_step);

      } else {
        this.send('back', transition_to_step);
      }
    },
    /**
     * Doesnt need to check if model is g2g as this is delegated to disabled computed
     * Does need to determine which component to render
     * Could step1 and going to step2 - status-tracker or buttons component
     * Could be you are on step1 and going to step3 - status-tracker component ONLY
     * next cannot go to step1
     * @method next
     * @param {String} next_step - component you are trying to go to
     */
    next(next_step) {
      this.exitState({next: true});

      const nextStepState = this.getState(next_step);

      const currentStateRendered = this.setState(nextStepState);

      const model = get(this, 'model');
      if (next_step === STEPS[1]) {
        set(this, 'disabled', currentStateRendered.computed(model));
      }
    },
    /*
     * can go back to step1, step2
     * cannot go back to step3
     * @method back
     * @param {String} prev_step
     */
    back(prev_step) {
      this.exitState();

      const prevStepState = this.getState(prev_step);

      this.setState(prevStepState);

      if (prev_step === STEPS[0]) {
        set(this, 'disabled', undefined);
      }
    },
    /**
     * closes modal
     * @method cancel
     */
    cancel() {
      get(this, 'cancel')();
    },
    /**
     * @method dispatchWorkOrder
     */
    dispatchWorkOrder(work_order) {
      get(this, 'saveWorkOrderTask').perform(work_order);
    },
    /**
     * @method dismissErros
     */
    dismiss_errors() {
      this.setProperties({'saveError': null, 'level': null});
    }
  },

  /**
   * @property allStepsCompleted
   * @type {Boolean}
   * @default false
   */
  allStepsCompleted: false,

  /*
    saveError for display at the application level for notices

    @property saveError
    @type String|null
    @default null
  */
  saveError: null,

  /*
    Level of notice to display for application level for saveError messages.

    E.g. `critical`, `error`, `warning`, `info`, `success`

    @property level
    @type String|null
    @default null
  */
  level: null
});
