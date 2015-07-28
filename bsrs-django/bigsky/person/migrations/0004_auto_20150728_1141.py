# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0003_auto_20150728_1108'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='group',
            field=models.OneToOneField(null=True, blank=True, to='auth.Group'),
        ),
    ]
