from model_mommy import mommy

from category.tests.factory import create_single_category
from decision_tree.models import TreeData, TreeLink
from ticket.tests.factory import create_ticket_status, create_ticket_priority


def create_tree_link():
    tree_data_parent = mommy.make(TreeData)
    tree_data_link = mommy.make(TreeData)
    category = create_single_category()
    status = create_ticket_status()
    priority = create_ticket_priority()
    tree_link =  mommy.make(TreeLink, status=status, priority=priority,
        tree_data_parent=tree_data_parent)
    tree_link.categories.add(category)
    tree_link.tree_data_links.add(tree_data_link)
    return tree_link
