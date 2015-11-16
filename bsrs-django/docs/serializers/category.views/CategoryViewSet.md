# CategoryViewSet
## Category
### List
```python
{
    "children": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    },
    "cost_amount": "DecimalField",
    "cost_code": "CharField",
    "cost_currency": "PrimaryKeyRelatedField",
    "description": "CharField",
    "id": "UUIDField",
    "label": "CharField",
    "name": "CharField",
    "parent": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    }
}
```

### Retrieve
```python
{
    "children": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    },
    "cost_amount": "DecimalField",
    "cost_code": "CharField",
    "cost_currency": "PrimaryKeyRelatedField",
    "description": "CharField",
    "id": "UUIDField",
    "label": "CharField",
    "name": "CharField",
    "parent": {
        "children": "ManyRelatedField",
        "id": "UUIDField",
        "name": "CharField",
        "parent": "PrimaryKeyRelatedField"
    },
    "subcategory_label": "CharField"
}
```

### Update
```python
{
    "children": "ManyRelatedField",
    "cost_amount": "DecimalField",
    "cost_code": "CharField",
    "cost_currency": "PrimaryKeyRelatedField",
    "description": "CharField",
    "id": "UUIDField",
    "label": "CharField",
    "name": "CharField",
    "parent": "PrimaryKeyRelatedField",
    "subcategory_label": "CharField"
}
```

### Create
```python
{
    "children": "ManyRelatedField",
    "cost_amount": "DecimalField",
    "cost_code": "CharField",
    "cost_currency": "PrimaryKeyRelatedField",
    "description": "CharField",
    "id": "UUIDField",
    "label": "CharField",
    "name": "CharField",
    "parent": "PrimaryKeyRelatedField",
    "subcategory_label": "CharField"
}
```

