from django.test import TestCase

from category.models import Category
from decision_tree.models import TreeLink
from decision_tree.tests import factory
from ticket.models import TicketStatus, TicketPriority


class FactoryTests(TestCase):

    def test_create_tree_link(self):
        tree_link = factory.create_tree_link()

        self.assertIsInstance(tree_link, TreeLink)
        self.assertIsInstance(tree_link.status, TicketStatus)
        self.assertIsInstance(tree_link.priority, TicketPriority)
        self.assertEqual(tree_link.categories.count(), 1)
        self.assertIsInstance(tree_link.categories.first(), Category)