from category.models import Category


def resolve_cost_amount(cost_amount):
    try:
        float(cost_amount)
    except ValueError:
        # Error will be raised here if an empty string
        return 0
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


def create_category_from_category_type(domino_instance, label='type', subcategory_label='trade', parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)


def create_category_from_category_trade(domino_instance, label='trade', subcategory_label='issue', parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)


def create_category_from_category_issue(domino_instance, label='issue', subcategory_label='sub-issue', parent=None):
    return _create_category(domino_instance, label, subcategory_label, parent)
