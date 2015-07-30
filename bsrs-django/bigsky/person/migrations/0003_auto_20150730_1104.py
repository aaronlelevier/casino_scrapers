# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150730_1103'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(default=b'contractor', max_length=29, blank=True, choices=[(b'contractor', b'contractor'), (b'location', b'location')]),
        ),
    ]
