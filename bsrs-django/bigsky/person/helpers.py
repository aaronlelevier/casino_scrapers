def update_auth_amount(serializer):
    '''
    List Add 'auth_amount' Key
    '''
    for i in range(len(serializer.data)):
        auth_amount = serializer.data[i].pop('auth_amount', '')
        auth_amount_currency = serializer.data[i].pop('auth_amount_currency', '')
        serializer.data[i].update({'auth_amount': {
                'amount': auth_amount,
                'currency': auth_amount_currency
            }
        })
    return serializer
