from routing.models import Assignment, ProfileFilter
from person.tests.factory import create_single_person
from ticket.models import TicketPriority, TicketStatus
from utils.create import random_lorem
from utils.helpers import create_default


def create_ticket_priority_filter():
    priority = create_default(TicketPriority)
    return ProfileFilter.objects.create(field='priority',
                                        criteria=[str(priority.id)])


def create_ticket_status_filter():
    status = create_default(TicketStatus)
    return ProfileFilter.objects.create(field='status',
                                        criteria=[str(status.id)])


def create_assignment(description=None):
    kwargs = {'description': description or random_lorem(1)}
    try:
        assignment = Assignment.objects.get(**kwargs)
    except Assignment.DoesNotExist:
        kwargs['assignee'] = create_single_person()
        assignment = Assignment.objects.create(**kwargs)

        priority_filter = create_ticket_priority_filter()
        status_filter = create_ticket_status_filter()
        assignment.filters.add(priority_filter, status_filter)

    return assignment


def create_assignments():
    for i in range(10):
        create_assignment()
