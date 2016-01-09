# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ticket', '0001_initial'),
        ('generic', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='savedsearch',
            name='person',
            field=models.ForeignKey(help_text='The Person who saves the search.', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='attachment',
            name='ticket',
            field=models.ForeignKey(to='ticket.Ticket', related_name='attachments', blank=True, null=True),
        ),
    ]
