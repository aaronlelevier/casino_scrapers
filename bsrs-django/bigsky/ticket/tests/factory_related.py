import random

from ticket.models import (TicketStatus, TicketPriority, TICKET_STATUSES,
        TICKET_PRIORITIES, TICKET_STATUS_NEW, TICKET_PRIORITY_DEFAULT)
from utils.helpers import generate_uuid


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
