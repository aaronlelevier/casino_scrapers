from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_single_category
from decision_tree.models import TreeField, TreeOption, TreeData, TreeLink
from ticket.models import TicketStatus, TicketPriority
from ticket.tests.factory import create_ticket_status, create_ticket_priority


def _link_get_or_create_related(model, factory_create_func):
    try:
        objs = model.objects.order_by('?')
        return objs[0]
    except IndexError:
        return factory_create_func()


def create_tree_link(destination=None):
    destination = destination
    dtd = mommy.make(TreeData)
    category = _link_get_or_create_related(Category, create_single_category)
    status = _link_get_or_create_related(TicketStatus, create_ticket_status)
    priority = _link_get_or_create_related(TicketPriority, create_ticket_priority)

    tree_link =  mommy.make(TreeLink, status=status, priority=priority,
                            destination=destination, dtd=dtd)
    tree_link.categories.add(category)

    return tree_link


def create_tree_field(options=2):
    tree_field = mommy.make(TreeField)

    for i in range(options):
        mommy.make(TreeOption, field=tree_field)

    return tree_field


def create_tree_data(links=1, destination=None, **kwargs):
    tree_data = mommy.make(TreeData, **kwargs)
    # Fields
    field = create_tree_field()
    tree_data.fields.add(field)

    for i in range(links):
        # if `destination` kwarg, only create for 1st Link
        # because of 1-to-1 relationship
        if i == 0:
            link = create_tree_link(destination)
        else:
            link = create_tree_link()
        tree_data.links.add(link)

    return tree_data


def create_multi_node_tree():
    three = create_tree_data(key="three")
    two = create_tree_data(key="two", destination=three)
    one = create_tree_data(key="one", destination=two)
