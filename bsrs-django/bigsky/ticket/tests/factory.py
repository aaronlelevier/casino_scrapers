from collections import namedtuple
import random
import sys
import uuid

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_single_category
from generic.tests.factory import create_file_attachment
from location.models import Location, LOCATION_COMPANY
from location.tests.factory import create_locations
from person.models import Person
from person.tests.factory import create_single_person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES, TICKET_ACTIVITY_TYPES)
from utils.create import _generate_chars
from utils.helpers import generate_uuid


class RegionManagerWithTickets(object):
    """
    Refer to this grid for ticket config:
    https://docs.google.com/spreadsheets/d/1IhSbGCppJfS6sXpK-9nJIdAPlnLf5RhnjiJPYUvnE_0/edit#gid=0
    """
    def __init__(self):
        self.setup_locations()
        self.setup_categories()
        self.setup_ticket_statuses()

        self.setup_tickets()

    def setup_locations(self):
        create_locations()
        self.top_location = Location.objects.get(name=LOCATION_COMPANY)
        self.location = (Location.objects.exclude(id=self.top_location.id)
                                         .filter(children__isnull=False).first())
        self.child_location = self.location.children.first()
        self.other_location = Location.objects.exclude(
            id__in=[self.top_location.id, self.location.id, self.child_location.id]).first()

    def setup_categories(self):
        self.category = create_single_category('Repair')
        self.other_category = create_single_category('Maintenance')

    def setup_ticket_statuses(self):
        self.status = create_ticket_status('ticket.status.draft')
        self.other_status = create_ticket_status('ticket.status.new')

    def setup_tickets(self):
        for x in self.ticket_config:
            TicketData = namedtuple('TicketData', ['location', 'category', 'status'])
            data = TicketData._make(x)._asdict()
            category = data.pop('category', None)
            ticket = mommy.make(Ticket, **data)
            if category:
                ticket.categories.add(category)

    @property
    def ticket_config(self):
        """
        (Location, Category, TicketStatus)
        """
        return [
            (self.top_location, None, self.status),
            (self.top_location, self.category, self.status),
            (self.top_location, self.other_category, self.status),
            (self.top_location, self.other_category, self.other_status),

            (self.location, None, self.status),
            (self.location, self.category, self.status),
            (self.location, self.other_category, self.status),
            (self.location, self.other_category, self.other_status),

            (self.child_location, None, self.status),
            (self.child_location, self.category, self.status),
            (self.child_location, self.other_category, self.status),
            (self.child_location, self.other_category, self.other_status),

            (self.other_location, None, self.status),
            (self.other_location, self.category, self.status),
            (self.other_location, self.other_category, self.status),
            (self.other_location, self.other_category, self.other_status),
        ]


def construct_tree(category, tree):
    tree.append(category)
    if not category.children.all():
        return [category]
    child_category = category.children.first()
    construct_tree(child_category, tree)
    return tree


def _create_ticket(request=None, assignee=None, add_attachment=False):
    people = Person.objects.all()

    request = request or _generate_chars()
    assignee = assignee or random.choice(people)

    status = get_or_create_ticket_status()
    priority = get_or_create_ticket_priority()

    kwargs = {
        'location': assignee.locations.first(),
        'status': status,
        'priority': priority,
        'requester': _generate_chars(),
        'assignee': assignee,
        'request': request,
    }

    if 'test' in sys.argv:
        id = uuid.uuid4()
    else:
        id = generate_uuid(Ticket)

    ticket = Ticket.objects.create(id=id, **kwargs)
    cc = random.choice(people)
    ticket.cc.add(cc)

    if add_attachment:
        a = create_file_attachment()
        ticket.attachments.add(a)

    return ticket


def get_or_create_ticket_status():
    obj, _ = TicketStatus.objects.get_or_create(name=random.choice(TICKET_STATUSES))
    return obj


def get_or_create_ticket_priority():
    obj, _ = TicketPriority.objects.get_or_create(name=random.choice(TICKET_PRIORITIES))
    return obj


def create_ticket(request=None, assignee=None, add_attachment=False):
    ticket = _create_ticket(request, assignee, add_attachment)
    top_level_category = Category.objects.filter(parent__isnull=True).first()
    tree = construct_tree(top_level_category, [])
    for category in tree:
        ticket.categories.add(category)
    return ticket


def create_tickets(_many=1):
    return [create_ticket() for x in range(_many)]


def create_ticket_with_single_category(request=None, assignee=None):
    ticket = _create_ticket(request, assignee)
    category = ticket.assignee.role.categories.first()
    ticket.categories.add(category)
    return ticket


def create_tickets_with_single_category(assignee=None, _many=0):
    return [create_ticket_with_single_category(assignee=assignee) for x in range(_many)]


def create_extra_ticket_with_categories():
    """
    Used in Ticket / Category ordering tests to test that ordering still holds 
    when new Tickets are added, but the Category would insert them in the middle
    of the ordering.
    """
    # Category
    loss_prevention, _ = Category.objects.get_or_create(name="Loss Prevention", subcategory_label="trade")
    locks, _ = Category.objects.get_or_create(name="Locks", parent=loss_prevention, subcategory_label="issue")
    a_locks, _ = Category.objects.get_or_create(name="A Lock", parent=locks)
    # Ticket
    seven = mommy.make(Ticket, request="seven")
    # Join them
    seven.categories.add(loss_prevention)
    seven.categories.add(locks)
    seven.categories.add(a_locks)


def create_ticket_status(name=None):
    id = generate_uuid(TicketStatus)
    if not name:
        name = random.choice(TICKET_STATUSES)
    try:
        obj = TicketStatus.objects.get(name=name)
    except TicketStatus.DoesNotExist:
        obj = TicketStatus.objects.create(id=id, name=name)
    return obj


def create_ticket_statuses():
    [create_ticket_status(s) for s in TICKET_STATUSES]
    return TicketStatus.objects.all()


def create_ticket_priority(name=None):
    id = generate_uuid(TicketPriority)

    if not name:
        name = random.choice(TICKET_PRIORITIES)

    try:
        obj = TicketPriority.objects.get(name=name)
    except TicketPriority.DoesNotExist:
        obj = TicketPriority.objects.create(id=id, name=name)

    return obj


def create_ticket_priorities():
    [create_ticket_priority(p) for p in TICKET_PRIORITIES]
    return TicketPriority.objects.all()


def create_ticket_activity(ticket=None, type=None, content=None):
    type = create_ticket_activity_type(name=type)
    ticket = ticket or create_ticket()

    return mommy.make(TicketActivity,
        type = type,
        ticket = ticket,
        person = ticket.assignee,
        content = content
    )


def create_ticket_activity_type(name=None, weight=1):
    if not name:
        name = random.choice(TICKET_ACTIVITY_TYPES)

    obj, _ = TicketActivityType.objects.get_or_create(name=name, weight=weight)

    return obj


def create_ticket_activity_types():
    return [create_ticket_activity_type(name=name) for name in TICKET_ACTIVITY_TYPES]
