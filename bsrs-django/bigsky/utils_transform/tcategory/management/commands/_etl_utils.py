import logging
logger = logging.getLogger(__name__)

from category.models import Category, LABEL_TYPE, LABEL_TRADE, LABEL_ISSUE, LABEL_SUB_ISSUE
from utils_transform.tcategory.models import CategoryType, CategoryTrade, CategoryIssue


def run_category_type_migrations():
    for x in CategoryType.objects.all():
        create_type_from_domino(x)


def run_category_trade_migrations():
    _run_category_migrations(CategoryTrade, LABEL_TYPE, 'type_name', create_trade_from_domino)


def run_category_issue_migrations():
    _run_category_migrations(CategoryIssue, LABEL_TRADE, 'trade_name', create_issue_from_domino)


def _run_category_migrations(model, label, name_field, create_func):
    for x in model.objects.all():
        name = getattr(x, name_field)
        parent = Category.objects.filter(label=label, name=name).first()
        if not parent:
            logger.info("Name: {name}; Label: {label} Parent Category DoesNotExist"
                        .format(name=name, label=label))
        else:
            create_func(x, parent=parent)


def create_type_from_domino(domino_instance, label=LABEL_TYPE, subcategory_label=LABEL_TRADE, parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)


def create_trade_from_domino(domino_instance, label=LABEL_TRADE, subcategory_label=LABEL_ISSUE, parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)


def create_issue_from_domino(domino_instance, label=LABEL_ISSUE, subcategory_label=LABEL_SUB_ISSUE, parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)


def _create_category(domino_instance, label, subcategory_label, parent):
    cost_amount = resolve_cost_amount(domino_instance.cost_amount)
    level = resolve_level(label)

    try:
        category = Category.objects.get(name=domino_instance.name, label=label, level=level)
    except Category.DoesNotExist:
        category = Category.objects.create(
            name=domino_instance.name,
            description=domino_instance.description,
            label=label,
            subcategory_label=subcategory_label,
            cost_amount=cost_amount,
            cost_code=domino_instance.cost_code,
            parent=parent
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
