DEFAULT_ROLE_SETTINGS = {
    "create_all": {
        "value": True,
        "type": "bool",
        "inherited_from": "role"
    },
    "auth_currency": {
        "value": "009530c4-ce6c-4724-9cfd-37a16e787001",
        "type": "foreignkey",
        "inherited_from": "role",
        "related_model": ("accounting", "currency")
    }
}
