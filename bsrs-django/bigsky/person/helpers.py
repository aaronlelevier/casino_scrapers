import json


# def update_auth_amount(serializer):
#     '''
#     List Add 'auth_amount' Key
#     '''
#     for i in range(len(serializer.data)):
#         auth_amount = serializer.data[i].pop('auth_amount', '')
#         auth_amount_currency = serializer.data[i].pop('auth_amount_currency', '')
#         serializer.data[i].update({'auth_amount': {
#                 'amount': auth_amount,
#                 'currency': auth_amount_currency
#             }
#         })
#     return serializer


# def update_auth_amount_single(data):
#     # Add ``auth_amount`` to dict
#     auth_amount = data.pop('auth_amount', '')
#     auth_amount_currency = data.pop('auth_amount_currency', '')
#     data.update({'auth_amount': {
#             'amount': auth_amount,
#             'currency': auth_amount_currency
#         }
#     })
#     return data


# def deserialize_auth_mount(data):
#     auth_amount = data.pop("auth_amount", {})
#     data.update({
#         "auth_amount": auth_amount.get("amount",""),
#         "auth_amount_currency": auth_amount.get("currency","")
#     })
#     return data


def update_group(person, group):
    "Will make sure the ``person`` is in one, and only one group."
    for g in person.groups.all():
        person.groups.remove(g)
    person.groups.add(group)
    return person
