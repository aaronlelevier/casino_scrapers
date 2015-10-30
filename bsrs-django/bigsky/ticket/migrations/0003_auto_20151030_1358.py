# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0002_auto_20151030_1351'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticket',
            name='subject',
        ),
        migrations.AlterField(
            model_name='ticket',
            name='assignee',
            field=models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True, related_name='assignee_tickets'),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='requester',
            field=models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True, related_name='requester_tickets'),
        ),
    ]
