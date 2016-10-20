from mock import patch

from django.conf import settings
from django.db.models import Q, Max
from django.test import TestCase

from model_mommy import mommy

from category.tests.factory import create_categories, create_single_category
from generic.tests.factory import create_file_attachment
from location.models import LocationStatus
from location.tests.factory import create_location
from person.tests.factory import create_single_person
from ticket.models import (Ticket, TicketManager, TicketQuerySet, TicketStatus, TicketPriority,
    TicketActivityType, TicketActivity, TICKET_PRIORITY_DEFAULT)
from ticket.tests.factory_related import create_ticket_statuses, create_ticket_priorities
from ticket.tests.factory import RegionManagerWithTickets, create_ticket, create_tickets
from ticket.tests.mixins import TicketCategoryOrderingSetupMixin
from utils.tests.test_helpers import create_default


class TicketStatusTests(TestCase):

    def setUp(self):
        create_ticket_statuses()

    def test_to_dict__default(self):
        status = TicketStatus.objects.get(name=TicketStatus.DEFAULT)

        ret = status.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(status.id))
        self.assertEqual(ret['name'], status.name)
        self.assertTrue(ret['default'])

    def test_to_dict__non_default(self):
        status = TicketStatus.objects.exclude(name=TicketStatus.DEFAULT).first()

        ret = status.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(status.id))
        self.assertEqual(ret['name'], status.name)
        self.assertFalse(ret['default'])


class TicketPriorityTests(TestCase):

    def setUp(self):
        create_ticket_priorities()

    def test_to_dict__default(self):
        priority = TicketPriority.objects.get(name=TICKET_PRIORITY_DEFAULT)

        ret = priority.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(priority.id))
        self.assertEqual(ret['name'], priority.name)
        self.assertTrue(ret['default'])

    def test_to_dict__non_default(self):
        priority = TicketPriority.objects.exclude(name=TICKET_PRIORITY_DEFAULT).first()

        ret = priority.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(priority.id))
        self.assertEqual(ret['name'], priority.name)
        self.assertFalse(ret['default'])


class TicketManagerTests(TestCase):

    def setUp(self):
        self.rm = RegionManagerWithTickets()
        self.person = create_single_person()
        self.other_location = create_location()
        self.other_category = create_single_category()
        # start fresh w/ no locations or categories
        for x in self.person.locations.all():
            self.person.locations.remove(x)
        for c in self.person.role.categories.all():
            self.person.role.categories.remove(c)

    def test_queryset_cls(self):
        self.assertEqual(TicketManager.queryset_cls, TicketQuerySet)

    def test_ticket_filter__person_top_level_location_and_no_role_categories(self):
        self.person.locations.add(self.rm.top_location)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 16)

    def test_ticket_filter__person_location_and_no_role_categories(self):
        self.person.locations.add(self.rm.location)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 8)

    def test_ticket_filter__person_child_location_and_no_role_categories(self):
        self.person.locations.add(self.rm.child_location)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 4)

    def test_ticket_filter__person_other_location_and_no_role_categories(self):
        self.person.locations.add(self.other_location)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 0)

    def test_ticket_filter__person_top_location_and_category(self):
        self.person.locations.add(self.rm.top_location)
        self.person.role.categories.add(self.rm.category)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 8)

    def test_ticket_filter__person_location_and_category(self):
        self.person.locations.add(self.rm.location)
        self.person.role.categories.add(self.rm.category)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 4)

    def test_ticket_filter__person_child_location_and_category(self):
        self.person.locations.add(self.rm.child_location)
        self.person.role.categories.add(self.rm.category)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 2)

    def test_ticket_filter__person_other_location_and_category(self):
        self.person.locations.add(self.other_location)
        self.person.role.categories.add(self.rm.category)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 0)

    def test_ticket_filter__person_top_location_and_other_category(self):
        """Top level location Person can see all ticket drafts."""
        self.person.locations.add(self.rm.top_location)
        self.person.role.categories.add(self.other_category)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 4)

    def test_ticket_filter__person_location_and_other_category(self):
        """Can see location and child location ticket drafts."""
        self.person.locations.add(self.rm.location)
        self.person.role.categories.add(self.other_category)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 2)

    def test_deleted(self):
        init_count = Ticket.objects_all.count()
        ticket = Ticket.objects.first()

        ticket.delete()

        self.assertEqual(Ticket.objects.count(), init_count-1)
        self.assertEqual(Ticket.objects_all.count(), init_count)

    def test_search_multi(self):
        search = TicketPriority.objects.first().name
        raw_qs_count = Ticket.objects.filter(
                Q(request__icontains=search) | \
                Q(location__name__icontains=search) | \
                Q(assignee__fullname__icontains=search) | \
                Q(priority__name__icontains=search) | \
                Q(status__name__icontains=search) | \
                Q(categories__name__in=[search])
            ).count()

        ret = Ticket.objects.search_multi(keyword=search).count()

        self.assertEqual(ret, raw_qs_count)

    def test_next_number(self):
        number = 100
        ticket = Ticket.objects.first()
        ticket.number = number
        ticket.save()
        raw_max = Ticket.objects.all().aggregate(Max('number'))['number__max']

        next_number = Ticket.objects.next_number()

        self.assertEqual(raw_max+1, next_number)

    def test_next_number__if_no_tickets(self):
        for t in Ticket.objects_all.all():
            t.delete(override=True)
        self.assertEqual(Ticket.objects_all.count(), 0)

        ret = Ticket.objects.next_number()

        self.assertEqual(ret, 1)

    def test_filter_export_data(self):
        assignee = create_single_person()
        ticket = create_ticket(assignee=assignee)

        ret = Ticket.objects.filter_export_data({'id': ticket.id})

        self.assertEqual(ret.count(), 1)
        self.assertEqual(ret[0].id, ticket.id)
        self.assertEqual(ret[0].priority_name, ticket.priority.name)
        self.assertEqual(ret[0].status_name, ticket.status.name)
        self.assertEqual(ret[0].number, ticket.number)
        self.assertEqual(ret[0].created, ticket.created)
        self.assertEqual(ret[0].location_name, ticket.location.name)
        self.assertEqual(ret[0].assignee_name, ticket.assignee.fullname)
        self.assertEqual(ret[0].request, ticket.request)
        self.assertEqual(ret[0].category, ticket.category)


