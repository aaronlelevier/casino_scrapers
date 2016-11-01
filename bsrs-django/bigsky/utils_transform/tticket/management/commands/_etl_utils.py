import re

import logging
logger = logging.getLogger(__name__)

from utils_transform.tticket.models import DominoTicket

from category.models import Category, LABEL_TYPE, LABEL_TRADE, LABEL_ISSUE
from location.models import Location, LOCATION_STORE
from person.models import Person
from ticket.models import Ticket, TicketStatus, TicketPriority


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
                'completion_date': dt.complete_date,
                'legacy_ref_number': dt.ref_number
            })
            categories = get_categories(dt)
        except (Location.DoesNotExist, Location.MultipleObjectsReturned, Category.DoesNotExist,
                Category.MultipleObjectsReturned, Person.DoesNotExist):
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
    except Category.MultipleObjectsReturned:
        logger.info("Level: {level}; Label: {label}; Name: {name} MultipleObjectsReturned".format(**kwargs))
        raise


def format_subject_and_request(*args):
    s = ''.join(['{}\n'.format(a) for a in args])
    return re.sub(r'\n+$', '', s)


def get_assignee(fullname):
    try:
        return Person.objects_all.get(fullname=fullname)
    except Person.DoesNotExist:
        logger.info("Assignee: {} DoesNotExist".format(fullname))
        raise


def get_status(i):
    name = TicketStatus.ALL[int(i)-1]
    return TicketStatus.objects.get(name=name)


def get_priority(i):
    name = TicketPriority.ALL[int(i)-1]
    return TicketPriority.objects.get(name=name)
