from django.db.models import Q
from django.test import TestCase

from person.models import Person
from routing.models import Assignment, AssignmentManager, AssignmentQuerySet, ProfileFilter
from routing.tests.factory import create_assignment, create_ticket_priority_filter
from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant


class AssignmentManagerTests(TestCase):

    def setUp(self):
        self.assignment = create_assignment('a')
        create_assignment('b')

    def test_queryset_cls(self):
        self.assertEqual(AssignmentManager.queryset_cls, AssignmentQuerySet)

    def test_deleted_not_present(self):
        self.assertEqual(Assignment.objects.count(), 2)
        self.assertEqual(Assignment.objects_all.count(), 2)

        self.assignment.delete()

        self.assertEqual(Assignment.objects.count(), 1)
        self.assertEqual(Assignment.objects_all.count(), 2)

    def test_search_multi(self):
        self.assertEqual(Assignment.objects.count(), 2)
        keyword = self.assignment.description

        raw_ret = Assignment.objects.filter(
            Q(description=keyword) | \
            Q(assignee__username=keyword)
        )

        ret = Assignment.objects.search_multi(keyword)

        self.assertEqual(ret.count(), 1)
        self.assertEqual(ret.count(), raw_ret.count())


class AssignmentTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant()
        self.assignment = create_assignment()

    def test_meta__ordering(self):
        # order by ascending 'order' b/c this demostrates processing order
        self.assertEqual(Assignment._meta.ordering, ['order'])

    def test_fields(self):
        self.assertIsInstance(self.assignment.description, str)
        self.assertIsInstance(self.assignment.assignee, Person)

    def test_manager(self):
        self.assertIsInstance(Assignment.objects, AssignmentManager)

    def test_default_tenant(self):
        self.assertIsInstance(self.assignment.tenant, Tenant)

    def test_order_increments_by_tenant(self):
        self.assertEqual(self.assignment.order, 1)

        assignment2 = create_assignment()
        self.assertEqual(assignment2.order, 2)

        # tenant 2
        tenant_two = get_or_create_tenant('foo')
        assignment3 = create_assignment(tenant=tenant_two)
        self.assertEqual(assignment3.order, 1)
        assignment4 = create_assignment(tenant=tenant_two)
        self.assertEqual(assignment4.order, 2)


class ProfilefilterTests(TestCase):

    def setUp(self):
        self.pf = create_ticket_priority_filter()

    def test_meta__ordering(self):
        # order by id, so that way are returned to User in the same order
        # each time if nested in the Assignment Detail view
        self.assertEqual(ProfileFilter._meta.ordering, ['id'])
