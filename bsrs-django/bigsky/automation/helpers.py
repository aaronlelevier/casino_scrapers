import re

from django.conf import settings
from django.template import loader

from premailer import transform

from utils.helpers import KwargsAsObject, get_model_class


class Interpolate(object):
    """
    Does string interplolation for Automation actions where a message
    needs to be sent. i.e email/sms
    """
    i18n_FIELDS = ['ticket.priority', 'ticket.status']

    def __init__(self, ticket, translation, **kwargs):
        """
        :param ticket: Ticket instance associated with the message
        :param automation:
            AutomationWrapper instance that uses kwargs as properties
            for info that's associated with the automation
        :param translation:
            Translation instance related to the message recipients' Locale
        :param sms: optional bool - pass as True if this is for an SMS msg
        :param kwargs:
            this will build an object on the instance for any additional
            data needed to populate msg
        """
        self.ticket = ticket
        self.translation = translation
        self.automation = KwargsAsObject(**kwargs)

        self.string_kwargs = {
            'ticket': self.ticket,
            'location': self.ticket.location,
            'automation': self.automation
        }

    def text(self, s):
        """
        Interpolate a string, and convert for use in text fields.
        i.e.  send_email subject and body

        :param s: string to interpolate
        """
        tags = self._get_raw_tags(s)
        for tag in tags:
            s = self._replace(s, tag)
        return s.format(**self.string_kwargs)

    def _get_raw_tags(self, s):
        e = re.compile('{{.*?}}')
        return e.findall(s)

    def _get_tags(self, s):
        e = re.compile('{{(.*?)}}')
        return e.findall(s)

    def _get_first_tag(self, s):
        return self._get_tags(s)[0]

    def _replace(self, string, substring):
        tag = self._get_first_tag(substring)

        if tag == 'ticket.url':
            return string.replace(substring, self._ticket_url())
        elif tag == 'ticket.activity':
            # if present because will be generated later
            return string.replace(substring, '')
        elif tag in self.i18n_FIELDS:
            model, field = tag.split('.')
            return string.replace(
                substring,
                self.translation.get_value(getattr(getattr(self.ticket, field), 'name')))
        return string.replace(substring, substring[1:-1])

    def _ticket_url(self):
        return '{}/tickets/{}'.format(settings.SITE_URL, self.ticket.id)

    def contains_ticket_activity(self, s):
        return '{{ticket.activity}}' in s

    def get_html_email(self, base_template, **context):
        """
        Constructs an HTML email based on a base template and
        a body of content.

        :param base_template:
            file location string of the base html template to use
        :param body:
            body text string string of the email already interpolated
        """
        return transform(
            loader.render_to_string(base_template, context)).replace('\n', '')
