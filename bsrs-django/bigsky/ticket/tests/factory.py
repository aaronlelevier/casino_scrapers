import random

from model_mommy import mommy

from person.models import Person
from category.models import Category
from category.tests.factory import create_categories
from location.models import Location
from location.tests.factory import create_locations
from person.tests.factory import create_single_person
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


def create_ticket():
    if not Location.objects.first():
        create_locations()

    statuses = create_ticket_statuses()
    priorities = create_ticket_priorites()
    people = Person.objects.all()

    incr = Ticket.objects.count()
    id = generate_uuid(TICKET_BASE_ID, incr+1)

    ticket = Ticket.objects.create(
        id = id,
        location = random.choice(Location.objects.all()),
        status = random.choice(statuses),
        priority = random.choice(priorities),
        assignee = random.choice(people),
        requester = random.choice(people),
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


def create_ticket_status(name=None):
    if not name:
        name = random.choice(TICKET_STATUSES)

    obj, _ = TicketStatus.objects.get_or_create(name=name)

    return obj


def create_ticket_statuses():
    return [create_ticket_status(s) for s in TICKET_STATUSES]


def create_ticket_priority(name=None):
    if not name:
        name = random.choice(TICKET_PRIORITIES)

    obj, _ = TicketPriority.objects.get_or_create(name=name)

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
