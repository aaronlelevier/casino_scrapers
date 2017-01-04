from collections import namedtuple
import random
import sys
import uuid

from model_mommy import mommy

from automation.tests.factory import create_automation
from category.models import Category, CategoryStatus
from category.tests.factory import create_repair_category, create_single_category
from dtd.models import TreeData
from generic.tests.factory import create_file_attachment, create_image_attachment
from location.models import Location, LocationStatus, LocationType, LOCATION_COMPANY
from location.tests.factory import create_locations
from person.models import Person
from person.tests.factory import create_single_person
from tenant.tests.factory import get_or_create_tenant
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity,)
from ticket.tests.factory_related import (create_ticket_status, create_ticket_statuses,
    create_ticket_priorities)
from utils.create import _generate_chars
from utils.helpers import generate_uuid, create_default


class RegionManagerWithTickets(object):
    """
    Refer to this grid for ticket config:
    https://docs.google.com/spreadsheets/d/1IhSbGCppJfS6sXpK-9nJIdAPlnLf5RhnjiJPYUvnE_0/edit#gid=0
    """
    def __init__(self):
        create_default(LocationStatus)
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
    """Main Ticket create function"""

    people = Person.objects.all()

    request = request or _generate_chars()

    try:
        assignee = assignee or random.choice(people)
    except IndexError:
        # will occur if assignee=None, and now Person records in DB
        assignee = create_single_person()

    status = random.choice(create_ticket_statuses())
    priority = random.choice(create_ticket_priorities())

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

    ticket.cc.add(assignee)

    if add_attachment:
        a = create_file_attachment()
        ticket.attachments.add(a)

    # # Already have a created ticket, dt_path is snapshot of ticket at previous time and dtd at that time.
    # # By having conditional, it prevents from this code from running in all other ticket tests
    # start_dtd = TreeData.objects.get_start()
    # if start_dtd:
    #     destination = start_dtd.links.first().destination
    #     destination_id = str(destination.id) if destination else None
    #     # Create dt_path which are the old dt objects which should be the START DTD
    #     # DTD Fields are an array (id, label, value, required, options) where options is an array of ids
    #     dtd_obj = {
    #         'id': str(start_dtd.id),
    #         'description': start_dtd.description,
    #         'prompt': start_dtd.prompt,
    #         'note': start_dtd.note,
    #         'fields': []
    #     }
    #     fields = start_dtd.fields.all()
    #     # create dtd_obj w/ all fields using dict comprehension
    #     for field in fields:
    #         dtd_obj['fields'].append({
    #             'id': str(field.id),
    #             'value': _generate_chars() if not field.type == 'admin.dtd.label.field.number' else 1234,
    #             'required': 'true' if field.required else 'false',
    #             'label': field.label,
    #             'options': [str(opt.id) for opt in field.options.all() if opt]
    #         })
    #     # second item in array is partially done with a field value and no label
    #     ticket.dt_path = [{
    #         'dtd': dtd_obj,
    #         'ticket': {
    #             'id': str(ticket.id),
    #             'request': 'existing request',
    #             'status': str(ticket.status.id),
    #             'priority': str(ticket.priority.id),
    #             'requester': ticket.requester,
    #             'location': str(ticket.location.id)
    #             }
    #         }, {
    #         'dtd': {
    #             'id': destination_id,
    #             'description': 'You are almost done',
    #             'fields': [{'id': str(uuid.uuid4()), 'value': 'partially done', 'required': 'false'}]
    #             }
    #         }]

    ticket.save()

    return ticket


def create_ticket(request=None, assignee=None, add_attachment=False):
    ticket = _create_ticket(request, assignee, add_attachment)
    top_level_category = Category.objects.filter(parent__isnull=True).first()
    tree = construct_tree(top_level_category, [])
    for category in tree:
        ticket.categories.add(category)
    return ticket


def create_tickets(_many=1):
    return [create_ticket() for x in range(_many)]


def create_standard_ticket(assignee=None):
    ticket = _create_ticket(assignee=assignee)
    ticket.status = create_default(TicketStatus)
    ticket.priority = create_default(TicketPriority)
    ticket.save()
    return ticket


