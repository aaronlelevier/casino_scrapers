# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0006_auto_20150903_1712'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='password_expire',
            field=models.IntegerField(default=90, help_text=b"Number of days after setting password that it will expire.If '0', password will never expire.", blank=True),
        ),
    ]
