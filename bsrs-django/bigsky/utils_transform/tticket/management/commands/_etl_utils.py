from utils_transform.tticket.models import DominoTicket

from location.models import Location, LOCATION_STORE
from ticket.models import Ticket, TicketStatus, TicketPriority


status_map = {
    '1': 'ticket.status.new',
    '2': 'ticket.status.deferred',
    '3': 'ticket.status.in_progress',
    '4': 'ticket.status.complete',
    '5': 'ticket.status.denied',
    '6': 'ticket.status.problem_solved',
    '7': 'ticket.status.draft',
    '8': 'ticket.status.unsatisfactory_completion',
    '9': 'ticket.status.canceled',
    '10': 'ticket.status.pending'
}

priority_map = {
    '1': 'ticket.priority.emergency',
    '2': 'ticket.priority.high',
    '3': 'ticket.priority.medium',
    '4': 'ticket.priority.low',
}


def run_ticket_migrations():
    for dt in DominoTicket.objects.all():
        try:
            location = get_location(dt.location_number)
            status = get_status(dt.status)
            priority = get_priority(dt.priority)
        except Exception:
            # log dt that failed - location_number and ref_number
            raise

        Ticket.objects.create(location=location, status=status, priority=priority)


def get_location(number):
    try:
        return Location.objects.get(number=number, location_level__name=LOCATION_STORE)
    except Location.DoesNotExist:
        # log
        raise
    except Location.MultipleObjectsReturned:
        # log
        raise


def get_status(status):
    try:
        name = status_map[status]
    except KeyError:
        # log
        raise
    return TicketStatus.objects.get(name=name)


def get_priority(priority):
    try:
        name = priority_map[priority]
    except KeyError:
        # log
        raise
    return TicketPriority.objects.get(name=name)
