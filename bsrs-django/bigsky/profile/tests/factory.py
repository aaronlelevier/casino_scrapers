from profile.models import Assignment, ProfileFilter
from person.tests.factory import create_single_person
from ticket.models import TicketPriority
from utils.create import random_lorem
from utils.helpers import create_default


def create_assignment(description=None):
    kwargs = {'description': description or random_lorem(1)}
    try:
        return Assignment.objects.get(**kwargs)
    except Assignment.DoesNotExist:
        kwargs['assignee'] = create_single_person()
        return Assignment.objects.create(**kwargs)

def create_assignments():
    for i in range(10):
        create_assignment()


def create_profile_filter():
    priority = create_default(TicketPriority)

    pf = ProfileFilter.objects.create(field='priority',
                                      criteria=[str(priority.id)])

    assignment = create_assignment()
    assignment.filters.add(pf)

    return pf
