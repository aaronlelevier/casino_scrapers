DEFAULT_ROLE_SETTINGS = {
    "create_all": {
        "value": True,
        "type": "bool",
        "inherited_from": "role"
    },
    "auth_currency": {
        "value": "baa98c7d-42d1-4909-9910-53a9991f959a",
        "type": "foreignkey",
        "inherited_from": "role",
        "related_model": ("accounting", "currency")
    }
}