class TicketTests(TestCase):

    def setUp(self):
        create_default(LocationStatus)
        create_categories()
        create_single_person()
        create_ticket_statuses()
        create_tickets(_many=2)
        self.ticket = Ticket.objects.first()
        self.status_new = TicketStatus.objects.get(name=TicketStatus.NEW)
        self.status_draft = TicketStatus.objects.get(name=TicketStatus.DRAFT)

    def test_export_fields(self):
        export_fields = ['priority_name', 'status_name', 'number', 'created',
                         'location_name', 'assignee_name', 'category', 'request']

        self.assertEqual(Ticket.EXPORT_FIELDS, export_fields)

    def test_i18n_header_fields(self):
        raw_headers = [
            ('priority_name', 'ticket.label.priority-name'),
            ('status_name', 'ticket.label.status-name'),
            ('number', 'ticket.label.numberSymbol'),
            ('created', 'ticket.label.created'),
            ('location_name', 'ticket.label.location-name'),
            ('assignee_name', 'ticket.label.assignee-fullname'),
            ('category', 'ticket.label.category-name'),
            ('request', 'ticket.label.request')
        ]

        ret = Ticket.I18N_HEADER_FIELDS

        self.assertEqual(ret, [x[1] for x in raw_headers])

    def test_i18n_fields(self):
        self.assertEqual(Ticket.I18N_FIELDS, ['priority_name', 'status_name'])

    def test_filter_export_data__queryset_matches_export_fields(self):
        ticket = Ticket.objects.filter_export_data().first()
        for f in Ticket.EXPORT_FIELDS:
            self.assertTrue(hasattr(ticket, f), "%s not present on Ticket" % f)

    def test_number(self):
        one = Ticket.objects.get(number=1)
        self.assertIsInstance(one, Ticket)

        two = Ticket.objects.get(number=2)
        self.assertIsInstance(two, Ticket)

    def test_ordering(self):
        self.assertEqual(Ticket._meta.ordering, ('-created',))

    @patch("ticket.models.Ticket._process_ticket")
    def test_save__process_ticket__new_status_and_no_assignee(self, mock_process_ticket):
        # This is the only tiime that wee wan't the "process_ticket"
        # function to be called
        self.ticket.status = self.status_new
        self.ticket.assignee = None

        self.ticket.save()

        self.assertTrue(mock_process_ticket.called)
        self.assertEqual(mock_process_ticket.call_args[0][0], self.ticket.location.location_level.tenant.id)
        self.assertEqual(mock_process_ticket.call_args[1]['ticket'], self.ticket)

    @patch("ticket.models.Ticket._process_ticket")
    def test_save__process_ticket__not_new_status_and_no_assignee(self, mock_process_ticket):
        self.ticket.status = self.status_draft
        self.ticket.assignee = None

        self.ticket.save()

        self.assertFalse(mock_process_ticket.called)

    @patch("ticket.models.Ticket._process_ticket")
    def test_save__process_ticket__new_status_and_assignee(self, mock_process_ticket):
        assignee = create_single_person()
        self.ticket.status = self.status_new
        self.ticket.assignee = assignee

        self.ticket.save()

        self.assertFalse(mock_process_ticket.called)

    def test_category(self):
        # categories - are joined directly onto the Ticket, but do
        # need the parent/child relationship in order to setup level
        parent = self.ticket.categories.first()
        child = create_single_category(parent=parent)
        grand_child = create_single_category(parent=child)
        self.ticket.categories.add(child, grand_child)
        self.assertEqual(self.ticket.categories.count(), 3)

        self.assertEqual(
            self.ticket.category,
            "{} - {} - {}".format(parent.name, child.name, grand_child.name)
        )


