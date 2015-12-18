from django.conf import settings
from django.db.models import Q
from django.test import TestCase

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from person.tests.factory import create_single_person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES)
from ticket.tests.factory import create_ticket, create_tickets
from ticket.tests.mixins import TicketCategoryOrderingSetupMixin
from generic.tests.factory import create_attachments


class TicketStatusManagerTests(TestCase):

    def test_default(self):
        default = TicketStatus.objects.default()
        self.assertIsInstance(default, TicketStatus)
        self.assertEqual(default.name, TICKET_STATUSES[1])


class TicketPriorityTests(TestCase):

    def test_default(self):
        default = TicketPriority.objects.default()
        self.assertIsInstance(default, TicketPriority)
        self.assertEqual(default.name, TICKET_PRIORITIES[0])


class TicketManagerTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()
        create_tickets(_many=2)

    def test_deleted(self):
        ticket = Ticket.objects.first()

        ticket.delete()

        self.assertEqual(Ticket.objects.count(), 1)
        self.assertEqual(Ticket.objects_all.count(), 2)

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


class TicketTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()
        create_tickets(_many=2)

    def test_number(self):
        one = Ticket.objects.get(number=1)
        self.assertIsInstance(one, Ticket)

        two = Ticket.objects.get(number=2)
        self.assertIsInstance(two, Ticket)

    def test_defaults(self):
        ticket = Ticket.objects.first()
        ticket.status = None
        ticket.priority = None
        ticket.save()

        self.assertIsInstance(ticket.status, TicketStatus)
        self.assertIsInstance(ticket.priority, TicketPriority)


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
        attachment = create_attachments(ticket=self.ticket)
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
        self.assertEqual(ticket_activity.content['0'], attachment.id)

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
        self.assertEqual(ticket_activity.content['0'], self.person.id)


class TicketCategoryOrderingTests(TicketCategoryOrderingSetupMixin, TestCase):

    def test_ticket_one(self):
        ordered_categories = self.one.categories.order_by('level').values_list('name', flat=True)
        
        self.assertEqual(
            " - ".join(ordered_categories),
            "Loss Prevention - Locks - Drawer Lock"
        )

    def test_ticket_and_category_ordering(self):
        manual = (Ticket.objects.all()
                                .prefetch_related('categories')
                                .exclude(categories__isnull=True))

        queryset = Ticket.objects.all_with_ordered_categories()

        for i, obj in enumerate(queryset):
            self.assertEqual(manual[i].id, obj.id)
