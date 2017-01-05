import logging
logger = logging.getLogger(__name__)

from category.models import Category, LABEL_TYPE, LABEL_TRADE, LABEL_ISSUE, LABEL_SUB_ISSUE
from utils_transform.tcategory.models import CategoryType, CategoryTrade, CategoryIssue


def run_category_type_migrations(tenant):
    for x in CategoryType.objects.all():
        create_type_from_domino(x, tenant)


def run_category_trade_migrations(tenant):
    _run_category_migrations(CategoryTrade, tenant, LABEL_TYPE, 'type_name', create_trade_from_domino)


def run_category_issue_migrations(tenant):
    _run_category_migrations(CategoryIssue, tenant, LABEL_TRADE, 'trade_name', create_issue_from_domino)


def _run_category_migrations(model, tenant, label, name_field, create_func):
    for domino_instance in model.objects.all():
        domino_name = getattr(domino_instance, name_field)
        parent = Category.objects.filter(label=label,
                                         name=domino_name).first()
        if not parent:
            logger.info("Name: {name}; Label: {label} Parent Category DoesNotExist"
                        .format(name=domino_name, label=label))
        else:
            create_func(domino_instance, tenant, parent=parent)


def create_type_from_domino(domino_instance, tenant, label=LABEL_TYPE,
                            subcategory_label=LABEL_TRADE, parent=None):
    kwargs = _get_kwargs(tenant, label, subcategory_label, parent)
    return _create_category(domino_instance, **kwargs)


def create_trade_from_domino(domino_instance, tenant, label=LABEL_TRADE,
                             subcategory_label=LABEL_ISSUE, parent=None):
    kwargs = _get_kwargs(tenant, label, subcategory_label, parent)
    return _create_category(domino_instance, **kwargs)


def create_issue_from_domino(domino_instance, tenant, label=LABEL_ISSUE,
                             subcategory_label=LABEL_SUB_ISSUE, parent=None):
    kwargs = _get_kwargs(tenant, label, subcategory_label, parent)
    return _create_category(domino_instance, **kwargs)


def _get_kwargs(tenant, label, subcategory_label, parent):
    return {
        'tenant': tenant,
        'label': label,
        'subcategory_label': subcategory_label,
        'parent': parent
    }

def _create_category(domino_instance, **kwargs):
    cost_amount = resolve_cost_amount(domino_instance.cost_amount)
    label = kwargs.get('label')
    level = resolve_level(label)

    try:
        category = Category.objects.get(name=domino_instance.name,
                                        label=label, level=level)
    except Category.DoesNotExist:
        category = Category.objects.create(
            name=domino_instance.name,
            description=domino_instance.description,
            cost_code=domino_instance.cost_code,
            cost_amount=cost_amount,
            **kwargs
        )
    return category


def resolve_cost_amount(cost_amount):
    try:
        float(cost_amount)
    except ValueError:
        # Error will be raised here if an empty string
        return
    else:
        return cost_amount


def resolve_level(label):
    level_map = {
        LABEL_TYPE: 0,
        LABEL_TRADE: 1,
        LABEL_ISSUE: 2
    }
    return level_map[label]