class TicketActivityTests(TestCase):

    def setUp(self):
        create_categories()
        self.person = create_single_person()
        self.person_two = create_single_person()
        self.ticket = create_ticket()
        self.activity = mommy.make(TicketActivity, person=self.person)

    def test_setup(self):
        self.assertIsInstance(self.activity, TicketActivity)

    def test_meta_ordering(self):
        self.activity = mommy.make(TicketActivity, person=self.person)
        self.assertEqual(TicketActivity.objects.count(), 2)

        ret = TicketActivity.objects.all()

        self.assertEqual(
            ret.first(),
            TicketActivity.objects.order_by('-created').first()
        )

    def test_weigh_default(self):
        self.assertEqual(
            self.activity.weight,
            settings.ACTIVITY_DEFAULT_WEIGHT
        )

    def test_weight_category(self):
        type = mommy.make(TicketActivityType)
        self.activity.type = type
        self.activity.save()

        self.assertEqual(
            self.activity.weight,
            type.weight
        )

    def test_log_create(self):
        name = 'create'
        type, _ = TicketActivityType.objects.get_or_create(name=name)

        ticket_activity = TicketActivity.objects.create(type=type, ticket=self.ticket,
            person=self.person)

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.type.name, name)

    def test_log_assignee(self):
        name = 'assignee'
        type, _ = TicketActivityType.objects.get_or_create(name='assignee')

        ticket_activity = TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.ticket,
            content={
                'from': str(self.person.id),
                'to': str(self.person_two.id)
            }
        )

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.type.name, name)
        self.assertTrue(TicketActivity.objects.filter(content__from=str(self.person.id)).exists())

    def test_log_attachment(self):
        attachment = create_file_attachment(self.ticket)
        type, _ = TicketActivityType.objects.get_or_create(name='attachment_add')

        ticket_activity = TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.ticket,
            content={
                '0': str(attachment.id),
            }
        )

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.ticket.id, self.ticket.id)
        self.assertEqual(ticket_activity.content['0'], str(attachment.id))

    def test_log_cc_add(self):
        type, _ = TicketActivityType.objects.get_or_create(name='cc_add')

        ticket_activity = TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.ticket,
            content={
                '0': str(self.person.id)
            }
        )

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.ticket.id, self.ticket.id)
        self.assertEqual(ticket_activity.content['0'], str(self.person.id))


class TicketCategoryOrderingTests(TicketCategoryOrderingSetupMixin, TestCase):

    def test_ticket_one(self):
        ordered_categories = self.one.categories.order_by('level').values_list('name', flat=True)

        self.assertEqual(
            " - ".join(ordered_categories),
            "Loss Prevention - Locks - Drawer Lock"
        )