class TicketWithActivities(object):
    """
    Creates a ticket with a TicketActivity of each type.

    For use with TicketAcivity templating, and other areas of the
    app where we need this fixture data.
    """
    def __init__(self, **kwargs):
        self.person = create_single_person()
        self.person_two = create_single_person()
        self.status = create_default(TicketStatus)
        self.status_two = mommy.make(TicketStatus, name=TicketStatus.IN_PROGRESS)
        self.priority = create_default(TicketPriority)
        self.priority_two = mommy.make(TicketPriority, name=TicketPriority.EMERGENCY)
        self.category = create_repair_category()
        self.category_two = create_single_category()
        self.attachment = create_image_attachment()

    def create(self):
        self._ticket = create_standard_ticket(assignee=self.person)
        self._ticket.attachments.add(self.attachment)

        # TicketActivities
        create_ticket_activity_types()
        kwargs = {
            'ticket': self._ticket,
            'person': self.person
        }

        # create
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.CREATE)
        TicketActivity.objects.create(**kwargs)
        # assignee
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.ASSIGNEE)
        kwargs['content'] = {'from': str(self.person.id), 'to': str(self.person_two.id)}
        TicketActivity.objects.create(**kwargs)
        # cc_add
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.CC_ADD)
        kwargs['content'] = {'0': str(self.person_two.id)}
        TicketActivity.objects.create(**kwargs)
        # cc_remove
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.CC_REMOVE)
        kwargs['content'] = {'0': str(self.person.id)}
        TicketActivity.objects.create(**kwargs)
        # status
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.STATUS)
        kwargs['content'] = {'from': str(self.status.id), 'to': str(self.status_two.id)}
        TicketActivity.objects.create(**kwargs)
        # priority
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.PRIORITY)
        kwargs['content'] = {'from': str(self.priority.id), 'to': str(self.priority_two.id)}
        TicketActivity.objects.create(**kwargs)
        # categories
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.CATEGORIES)
        kwargs['content'] = {'from_0': str(self.category.id), 'to_0': str(self.category_two.id)}
        TicketActivity.objects.create(**kwargs)
        # comment
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.COMMENT)
        kwargs['content'] = {'comment': 'foo'}
        TicketActivity.objects.create(**kwargs)
        # attachment_add
        kwargs['type'] = TicketActivityType.objects.get(name=TicketActivityType.ATTACHMENT_ADD)
        kwargs['content'] = {'0': str(self.attachment.id)}
        TicketActivity.objects.create(**kwargs)

    @property
    def ticket(self):
        return self._ticket


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
    tenant = get_or_create_tenant()
    create_default(CategoryStatus)
    loss_prevention, _ = Category.objects.get_or_create(name="Loss Prevention", tenant=tenant, subcategory_label="trade")
    locks, _ = Category.objects.get_or_create(name="Locks", tenant=tenant, parent=loss_prevention, subcategory_label="issue")
    a_locks, _ = Category.objects.get_or_create(name="A Lock", tenant=tenant, parent=locks)
    # Ticket
    create_default(TicketStatus)
    create_default(LocationStatus)
    create_default(LocationType)
    seven = mommy.make(Ticket, request="seven")
    # Join them
    seven.categories.add(loss_prevention)
    seven.categories.add(locks)
    seven.categories.add(a_locks)


def create_ticket_activity(ticket=None, type=None, content=None, **kwds):
    type = create_ticket_activity_type(name=type)
    ticket = ticket or create_ticket()

    kwargs = {
        'type': type,
        'ticket': ticket,
        'content': content
    }

    if kwds.get('automation'):
        kwargs.update({'automation': create_automation()})
    else:
        kwargs.update({'person': ticket.assignee})

    return mommy.make(TicketActivity, **kwargs)


def create_ticket_activity_type(name=None, weight=1):
    if not name:
        name = random.choice(TicketActivityType.ALL)

    obj, _ = TicketActivityType.objects.get_or_create(name=name, weight=weight)

    return obj


def create_ticket_activity_types():
    return [create_ticket_activity_type(name=name) for name in TicketActivityType.ALL]
