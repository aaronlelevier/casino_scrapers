# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
        ('location', '0001_initial'),
        ('ticket', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='category',
            field=models.ForeignKey(to='category.Category', null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='location',
            field=models.ForeignKey(to='location.Location', null=True),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='assignee',
            field=models.ForeignKey(related_name='person_ticket_assignee', null=True, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='request',
            field=models.TextField(null=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='subject',
            field=models.TextField(null=True, max_length=100),
        ),
    ]
