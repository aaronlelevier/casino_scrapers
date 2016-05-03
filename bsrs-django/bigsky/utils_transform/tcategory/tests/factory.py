import random
import string

from model_mommy import mommy

from utils_transform.tcategory.models import CategoryType, CategoryTrade, CategoryIssue


def get_random_data(fields):
    data = {}

    for f in fields:
        if f == 'cost_amount':
            data[f] = random.choice(string.digits)
        else:
            data[f] = "".join([random.choice(string.ascii_letters) for x in range(10)])

    return data


def create_domino_category_type():
    fields = [f.name for f in CategoryType._meta.get_fields()
             if f.name != 'id']
    data = get_random_data(fields)
    return mommy.make(CategoryType, **data)


def create_domino_category_trade(type=None):
    fields = [f.name for f in CategoryTrade._meta.get_fields()
             if f.name != 'id']
    data = get_random_data(fields)
    trade = mommy.make(CategoryTrade, **data)

    if type:
        trade.type_name = type.name
        trade.save()

    return trade


def create_domino_category_issue(trade=None):
    fields = [f.name for f in CategoryIssue._meta.get_fields()
             if f.name != 'id']
    data = get_random_data(fields)
    issue = mommy.make(CategoryIssue, **data)

    if trade:
        issue.trade_name = trade.name
        issue.save()

    return issue
