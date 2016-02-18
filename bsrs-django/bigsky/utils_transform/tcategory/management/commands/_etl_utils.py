from category.models import Category, LABEL_TYPE, LABEL_TRADE, LABEL_ISSUE, LABEL_SUB_ISSUE


def resolve_cost_amount(cost_amount):
    try:
        float(cost_amount)
    except ValueError:
        # Error will be raised here if an empty string
        return
    else:
        return cost_amount


def _create_category(domino_instance, label, subcategory_label, parent):
    cost_amount = resolve_cost_amount(domino_instance.cost_amount)

    return Category.objects.create(
        name=domino_instance.name,
        description=domino_instance.description,
        label=label,
        subcategory_label=subcategory_label,
        cost_amount=cost_amount,
        cost_code=domino_instance.cost_code,
        parent=parent
    )


def create_category_from_category_type(domino_instance, label=LABEL_TYPE, subcategory_label=LABEL_TRADE, parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)


def create_category_from_category_trade(domino_instance, label=LABEL_TRADE, subcategory_label=LABEL_ISSUE, parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)


def create_category_from_category_issue(domino_instance, label=LABEL_ISSUE, subcategory_label=LABEL_SUB_ISSUE, parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)
