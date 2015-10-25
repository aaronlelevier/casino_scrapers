var BSRS_TICKET_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'bf2b9c85-f6bd-4345-9834-c5d51de53d01',
            idTwo: '6ff90fb2-17ca-434d-9943-4035ea386b13',
            unusedId: 'cadba3ba-a533-44e0-ab1f-57cc1b056789',
            numberOne: '123zz',
            requestOne: 'working',
            numberTwo: '456zz',
            subjectOne: 'Plumbing Fixtures',
            subjectTwo: 'Roof Repair',
            statusOneId: '5ab9b1fb-c624-4214-bb4c-16567b3d37e6',
            statusOne: 'ticket.status.new',
            statusTwoId: 'e30f3033-ae2a-4af6-9d3a-ea7c98056c1d',
            statusTwo: 'ticket.status.deferred',
            statusThreeId: '3ca0de41-540a-423b-84ca-a48add0acbdf',
            statusThree: 'ticket.status.in_progress',
            statusFourId: 'ba2ed214-269b-455b-af40-fe4d74fa9551',
            statusFour: 'ticket.status.complete',
            statusFiveId: '2926a989-3192-4f8f-9a37-cfb3985d0821',
            statusFive: 'ticket.status.denied',
            statusSixId: 'e845fd81-1fef-4eee-ad38-7460c818854a',
            statusSix: 'ticket.status.problem_solved',
            statusSevenId: 'dfa1f64f-d0d7-4915-be85-54b8c38d3aeb',
            statusSeven: 'ticket.status.draft',
            statusEightId: '820dfa6c-003b-42f4-8f10-6b78f8b40c6a',
            statusEight: 'ticket.status.unsatisfactory_completion',
            priorityOneId: 'dfe28a24-307f-4da0-85e7-cdac016808c0',
            priorityOne: 'ticket.priority.emergency',
            priorityTwoId: '2a4c8c9c-7acb-44ca-af95-62a84e410e09',
            priorityTwo: 'ticket.priority.high',
            priorityThreeId: 'd7c1cc5c-eecd-49f0-bf46-c1ec489271ae',
            priorityThree: 'ticket.priority.medium',
            priorityFourId: '7562051b-f5b7-40bf-a640-5c4cfb3a72a8',
            priorityFour: 'ticket.priority.low',
            locationOneId: 'efe28a24-307f-4da0-85e7-cdac016808c1',
            locationOne: 'General Mart',
            locationTwoId: '3a4c8c9c-7acb-44ca-af95-62a84e410e08',
            locationTwo: 'Low Street General Mart',
            locationThreeId: 'e7c1cc5c-eecd-49f0-bf46-c1ec489271ad',
            locationThree: 'Medium Street General Mart',
            locationFourId: '8562051b-f5b7-40bf-a640-5c4cfb3a72a9',
            locationFour: 'High Street General Mart',
            assigneeOneId: 'c05f20b0-cf6b-4650-a188-2e376d12f116',
            assigneeOne: 'Random1',
            assigneeTwoId: 'c05f20b0-cf6b-4650-a188-2e376d12f117',
            assigneeTwo: 'Random2',
            requestOneGrid: 'sub1',
            requestLastGrid: 'ape11',
            requestLastPage2Grid: 'ape19',
            subjectOneGrid: 'diagram1',
            requestFourGrid: 'sub4',
            requestOtherGrid: 'sub10',
            requestFourteenGrid: 'ape14'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_TICKET_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/ticket', ['exports'], function (exports) {
        'use strict';
        return new BSRS_TICKET_DEFAULTS_OBJECT().defaults();
    });
}


