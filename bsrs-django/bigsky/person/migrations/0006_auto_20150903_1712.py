# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0005_auto_20150903_1703'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='password_expire',
        ),
        migrations.RemoveField(
            model_name='role',
            name='password_expire_date',
        ),
        migrations.AddField(
            model_name='person',
            name='password_expire_date',
            field=models.DateField(help_text=b"Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", null=True, blank=True),
        ),
    ]
