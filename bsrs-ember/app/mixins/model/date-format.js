import Ember from 'ember';
import moment from 'moment';

var DateFormatMixin = Ember.Mixin.create({
    formatted_date: Ember.computed('created', function() {
        const date = this.get('created');
        const time = moment(date).format('h:mm a');
        const diff = date ? moment().diff(date, 'days') : undefined;
        switch(diff) {
            case 0:
                return `Today at ${time}`;
            case 1:
                return `Yesterday at ${time}`;
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                const weekday = moment(date).format('dddd');
                return `${weekday} at ${time}`;
            case undefined:
                return undefined;
            default:
                const date_slash = moment(date).format('MM/DD');
                return `${date_slash} at ${time}`;
        }
    })
});

export default DateFormatMixin;
