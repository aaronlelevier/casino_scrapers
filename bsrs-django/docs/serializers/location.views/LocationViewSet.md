# LocationViewSet
## Location
### List
```python
{
    "id": "UUIDField",
    "location_level": {
        "id": "UUIDField",
        "name": "CharField"
    },
    "name": "CharField",
    "number": "CharField",
    "status": {
        "id": "UUIDField",
        "name": "CharField"
    }
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
    "children": {
        "id": "UUIDField",
        "location_level": "PrimaryKeyRelatedField",
        "name": "CharField",
        "number": "CharField"
    },
    "emails": {
        "email": "EmailField",
        "id": "UUIDField",
        "type": "EmailTypeSerializer"
    },
    "id": "UUIDField",
    "location_level": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parents": "ListSerializer"
    },
    "name": "CharField",
    "number": "CharField",
    "parents": {
        "id": "UUIDField",
        "location_level": "PrimaryKeyRelatedField",
        "name": "CharField",
        "number": "CharField"
    },
    "phone_numbers": {
        "id": "UUIDField",
        "number": "CharField",
        "type": "PhoneNumberTypeSerializer"
    },
    "status": "PrimaryKeyRelatedField"
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
    "children": "ManyRelatedField",
    "emails": {
        "email": "EmailField",
        "id": "UUIDField",
        "type": "PrimaryKeyRelatedField"
    },
    "id": "UUIDField",
    "location_level": "PrimaryKeyRelatedField",
    "name": "CharField",
    "number": "CharField",
    "parents": "ManyRelatedField",
    "phone_numbers": {
        "id": "UUIDField",
        "number": "CharField",
        "type": "PrimaryKeyRelatedField"
    },
    "status": "PrimaryKeyRelatedField"
}
```

### Create
```python
{
    "id": "UUIDField",
    "location_level": "PrimaryKeyRelatedField",
    "name": "CharField",
    "number": "CharField",
    "status": "PrimaryKeyRelatedField"
}
```

