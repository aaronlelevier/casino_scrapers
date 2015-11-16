# TicketActivityViewSet
## TicketActivity
### List
```python
{
    "content": "CharMappingField",
    "created": "DateTimeField",
    "id": "UUIDField",
    "person": {
        "fullname": "CharField",
        "id": "UUIDField"
    },
    "ticket": "PrimaryKeyRelatedField",
    "type": "PrimaryKeyRelatedField"
}
```

### Retrieve
```python
