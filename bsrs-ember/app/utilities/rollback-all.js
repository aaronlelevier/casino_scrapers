import Ember from 'ember';

var rollbackAll = (models) => {
    models.forEach((model) => {
        model.rollback();
    });
};

export {rollbackAll};