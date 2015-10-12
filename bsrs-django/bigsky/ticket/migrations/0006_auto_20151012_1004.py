# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0005_auto_20151012_1003'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='cc',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
    ]
