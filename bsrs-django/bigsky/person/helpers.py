def update_auth_amount(serializer):
    '''
    Attach the 'auth_amount' key to the Serializer for `Person`
    '''
    auth_amount = serializer.data[0].pop('auth_amount', '')
    auth_amount_currency = serializer.data[0].pop('auth_amount_currency', '')
    serializer.data[0].update({'auth_amount': {
            'amount': auth_amount,
            'currency': auth_amount_currency
        }
    })
    return serializer