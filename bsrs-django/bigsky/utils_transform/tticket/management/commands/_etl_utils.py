import logging
logger = logging.getLogger(__name__)

from utils_transform.tticket.models import DominoTicket

from category.models import Category, LABEL_TYPE, LABEL_TRADE, LABEL_ISSUE
from location.models import Location, LOCATION_STORE
from person.models import Person
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
        kwargs = {}
        try:
            kwargs.update({
                'location': get_location(dt.location_number, dt.ref_number),
                'status': get_status(dt.status),
                'priority': get_priority(dt.priority),
                'request': format_subject_and_request(dt.subject, dt.request),
                'assignee': get_assignee(dt.assigned_to),
                'requester': dt.requester,
                'completion_date': dt.complete_date
            })
            categories = get_categories(dt)
        except (Location.DoesNotExist, Location.MultipleObjectsReturned, Category.DoesNotExist,
                Person.DoesNotExist):
            pass
        else:
            ticket = Ticket.objects.create(**kwargs)
            for c in categories:
                ticket.categories.add(c)
            ticket.created = dt.create_date
            ticket.save()


def get_location(loc_number, ref_number):
    try:
        return Location.objects.get(number=loc_number, location_level__name=LOCATION_STORE)
    except Location.DoesNotExist:
        logger.info("{} Location number DoesNotExist for ref # {}".format(loc_number, ref_number))
        raise
    except Location.MultipleObjectsReturned as e:
        logger.info("{} Location number MultipleObjectsReturned for ref # {}".format(loc_number, ref_number))
        raise


def get_categories(dt):
    categories = []
    categories.append(get_category(name=dt.type, label=LABEL_TYPE, level=0))
    categories.append(get_category(name=dt.trade, label=LABEL_TRADE, level=1))
    categories.append(get_category(name=dt.issue, label=LABEL_ISSUE, level=2))
    return categories


def get_category(**kwargs):
    try:
        return Category.objects.get(**kwargs)
    except Category.DoesNotExist:
        logger.info("Level: {level}; Label: {label}; Name: {name} DoesNotExist".format(**kwargs))
        raise


def format_subject_and_request(*args):
    return ''.join(['{}\n'.format(a) for a in args])


def get_assignee(fullname):
    try:
        return Person.objects.get(fullname=fullname)
    except Person.DoesNotExist:
        logger.info("Assignee: {} DoesNotExist".format(fullname))
        raise


def get_status(status):
    name = status_map[status]
    return TicketStatus.objects.get(name=name)


def get_priority(priority):
    name = priority_map[priority]
    return TicketPriority.objects.get(name=name)
