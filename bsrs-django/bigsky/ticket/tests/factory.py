import random

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from location.models import Location
from location.tests.factory import create_locations
from person.tests.factory import create_single_person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES, TICKET_ACTIVITY_TYPES)
from utils.create import _generate_chars


def create_ticket():
    if not Location.objects.all().exists():
        create_locations()

    if not Category.objects.all().exists():
        create_categories()
        
    create_ticket_statuses()
    create_ticket_priorites()

    ticket = Ticket.objects.create(
        location = random.choice(Location.objects.all()),
        status = random.choice(TicketStatus.objects.all()),
        priority = random.choice(TicketPriority.objects.all()),
        assignee = create_single_person(),
        requester = create_single_person(),
        request = _generate_chars()
    )
    ticket.cc.add(create_single_person())
    top_level_category = Category.objects.filter(parent__isnull=True).first()
    ticket.categories.add(top_level_category)
    for child in top_level_category.children.all():
        ticket.categories.add(child)
    return ticket


def create_tickets(_many=1):
    return [create_ticket() for x in range(_many)]


def create_ticket_status(name=None):
    if not name:
        name = random.choice(TICKET_STATUSES)

    obj, _ = TicketStatus.objects.get_or_create(name=name)

    return obj


def create_ticket_statuses():
    for status in TICKET_STATUSES:
        TicketStatus.objects.get_or_create(name=status)


def create_ticket_priority(name=None):
    if not name:
        name = random.choice(TICKET_PRIORITIES)

    obj, _ = TicketPriority.objects.get_or_create(name=name)

    return obj


def create_ticket_priorites():
    for priority in TICKET_PRIORITIES:
        TicketPriority.objects.get_or_create(name=priority)


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
