# ThirdPartyViewSet
## ThirdParty
### List
```python
{
    "id": "UUIDField",
    "name": "CharField",
    "number": "CharField",
    "status": "PrimaryKeyRelatedField"
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
    "emails": {
        "email": "EmailField",
        "id": "UUIDField",
        "type": "EmailTypeSerializer"
    },
    "id": "UUIDField",
    "name": "CharField",
    "number": "CharField",
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
    "categories": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    },
    "currency": "PrimaryKeyRelatedField",
    "emails": {
        "email": "EmailField",
        "id": "UUIDField",
        "type": "PrimaryKeyRelatedField"
    },
    "id": "UUIDField",
    "name": "CharField",
    "number": "CharField",
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
    "addresses": {
        "address": "CharField",
        "city": "CharField",
        "country": "CharField",
        "id": "UUIDField",
        "postal_code": "CharField",
        "state": "CharField",
        "type": "PrimaryKeyRelatedField"
    },
    "categories": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    },
    "currency": "PrimaryKeyRelatedField",
    "emails": {
        "email": "EmailField",
        "id": "UUIDField",
        "type": "PrimaryKeyRelatedField"
    },
    "id": "UUIDField",
    "name": "CharField",
    "number": "CharField",
    "phone_numbers": {
        "id": "UUIDField",
        "number": "CharField",
        "type": "PrimaryKeyRelatedField"
    },
    "status": "PrimaryKeyRelatedField"
}
```

