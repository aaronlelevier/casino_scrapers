from collections import namedtuple

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_single_category
from dtd.models import TreeField, TreeOption, TreeData, TreeLink, DTD_START_KEY
from ticket.models import TicketStatus, TicketPriority
from ticket.tests.factory_related import create_ticket_status, create_ticket_priority
from utils.create import _generate_chars, random_lorem
from utils.helpers import generate_uuid


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
    add_field_of_each_type(tree_data)

    for i in range(links):
        link = create_tree_link(destination)
        tree_data.links.add(link)

    return tree_data


# Fixture Generation code
# id, name, parent_id
DTD_DATA = [
    [0, 'Start', None],
    [1, 'Repair', 0],
    [2, 'Appliances', 1],
    [3, 'Microwave', 2],
    [4, 'Broken', 3],
    [5, 'Replace', 3],
    [6, 'Refrigerator', 2],
    [7, 'Broken-2', 6],
    [8, 'Replace-2', 6],
    [9, 'Stove', 2],
    [10, 'Broken-3', 9],
    [11, 'Replace-3', 9],
    [12, 'Maintenance', 0],
    [13, 'Parking Lot', 12],
    [14, 'Potholes', 13],
    [15, 'Repaving', 13],
    [16, 'Striping', 13],
    [17, 'Plumbing', 12],
    [18, 'Toilet', 17],
    [19, 'Sink', 17],
    [20, 'Water Heater', 17],
    [21, 'Urinals', 17],
    [22, 'Pipes', 17],
]


def dtd_clear_all():
    """
    Instead of having to deal w/ `get_or_create` logic throughout
    the fixture generation, just clear the models out and start fresh.
    """
    TreeData.objects_all.all().delete()
    TreeLink.objects_all.all().delete()
    TreeField.objects_all.all().delete()
    TreeOption.objects_all.all().delete()


def create_dtd_fixtures_only(splice=None):
    for x in DTD_DATA:
        DTDData = namedtuple('DTDData', ['id', 'name', 'parent_id'])
        data = DTDData._make(x)._asdict()
        id = generate_uuid(TreeData)
        key = _generate_chars()

        # Key needs to be Start
        dtd = TreeData.objects.create(
            id=id,
            key=DTD_START_KEY if data['id'] == 0 else data['id'],
            note=_generate_chars(),
            description=data['name'],
            prompt=_generate_chars()
        )
        add_field_of_each_type(dtd)


def add_field_of_each_type(dtd):
    for type in TreeField.ALL[:5]:
        label = type.split('.')[-1]
        field = TreeField.objects.create(label=label, type=type, required=True, tree_data=dtd)

        if type in ('admin.dtd.label.field.select', 'admin.dtd.label.field.checkbox'):
            for i in range(2):
                text = random_lorem(1)
                TreeOption.objects.create(text=text, field=field)


def create_link_fixtures_only():
    for x in DTD_DATA:
        LinkData = namedtuple('LinkData', ['id', 'name', 'parent_id'])
        data = LinkData._make(x)._asdict()

        TreeLink.objects.create(
            order=data['id'],
            text=data['name'],
            request=_generate_chars()
        )


def join_dtds_and_links():
    for x in DTD_DATA:
        DTDData = namedtuple('DTDData', ['id', 'name', 'parent_id'])
        dtd_data = DTDData._make(x)._asdict()

        for y in DTD_DATA:
            LinkData = namedtuple('LinkData', ['id', 'name', 'parent_id'])
            link_data = LinkData._make(y)._asdict()

            # set the links destination
            if dtd_data['id'] == link_data['id']:
                key = DTD_START_KEY if dtd_data['id'] == 0 else str(dtd_data['id']) 
                dtd = TreeData.objects.get(key=key)
                link = TreeLink.objects.get(order=link_data['id'])
                link.destination = dtd
                link.save()

            # set which dtd the link belongs to
            if dtd_data['id'] == link_data['parent_id']:
                key = DTD_START_KEY if dtd_data['id'] == 0 else str(dtd_data['id']) 
                dtd = TreeData.objects.get(key=key)
                link = TreeLink.objects.get(order=link_data['id'])
                link.dtd = dtd
                link.save()


def create_dtd_fixture_data():
    dtd_clear_all()
    create_dtd_fixtures_only()
    create_link_fixtures_only()
    join_dtds_and_links()
