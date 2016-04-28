from rest_framework.exceptions import ValidationError

from django.utils.translation import ugettext_lazy as _


class UniqueDtdFieldValidator(object):
    """
    `TreeField.label` must be unique by related TreeData object.
    """
    message = _("Labels '{labels}' already exists for the Decision Tree node.")

    def __call__(self, kwargs):
        labels = [f['label'] for f in kwargs.get('fields', [])]
        unique = set()
        non_unique = set()
        for label in labels:
            if label not in unique:
                unique.update([label])
            else:
                non_unique.update([label])

        if non_unique:
            raise ValidationError(self.message.format(labels=', '.join(non_unique)))
