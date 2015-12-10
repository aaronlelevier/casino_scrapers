import random
import sys
import uuid

from model_mommy import mommy

from person.models import Person
from category.models import Category
from location.models import Location
from location.tests.factory import create_locations
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES, TICKET_ACTIVITY_TYPES)
from utils.create import _generate_chars
from utils.helpers import generate_uuid


def construct_tree(category, tree):
    tree.append(category)
    if not category.children.all():
        return category 
    child_category = category.children.first()
    construct_tree(child_category, tree)
    return tree


TICKET_BASE_ID = "40f530c4-ce6c-4724-9cfd-37a16e787"


def create_ticket(requester=None, assignee=None, location=None):
    people = Person.objects.all()

    requester = requester or random.choice(people)
    assignee = assignee or random.choice(people)
    location = location or random.choice(Location.objects.all())

    if not Location.objects.first():
        create_locations()

    statuses = create_ticket_statuses()
    priorities = create_ticket_priorites()

    if 'test' in sys.argv:
        id = uuid.uuid4()
    else:
        incr = Ticket.objects.count()
        id = generate_uuid(TICKET_BASE_ID, incr+1)

    ticket = Ticket.objects.create(
        id = id,
        location = location,
        status = random.choice(statuses),
        priority = random.choice(priorities),
        assignee = assignee,
        requester = requester,
        request = _generate_chars()
    )

    cc = random.choice(people)
    ticket.cc.add(cc)

    top_level_category = Category.objects.filter(parent__isnull=True).first()
    tree = construct_tree(top_level_category, [])
    for category in tree:
        ticket.categories.add(category)

    return ticket


def create_tickets(_many=1):
    return [create_ticket() for x in range(_many)]


TICKET_STATUS_BASE_ID = "def11673-d4ab-41a6-a37f-0c6846b96"


def create_ticket_status(name=None):
    incr = TicketStatus.objects.count()
    id = generate_uuid(TICKET_STATUS_BASE_ID, incr+1)

    if not name:
        name = random.choice(TICKET_STATUSES)

    try:
        obj = TicketStatus.objects.get(name=name)
    except TicketStatus.DoesNotExist:
        obj = TicketStatus.objects.create(id=id, name=name)

    return obj


def create_ticket_statuses():
    return [create_ticket_status(s) for s in TICKET_STATUSES]


TICKET_PRIORITY_BASE_ID = "def21673-d4ab-41a6-a37f-0c6846b96"


def create_ticket_priority(name=None):
    incr = TicketPriority.objects.count()
    id = generate_uuid(TICKET_PRIORITY_BASE_ID, incr+1)

    if not name:
        name = random.choice(TICKET_PRIORITIES)

    try:
        obj = TicketPriority.objects.get(name=name)
    except TicketPriority.DoesNotExist:
        obj = TicketPriority.objects.create(id=id, name=name)

    return obj


def create_ticket_priorites():
    return [create_ticket_priority(p) for p in TICKET_PRIORITIES]


def create_ticket_activity(ticket=None, type=None, content=None):
    type = create_ticket_activity_type(name=type)
    ticket = ticket or create_ticket()

    return mommy.make(TicketActivity,
        type = type,
        ticket = ticket,
        person = ticket.requester,
        content = content
    )


def create_ticket_activity_type(name=None, weight=1):
    if not name:
        name = random.choice(TICKET_ACTIVITY_TYPES)

    obj, _ = TicketActivityType.objects.get_or_create(name=name, weight=weight)

    return obj


def create_ticket_activity_types():
    return [create_ticket_activity_type(name=name) for name in TICKET_ACTIVITY_TYPES]
