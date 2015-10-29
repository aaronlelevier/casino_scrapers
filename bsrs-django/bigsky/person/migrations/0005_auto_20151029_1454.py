# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0004_auto_20151026_1520'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='role',
            name='password_char_types',
        ),
        migrations.AlterField(
            model_name='role',
            name='msg_address',
            field=models.BooleanField(help_text='whether users in this role are allowed to change the CC field on a ticket or work order', default=False),
        ),
    ]
