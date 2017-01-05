from django.conf import settings
from django.test import TestCase

from model_mommy import mommy

from category.models import Category, LABEL_TYPE, LABEL_TRADE, LABEL_ISSUE
from category.tests.factory import create_categories
from location.models import Location, LocationStatus, LocationType, LocationLevel, LOCATION_STORE
from location.tests.factory import create_location_levels
from person.models import Person
from ticket.models import Ticket, TicketStatus, TicketPriority
from ticket.tests.factory_related import create_ticket_priorities, create_ticket_statuses
from utils.tests.test_helpers import create_default
from utils_transform.tticket.management.commands import _etl_utils
from utils_transform.tticket.tests.factory import create_domino_ticket


class EtlUtilsTests(TestCase):

    def setUp(self):
        # Location
        create_location_levels()
        create_categories()
        self.store_level = LocationLevel.objects.get(name=LOCATION_STORE)
        self.number = '1'
        create_default(LocationStatus)
        create_default(LocationType)
        self.location = mommy.make(Location, number=self.number,
            location_level=self.store_level)
        # Ticket
        create_ticket_priorities()
        create_ticket_statuses()
        self.priority = TicketPriority.objects.get(name=TicketPriority.EMERGENCY)
        self.status = TicketStatus.objects.get(name=TicketStatus.CANCELLED)
        # successful DominoTicet ETL setup
        self.dt = create_domino_ticket()
        self.dt.status = self.dt.priority = self.dt.location_number = '1'
        self.dt.save()

    # run_ticket_migrations

    def test_run_ticket_migrations(self):
        self.assertEqual(Ticket.objects.count(), 0)

        _etl_utils.run_ticket_migrations()

        self.assertEqual(Ticket.objects.count(), 1)
        ticket = Ticket.objects.first()
        self.assertEqual(ticket.location, self.location)
        self.assertEqual(ticket.priority, self.priority)
        self.assertEqual(ticket.status, self.status)
        self.assertEqual(ticket.request, "{}\n{}".format(self.dt.subject, self.dt.request))
        self.assertEqual(ticket.assignee, Person.objects.get(fullname=self.dt.assigned_to))
        self.assertEqual(ticket.requester, self.dt.requester)
        self.assertEqual(ticket.created, self.dt.create_date)
        self.assertEqual(ticket.completion_date, self.dt.complete_date)
        self.assertEqual(ticket.legacy_ref_number, self.dt.ref_number)
        # categories
        self.assertEqual(ticket.categories.filter(label=LABEL_TYPE).count(), 1)
        self.assertEqual(ticket.categories.filter(label=LABEL_TRADE).count(), 1)
        self.assertEqual(ticket.categories.filter(label=LABEL_ISSUE).count(), 1)

    def test_run_ticket_migrations__log_location__DoesNotExist(self):
        number = 'foo'
        self.assertFalse(Location.objects.filter(number=number).exists())
        self.dt.location_number = number
        self.dt.save()
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        _etl_utils.run_ticket_migrations()

        self.assertEqual(Ticket.objects.count(), 0)
        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("{} Location number DoesNotExist for ref # {}"
                      .format(self.dt.location_number, self.dt.ref_number), content)

    def test_run_ticket_migrations__log_location_MultipleObjectsReturned(self):
        mommy.make(Location, number=self.number, location_level=self.store_level)
        self.assertEqual(Location.objects.filter(number=self.number, location_level=self.store_level).count(), 2)
        self.assertEqual(Ticket.objects.count(), 0)
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        _etl_utils.run_ticket_migrations()

        self.assertEqual(Ticket.objects.count(), 0)
        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("{} Location number MultipleObjectsReturned for ref # {}"
                      .format(self.dt.location_number, self.dt.ref_number), content)

    def test_run_ticket_migrations__log_category_DoesNotExist(self):
        name = 'foo'
        self.assertFalse(Category.objects.filter(name=name).exists())
        self.dt.type = name
        self.dt.save()
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        _etl_utils.run_ticket_migrations()

        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("Level: {level}; Label: {label}; Name: {name} DoesNotExist"
                      .format(level=0, label=LABEL_TYPE, name=self.dt.type), content)

    def test_run_ticket_migrations__log_category_MultipleObjectsReturned(self):
        category = Category.objects.get(name=self.dt.type)
        mommy.make(Category, name=category.name, label=category.label, level=category.level)
        self.assertEqual(Category.objects.filter(name=category.name, label=category.label, level=category.level).count(), 2)
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        _etl_utils.run_ticket_migrations()

        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("Level: {level}; Label: {label}; Name: {name} MultipleObjectsReturned"
                      .format(level=0, label=LABEL_TYPE, name=self.dt.type), content)

    def test_run_ticket_migrations__log_missing_assinged_to(self):
        fullname = self.dt.assigned_to
        person = Person.objects.get(fullname=fullname)
        person.delete(override=True)
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        _etl_utils.run_ticket_migrations()

        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("Assignee: {} DoesNotExist".format(fullname), content)

    def test_get_location(self):
        ret = _etl_utils.get_location(self.dt.location_number, self.dt.ref_number)
        self.assertEqual(ret, self.location)

    def test_get_category(self):
        ret = _etl_utils.get_category(name='Repair', label=LABEL_TYPE, level=0)

        self.assertIsInstance(ret, Category)
        self.assertEqual(ret.name, 'Repair')
        self.assertEqual(ret.label, LABEL_TYPE)
        self.assertEqual(ret.level, 0) # top level category

    def test_format_subject_and_request(self):
        subject = 'foo'
        request = 'bar\n'

        ret = _etl_utils.format_subject_and_request(subject, request)

        self.assertEqual(ret, 'foo\nbar')

    def test_get_assingee(self):
        person = Person.objects.first()
        person.delete()
        self.assertTrue(Person.objects_all.filter(username=person.username).exists())

        ret = _etl_utils.get_assignee(person.fullname)

        self.assertEqual(ret, person)

    def test_get_status(self):
        ret = _etl_utils.get_status('1')
        self.assertIsInstance(ret, TicketStatus)

    def test_get_status__raise_error_if_not_in_TICKET_STATUS_MAP(self):
        with self.assertRaises(ValueError):
            _etl_utils.get_status('foo')

    def test_get_priority(self):
        ret = _etl_utils.get_priority('1')
        self.assertIsInstance(ret, TicketPriority)

    def test_get_priority__raise_error_if_not_in_TICKET_PRIORITY_MAP(self):
        with self.assertRaises(ValueError):
            _etl_utils.get_priority('foo')
