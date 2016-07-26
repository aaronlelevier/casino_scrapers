from collections import namedtuple

from model_mommy import mommy

from category.models import Category
from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person
from routing.models import Assignment, ProfileFilter, AvailableFilter
from tenant.tests.factory import get_or_create_tenant
from ticket.models import TicketPriority
from utils.create import random_lorem
from utils.helpers import create_default


REPAIR = 'Repair'


def create_ticket_priority_filter():
    priority = create_default(TicketPriority)
    return ProfileFilter.objects.create(key='admin.placeholder.ticket_priority',
                                        field='priority', criteria=[str(priority.id)])

def create_ticket_location_filter():
    location = create_top_level_location()
    return ProfileFilter.objects.create(key='admin.placeholder.location_store',
                                        field='location', criteria=[str(location.id)])


def create_ticket_categories_filter():
    try:
        category = Category.objects.get(name=REPAIR)
    except Category.DoesNotExist:
        category = mommy.make(Category, name=REPAIR)
    return ProfileFilter.objects.create(key='admin.placeholder.category_filter',
                                        field='categories', criteria=[str(category.id)])


def create_assignment(description=None, tenant=None):
    kwargs = {
        'description': description or random_lorem(1),
        'tenant': tenant or get_or_create_tenant()
    }

    try:
        assignment = Assignment.objects.get(**kwargs)
    except Assignment.DoesNotExist:
        kwargs['assignee'] = create_single_person()
        assignment = Assignment.objects.create(**kwargs)

        priority_filter = create_ticket_priority_filter()
        category_filter = create_ticket_categories_filter()
        assignment.filters.add(priority_filter, category_filter)

    return assignment


def create_assignments():
    for i in range(10):
        create_assignment()


def create_available_filter():
    try:
        return AvailableFilter.objects.get(key='admin.placeholder.ticket_priority')
    except AvailableFilter.DoesNotExist:
        return AvailableFilter.objects.create(key='admin.placeholder.ticket_priority',
                                              field='priority')


def create_available_filters():
    # key, key_is_i18n, field, lookups
    AVAILABLE_FILTERS = [
        ('admin.placeholder.ticket_priority', True, 'priority', {}),
        ('admin.placeholder.category_filter', True, 'categories', {}),
        ('', False, 'location', {'filters': 'location_level'})
    ]


    for x in AVAILABLE_FILTERS:
        AFData = namedtuple('AFData', ['key', 'key_is_i18n', 'field', 'lookups'])
        data = AFData._make(x)._asdict()

        try:
            AvailableFilter.objects.get(key=data['key'])
        except AvailableFilter.DoesNotExist:
            AvailableFilter.objects.create(**data)
