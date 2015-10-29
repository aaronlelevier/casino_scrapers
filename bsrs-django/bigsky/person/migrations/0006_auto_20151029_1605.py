# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0005_auto_20151029_1454'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='password_change',
            field=models.DateTimeField(help_text='DateTime of last password change', blank=True, null=True),
        ),
    ]
