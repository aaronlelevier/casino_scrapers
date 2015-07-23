# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0005_auto_20150723_1233'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='role',
            options={'ordering': ('group__name',)},
        ),
    ]
