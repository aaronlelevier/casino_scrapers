from datetime import datetime
import sys

from django.db.models import Max
from django.utils.timezone import now
from django.test import TestCase

from automation.models import Automation
from category.models import Category
from category.tests.factory import create_categories
from dtd.tests.factory import create_dtd_fixture_data
from dtd.models import TreeData
from generic.models import Attachment
from location.models import Location, LOCATION_COMPANY
from person.models import Person
from person.tests.factory import create_single_person, DistrictManager
from tenant.tests.factory import get_or_create_tenant
from ticket.models import Ticket, TicketStatus, TicketPriority, TicketActivityType, TicketActivity
from ticket.tests import factory, factory_related
from utils.helpers import generate_uuid
from work_order.models import WorkOrder


class RegionManagerWithTicketsTests(TestCase):

    def setUp(self):
        self.rm = factory.RegionManagerWithTickets()

    def test_setup_locations(self):
        self.assertEqual(self.rm.top_location.name, LOCATION_COMPANY)
        self.assertIsInstance(self.rm.location, Location)
        self.assertIn(self.rm.child_location, self.rm.location.children.all())
        self.assertNotIn(self.rm.other_location, self.rm.location.children.all())

    def test_setup_categories(self):
        self.assertEqual(self.rm.category.name, 'Repair')
        self.assertEqual(self.rm.other_category.name, 'Maintenance')

    def test_setup_ticket_statuses(self):
        self.assertEqual(self.rm.status.name, 'ticket.status.draft')
        self.assertEqual(self.rm.other_status.name, 'ticket.status.new')

    def test_setup_tickets(self):
        self.assertEqual(Ticket.objects.count(), 16)
        self.assertEqual(Ticket.objects.filter(categories__isnull=True).count(), 4)
        self.assertEqual(Ticket.objects.filter(location=self.rm.top_location,
                                               status=self.rm.other_status).count(), 1)
        self.assertEqual(Ticket.objects.filter(location=self.rm.location,
                                               status=self.rm.other_status).count(), 1)
        self.assertEqual(Ticket.objects.filter(location=self.rm.child_location,
                                               status=self.rm.other_status).count(), 1)
        self.assertEqual(Ticket.objects.filter(location=self.rm.other_location,
                                               status=self.rm.other_status).count(), 1)


class CreateTicketTests(TestCase):

    def setUp(self):
        create_dtd_fixture_data()
        create_categories()
        self.person = create_single_person()
        # Put before create_ticket to ensure building dt_path has DT objects to pull from
        self.ticket = factory.create_ticket()

    def test_location(self):
        self.assertIsInstance(self.ticket.location, Location)
        self.assertIn(
            self.ticket.location,
            self.person.locations.all()
        )

    def test_status(self):
        self.assertIsInstance(self.ticket.status, TicketStatus)

    def test_priority(self):
        self.assertIsInstance(self.ticket.priority, TicketPriority)

    def test_assignee(self):
        self.assertIsInstance(self.ticket.assignee, Person)

    def test_assignee__create_person_if_none(self):
        Person.objects.all().delete()
        self.assertEqual(Person.objects.count(), 0)

        ticket = factory.create_ticket()

        self.assertEqual(Person.objects.count(), 1)
        self.assertEqual(ticket.assignee, Person.objects.first())

    def test_cc(self):
        self.assertIsInstance(self.ticket.cc.all()[0], Person)

    def test_category(self):
        self.assertIsInstance(self.ticket.categories.all()[0], Category)

    def test_attachments(self):
        ticket = factory.create_ticket(add_attachment=True)
        self.assertEqual(ticket.attachments.count(), 1)
        self.assertIsInstance(ticket.attachments.first(), Attachment)

    def test_request(self):
        self.assertIsInstance(self.ticket.request, str)

    def test_number(self):
        number = 100
        self.ticket.number = number
        self.ticket.save()
        self.assertEqual(Ticket.objects.all().aggregate(Max('number'))['number__max'], number)

        ticket = factory.create_ticket()

        self.assertIsInstance(ticket.number, int)
        self.assertEqual(ticket.number, number+1)

    def test_completion_date(self):
        self.assertIsNone(self.ticket.completion_date)
        self.ticket.completion_date = now()
        self.ticket.save()
        self.assertIsInstance(self.ticket.completion_date, datetime)

    def test_creator(self):
        self.assertIsNone(self.ticket.creator)
        self.ticket.creator = self.person
        self.ticket.save()
        self.assertIsInstance(self.ticket.creator, Person)


