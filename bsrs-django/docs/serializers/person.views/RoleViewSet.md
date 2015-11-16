# RoleViewSet
## Role
### List
```python
{
    "id": "UUIDField",
    "location_level": "PrimaryKeyRelatedField",
    "name": "CharField",
    "role_type": "ChoiceField"
}
```

### Retrieve
```python
{
    "categories": {
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField",
        "status": "PrimaryKeyRelatedField"
    },
    "id": "UUIDField",
    "location_level": "PrimaryKeyRelatedField",
    "name": "CharField",
    "role_type": "ChoiceField"
}
```

### Update
```python
{
    "categories": "ManyRelatedField",
    "id": "UUIDField",
    "location_level": "PrimaryKeyRelatedField",
    "name": "CharField",
    "role_type": "ChoiceField"
}
```

### Create
```python
{
    "id": "UUIDField",
    "location_level": "PrimaryKeyRelatedField",
    "name": "CharField",
    "role_type": "ChoiceField"
}
```

