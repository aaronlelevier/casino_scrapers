from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person
from routing.models import Assignment, ProfileFilter
from ticket.models import TicketPriority
from utils.create import random_lorem
from utils.helpers import create_default


def create_ticket_priority_filter():
    priority = create_default(TicketPriority)
    return ProfileFilter.objects.create(key='admin.placeholder.ticket_priority',
                                        field='priority', criteria=[str(priority.id)])


def create_ticket_location_filter():
    location = create_top_level_location()
    return ProfileFilter.objects.create(key='admin.placeholder.location_store',
                                        field='location', criteria=[str(location.id)])


def create_assignment(description=None, tenant=None, **kwargs):
    kwargs.update({
        'description': description or random_lorem(1),
        'tenant': tenant
    })

    try:
        assignment = Assignment.objects.get(**kwargs)
    except Assignment.DoesNotExist:
        kwargs['assignee'] = create_single_person()
        assignment = Assignment.objects.create(**kwargs)

        priority_filter = create_ticket_priority_filter()
        location_filter = create_ticket_location_filter()
        assignment.filters.add(priority_filter, location_filter)

    return assignment


def create_assignments():
    for i in range(10):
        create_assignment()