class CreateStandardTicketTests(TestCase):

    def setUp(self):
        create_dtd_fixture_data()
        create_categories()
        self.person = create_single_person()

    def test_main(self):
        ticket = factory.create_standard_ticket()

        self.assertIsInstance(ticket, Ticket)
        self.assertEqual(ticket.status.name, TicketStatus.NEW)
        self.assertEqual(ticket.priority.name, TicketPriority.MEDIUM)


class CreateTicketWithActivitiesTests(TestCase):

    def test_main(self):
        twa = factory.TicketWithActivities()
        twa.create()
        ticket = twa.ticket

        # local VARs
        person = twa.person
        person_two = twa.person_two
        status = twa.status
        status_two = twa.status_two
        priority = twa.priority
        priority_two = twa.priority_two
        category = twa.category
        category_two = twa.category_two
        attachment = twa.attachment

        # overall tests
        self.assertIsInstance(ticket, Ticket)
        self.assertEqual(ticket.activities.count(), 9)
        self.assertEqual(ticket.cc.count(), 1)
        self.assertEqual(ticket.cc.first(), person)
        self.assertEqual(ticket.assignee, person)
        self.assertEqual(ticket.status, status)
        self.assertEqual(ticket.priority, priority)
        # create
        create_activity = ticket.activities.get(type__name=TicketActivityType.CREATE)
        self.assertEqual(create_activity.person, person)
        # assignee
        create_activity = ticket.activities.get(type__name=TicketActivityType.ASSIGNEE)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['from'], str(person.id))
        self.assertEqual(create_activity.content['to'], str(person_two.id))
        # cc_add
        create_activity = ticket.activities.get(type__name=TicketActivityType.CC_ADD)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['0'], str(person_two.id))
        # cc_remove
        create_activity = ticket.activities.get(type__name=TicketActivityType.CC_REMOVE)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['0'], str(person.id))
        # status
        create_activity = ticket.activities.get(type__name=TicketActivityType.STATUS)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['from'], str(status.id))
        self.assertEqual(create_activity.content['to'], str(status_two.id))
        # priority
        create_activity = ticket.activities.get(type__name=TicketActivityType.PRIORITY)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['from'], str(priority.id))
        self.assertEqual(create_activity.content['to'], str(priority_two.id))
        # categories
        create_activity = ticket.activities.get(type__name=TicketActivityType.CATEGORIES)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['from_0'], str(category.id))
        self.assertEqual(create_activity.content['to_0'], str(category_two.id))
        # comment
        create_activity = ticket.activities.get(type__name=TicketActivityType.COMMENT)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['comment'], 'foo')
        # attachment_add
        create_activity = ticket.activities.get(type__name=TicketActivityType.ATTACHMENT_ADD)
        self.assertEqual(create_activity.person, person)
        self.assertEqual(create_activity.content['0'], str(attachment.id))


class CreateTicketKwargTests(TestCase):

    def test_ticket_request_and_requester(self):
        person = create_single_person()
        request = 'foo'
        ticket = factory.create_ticket(request=request)
        self.assertEqual(ticket.request, request)
        self.assertIsNotNone(ticket.requester)

    def test_ticket_assignee(self):
        person = create_single_person()
        ticket = factory.create_ticket(assignee=person)
        self.assertEqual(ticket.assignee, person)


class CreateTicketWithSingleCategoryKwargTests(TestCase):

    def setUp(self):
        self.dm = DistrictManager()

    def test_defualts(self):
        ticket = factory.create_ticket_with_single_category()

        self.assertIsInstance(ticket.assignee, Person)
        self.assertIn(
            ticket.location,
            ticket.assignee.locations.all()
        )
        self.assertIn(
            ticket.categories.first(),
            ticket.assignee.role.categories.all()
        )

    def test_explicit(self):
        request = 'foo'
        assignee = create_single_person()
        ticket = factory.create_ticket_with_single_category(
            request=request, assignee=self.dm.person)

        self.assertEqual(ticket.request, request)
        self.assertEqual(ticket.assignee, self.dm.person)
        self.assertIn(ticket.location, self.dm.person.locations.all())
        self.assertIn(
            self.dm.role.categories.first(),
            ticket.categories.all()
        )


