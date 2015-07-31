# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(default=b'Internal', max_length=29, blank=True, choices=[(b'Internal', b'Internal'), (b'Third Party', b'Third Party')]),
        ),
    ]
