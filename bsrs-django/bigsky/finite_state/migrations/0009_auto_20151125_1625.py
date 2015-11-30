# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('finite_state', '0008_auto_20151125_1501'),
    ]

    operations = [
        migrations.AddField(
            model_name='workrequest',
            name='approver',
            field=models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, blank=True),
        ),
        migrations.AddField(
            model_name='workrequest',
            name='request',
            field=models.CharField(null=True, max_length=254, blank=True),
        ),
    ]
