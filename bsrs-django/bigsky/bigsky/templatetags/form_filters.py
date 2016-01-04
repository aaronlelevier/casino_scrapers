from django import template

register = template.Library()


@register.filter
def fieldtype(field):
    return field.field.widget.attrs.get('type', '')
