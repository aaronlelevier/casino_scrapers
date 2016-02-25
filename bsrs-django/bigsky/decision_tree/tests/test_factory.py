from django.test import TestCase

from category.models import Category
from decision_tree.models import TreeField, TreeOption, TreeData, TreeLink
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
        # TreeData relationships
        self.assertIsInstance(tree_link.destination, TreeData)
        self.assertEqual(tree_link.child_data.count(), 1)
        self.assertIsInstance(tree_link.child_data.first(), TreeData)


    def test_create_tree_field(self):
        tree_field = factory.create_tree_field(3)

        self.assertIsInstance(tree_field, TreeField)
        self.assertEqual(tree_field.options.count(), 3)
        self.assertIsInstance(tree_field.options.first(), TreeOption)

    def test_create_tree_data(self):
        tree_data = factory.create_tree_data()

        self.assertIsInstance(tree_data, TreeData)
        # Fields
        self.assertEqual(tree_data.fields.count(), 1)
        self.assertIsInstance(tree_data.fields.first(), TreeField)
        # Links
        # parent link
        self.assertIsInstance(tree_data.parent_link, TreeLink)
        # child links
        self.assertEqual(tree_data.links.count(), 1)
        self.assertIsInstance(tree_data.links.first(), TreeLink)