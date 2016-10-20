import random

from ticket.models import TicketStatus, TicketPriority
from utils.helpers import generate_uuid


def create_ticket_status(name=None):
    id = generate_uuid(TicketStatus)
    if not name:
        name = random.choice(TicketStatus.ALL)
    try:
        obj = TicketStatus.objects.get(name=name)
    except TicketStatus.DoesNotExist:
        obj = TicketStatus.objects.create(id=id, name=name)
    return obj


def create_ticket_statuses():
    [create_ticket_status(s) for s in TicketStatus.ALL]
    return TicketStatus.objects.all()


def create_ticket_priority(name=None):
    id = generate_uuid(TicketPriority)

    if not name:
        name = random.choice(TicketPriority.ALL)

    try:
        obj = TicketPriority.objects.get(name=name)
    except TicketPriority.DoesNotExist:
        obj = TicketPriority.objects.create(id=id, name=name)

    return obj


def create_ticket_priorities():
    [create_ticket_priority(p) for p in TicketPriority.ALL]
    return TicketPriority.objects.all()