class CreateExtraTicketWithCategoriesTests(TestCase):

    def setUp(self):
        factory.create_extra_ticket_with_categories()
        self.ticket = Ticket.objects.get(request="seven")

    def test_ticket(self):
        self.assertIsInstance(self.ticket, Ticket)

    def test_categories(self):
        loss_prevention, _ = Category.objects.get_or_create(name="Loss Prevention", subcategory_label="trade")
        locks, _ = Category.objects.get_or_create(name="Locks", parent=loss_prevention, subcategory_label="issue")
        a_locks, _ = Category.objects.get_or_create(name="A Lock", parent=locks)

        self.assertIn(loss_prevention, self.ticket.categories.all())
        self.assertIn(locks, self.ticket.categories.all())
        self.assertIn(a_locks, self.ticket.categories.all())


class ConstructTreeTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()
        self.ticket = factory.create_ticket()

    def test_categories(self):
        top_level = Category.objects.filter(parent__isnull=True).first()
        # add child Category(s)
        categories = Category.objects.exclude(parent__isnull=True)
        top_level.children.add(categories[0])

        self.categories = factory.construct_tree(top_level, [])

        self.assertTrue(len(self.categories) >= 2)


class CreateTicketsTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()

    def test_default(self):
        tickets = factory.create_tickets()
        self.assertEqual(len(tickets), 1)
        self.assertIsInstance(tickets[0], Ticket)

    def test_many(self):
        tickets = factory.create_tickets(_many=2)
        self.assertEqual(len(tickets), 2)
        self.assertIsInstance(tickets[0], Ticket)

    def test_generate_uuid(self):
        """
        'test' is removed from ``sys.argv`` in order to trigger the static
        generator for UUIDs.
        """
        global sys
        sys.argv = ''
        incr = Ticket.objects.count()

        ret = factory.create_ticket()

        self.assertEqual(
            str(ret.id)[:-1],
            str(generate_uuid(Ticket))[:-1]
        )

class CreateTicketsWithSingleCategory(TestCase):

    def setUp(self):
        self.dm = DistrictManager()
        self.person = self.dm.person

    def test_create(self):
        tickets = factory.create_tickets_with_single_category(assignee=self.person, _many=3)

        self.assertEqual(len(tickets), 3)
        for t in tickets:
            self.assertIsInstance(t, Ticket)
            self.assertEqual(t.categories.count(), 1)
            self.assertEqual(t.categories.first(), self.person.role.categories.first())
            self.assertIn(t.location, self.person.locations.all())


class CreateStatusTests(TestCase):

    def test_single(self):
        obj = factory_related.create_ticket_status()
        self.assertIsInstance(obj, TicketStatus)
        self.assertIn(obj.name, TicketStatus.ALL)

    def test_multiple(self):
        statuses = factory_related.create_ticket_statuses()

        self.assertEqual(statuses.count(), len(TicketStatus.ALL))
        for s in statuses.all():
            self.assertIn(s.name, TicketStatus.ALL)


class CreatePriorityTests(TestCase):

    def test_single(self):
        obj = factory_related.create_ticket_priority()
        self.assertIsInstance(obj, TicketPriority)
        self.assertIn(obj.name, TicketPriority.ALL)

    def test_multiple(self):
        priorities = factory_related.create_ticket_priorities()

        self.assertEqual(priorities.count(), len(TicketPriority.ALL))
        for p in priorities.all():
            self.assertIn(p.name, TicketPriority.ALL)


class CreateTicketActivityTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()

    def test_create(self):
        obj = factory.create_ticket_activity()
        self.assertIsInstance(obj, TicketActivity)

    def test_create_for_ticket(self):
        ticket = factory.create_ticket()
        ticket_activity = factory.create_ticket_activity(ticket=ticket)
        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.ticket, ticket)

    def test_create_for_person(self):
        obj = factory.create_ticket_activity()
        self.assertIsInstance(obj.person, Person)
        self.assertIsNone(obj.automation, Automation)

    def test_create_for_automation(self):
        obj = factory.create_ticket_activity(automation=True)
        self.assertIsNone(obj.person, Person)
        self.assertIsInstance(obj.automation, Automation)


class CreateTicketsActivityTypesTests(TestCase):

    def test_create(self):
        obj = factory.create_ticket_activity_type()
        self.assertIsInstance(obj, TicketActivityType)
        self.assertIn(obj.name, TicketActivityType.ALL)


class CreateOtherTenantFactoryTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant()

    def test_create_other_ticket(self):
        ret = factory.create_other_ticket()

        self.assertIsInstance(ret, Ticket)
        self.assertNotEqual(ret.location.location_level.tenant,
                            self.tenant)

    def test_create_ticket_with_work_order(self):
        ret = factory.create_ticket_with_work_order()
        self.assertIsInstance(ret, Ticket)
        self.assertIsInstance(ret.work_orders.first(), WorkOrder)
