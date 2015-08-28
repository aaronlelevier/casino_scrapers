# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0008_person_locale'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='next_approver',
            field=models.ForeignKey(related_name='nextapprover', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_user',
            field=models.ForeignKey(related_name='coveringuser', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
    ]
