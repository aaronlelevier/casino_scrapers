from datetime import datetime
import sys

from django.db.models import Max
from django.utils.timezone import now
from django.test import TestCase

from category.models import Category
from category.tests.factory import create_categories
from dtd.tests.factory import create_dtd_fixture_data
from dtd.models import TreeData
from generic.models import Attachment
from location.models import Location, LOCATION_COMPANY
from person.models import Person
from person.tests.factory import create_single_person, DistrictManager
from ticket.models import (
    Ticket, TicketStatus, TicketPriority, TicketActivityType, TicketActivity,
    TICKET_PRIORITIES, TICKET_ACTIVITY_TYPES, TICKET_PRIORITY_MEDIUM)
from ticket.tests import factory, factory_related
from utils.helpers import generate_uuid


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

    def test_dt_path(self):
        """
        dt_path should be previous dtd (start dtd) and existing one that user bailed on
        """
        start_dtd = TreeData.objects.get_start()
        self.assertEqual(len(self.ticket.dt_path), 2)
        self.assertTrue(start_dtd.links.first().destination)
        self.assertEqual(self.ticket.dt_path[0]['dtd']['id'], str(start_dtd.id))
        self.assertEqual(self.ticket.dt_path[0]['dtd']['description'], start_dtd.description)
        self.assertEqual(self.ticket.dt_path[0]['dtd']['prompt'], start_dtd.prompt)
        self.assertEqual(self.ticket.dt_path[0]['dtd']['note'], start_dtd.note)
        self.assertEqual(len(self.ticket.dt_path[0]['dtd']['fields']), 5)
        self.assertTrue(self.ticket.dt_path[0]['dtd']['fields'][0]['id'])
        self.assertTrue(self.ticket.dt_path[0]['dtd']['fields'][0]['value'])
        self.assertTrue(self.ticket.dt_path[0]['dtd']['fields'][0]['label'])
        self.assertEqual(self.ticket.dt_path[0]['dtd']['fields'][0]['required'], 'true')
        self.assertEqual(type(self.ticket.dt_path[0]['dtd']['fields'][3]['value']), int)
        self.assertEqual(self.ticket.dt_path[1]['dtd']['id'], str(start_dtd.links.first().destination.id))
        self.assertEqual(self.ticket.dt_path[1]['dtd']['description'], 'You are almost done')


class CreateStandardTicketTests(TestCase):

    def setUp(self):
        create_dtd_fixture_data()
        create_categories()
        self.person = create_single_person()

    def test_main(self):
        ticket = factory.create_standard_ticket()

        self.assertIsInstance(ticket, Ticket)
        self.assertEqual(ticket.status.name, TicketStatus.NEW)
        self.assertEqual(ticket.priority.name, TICKET_PRIORITY_MEDIUM)


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
        self.assertIn(obj.name, TICKET_PRIORITIES)

    def test_multiple(self):
        priorities = factory_related.create_ticket_priorities()

        self.assertEqual(priorities.count(), len(TICKET_PRIORITIES))
        for p in priorities.all():
            self.assertIn(p.name, TICKET_PRIORITIES)


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


class CreateTicketsActivityTypesTests(TestCase):

    def test_create(self):
        obj = factory.create_ticket_activity_type()
        self.assertIsInstance(obj, TicketActivityType)
        self.assertIn(obj.name, TICKET_ACTIVITY_TYPES)
