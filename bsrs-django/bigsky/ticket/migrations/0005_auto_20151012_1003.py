# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ticket', '0004_auto_20151010_2203'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='assignee',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, null=True, blank=True, related_name='person_ticket_assignee'),
        ),
        migrations.AddField(
            model_name='ticket',
            name='cc',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='request',
            field=models.TextField(blank=True, max_length=100, null=True),
        ),
    ]
