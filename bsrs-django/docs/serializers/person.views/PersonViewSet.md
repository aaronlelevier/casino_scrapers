# PersonViewSet
## Person
### List
```python
{
    "auth_amount": "DecimalField",
    "auth_currency": "PrimaryKeyRelatedField",
    "employee_id": "CharField",
    "first_name": "CharField",
    "id": "UUIDField",
    "last_name": "CharField",
    "middle_initial": "CharField",
    "role": "PrimaryKeyRelatedField",
    "status": {
        "id": "UUIDField",
        "name": "CharField"
    },
    "title": "CharField",
    "username": "CharField"
}
```

### Retrieve
```python
{
    "addresses": {
        "address": "CharField",
        "city": "CharField",
        "country": "CharField",
        "id": "UUIDField",
        "postal_code": "CharField",
        "state": "CharField",
        "type": "AddressTypeSerializer"
    },
    "auth_amount": "DecimalField",
    "auth_currency": "PrimaryKeyRelatedField",
    "emails": {
        "email": "EmailField",
        "id": "UUIDField",
        "type": "EmailTypeSerializer"
    },
    "employee_id": "CharField",
    "first_name": "CharField",
    "id": "UUIDField",
    "last_name": "CharField",
    "locale": "PrimaryKeyRelatedField",
    "locations": {
        "id": "UUIDField",
        "location_level": "LocationLevelSerializer",
        "name": "CharField",
        "number": "CharField"
    },
    "middle_initial": "CharField",
    "phone_numbers": {
        "id": "UUIDField",
        "number": "CharField",
        "type": "PhoneNumberTypeSerializer"
    },
    "role": "PrimaryKeyRelatedField",
    "status": {
        "id": "UUIDField",
        "name": "CharField"
    },
    "title": "CharField",
    "username": "CharField"
}
```

### Update
```python
{
    "addresses": {
        "address": "CharField",
        "city": "CharField",
        "country": "CharField",
        "id": "UUIDField",
        "postal_code": "CharField",
        "state": "CharField",
        "type": "PrimaryKeyRelatedField"
    },
    "auth_amount": "DecimalField",
    "auth_currency": "PrimaryKeyRelatedField",
    "emails": {
        "email": "EmailField",
        "id": "UUIDField",
        "type": "PrimaryKeyRelatedField"
    },
    "employee_id": "CharField",
    "first_name": "CharField",
    "id": "UUIDField",
    "last_name": "CharField",
    "locale": "PrimaryKeyRelatedField",
    "locations": "ManyRelatedField",
    "middle_initial": "CharField",
    "password": "CharField",
    "phone_numbers": {
        "id": "UUIDField",
        "number": "CharField",
        "type": "PrimaryKeyRelatedField"
    },
    "role": "PrimaryKeyRelatedField",
    "status": "PrimaryKeyRelatedField",
    "title": "CharField",
    "username": "CharField"
}
```

### Create
```python
{
    "id": "UUIDField",
    "password": "CharField",
    "role": "PrimaryKeyRelatedField",
    "username": "CharField"
}
```

