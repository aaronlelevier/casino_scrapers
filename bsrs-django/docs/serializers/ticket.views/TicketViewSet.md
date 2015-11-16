# TicketViewSet
## Ticket
### List
```python
{
    "assignee": {
        "first_name": "CharField",
        "id": "UUIDField",
        "last_name": "CharField",
        "middle_initial": "CharField",
        "role": "PrimaryKeyRelatedField",
        "title": "CharField"
    },
    "attachments": "ManyRelatedField",
    "categories": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    },
    "id": "UUIDField",
    "location": {
        "id": "UUIDField",
        "location_level": "PrimaryKeyRelatedField",
        "name": "CharField",
        "number": "CharField"
    },
    "number": "IntegerField",
    "priority": "PrimaryKeyRelatedField",
    "request": "CharField",
    "requester": "PrimaryKeyRelatedField",
    "status": "PrimaryKeyRelatedField"
}
```

### Retrieve
```python
{
    "assignee": {
        "first_name": "CharField",
        "id": "UUIDField",
        "last_name": "CharField",
        "middle_initial": "CharField",
        "role": "PrimaryKeyRelatedField",
        "title": "CharField"
    },
    "attachments": "ManyRelatedField",
    "categories": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    },
    "cc": {
        "first_name": "CharField",
        "id": "UUIDField",
        "last_name": "CharField",
        "middle_initial": "CharField",
        "role": "PrimaryKeyRelatedField",
        "title": "CharField"
    },
    "id": "UUIDField",
    "location": {
        "id": "UUIDField",
        "location_level": "PrimaryKeyRelatedField",
        "name": "CharField",
        "number": "CharField"
    },
    "number": "IntegerField",
    "priority": "PrimaryKeyRelatedField",
    "request": "CharField",
    "requester": {
        "first_name": "CharField",
        "id": "UUIDField",
        "last_name": "CharField",
        "middle_initial": "CharField",
        "role": "PrimaryKeyRelatedField",
        "title": "CharField"
    },
    "status": "PrimaryKeyRelatedField"
}
```

### Update
```python
{
    "assignee": "PrimaryKeyRelatedField",
    "attachments": "ManyRelatedField",
    "categories": "ManyRelatedField",
    "cc": "ManyRelatedField",
    "id": "UUIDField",
    "location": "PrimaryKeyRelatedField",
    "priority": "PrimaryKeyRelatedField",
    "request": "CharField",
    "requester": "PrimaryKeyRelatedField",
    "status": "PrimaryKeyRelatedField"
}
```

### Create
```python
{
    "assignee": "PrimaryKeyRelatedField",
    "attachments": "ManyRelatedField",
    "categories": "ManyRelatedField",
    "cc": "ManyRelatedField",
    "id": "UUIDField",
    "location": "PrimaryKeyRelatedField",
    "priority": "PrimaryKeyRelatedField",
    "request": "CharField",
    "requester": "PrimaryKeyRelatedField",
    "status": "PrimaryKeyRelatedField"
}
```

