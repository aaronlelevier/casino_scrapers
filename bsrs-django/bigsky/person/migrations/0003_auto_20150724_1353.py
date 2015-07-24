# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.contrib.auth.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('auth', '0006_require_contenttypes_0002'),
        ('person', '0002_auto_20150724_1314'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='role',
            options={'ordering': ('name',)},
        ),
        migrations.AlterModelManagers(
            name='person',
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.RemoveField(
            model_name='person',
            name='created',
        ),
        migrations.RemoveField(
            model_name='person',
            name='deleted',
        ),
        migrations.RemoveField(
            model_name='person',
            name='id',
        ),
        migrations.RemoveField(
            model_name='person',
            name='modified',
        ),
        migrations.RemoveField(
            model_name='person',
            name='user',
        ),
        migrations.RemoveField(
            model_name='role',
            name='group',
        ),
        migrations.RemoveField(
            model_name='role',
            name='id',
        ),
        migrations.RemoveField(
            model_name='role',
            name='name',
        ),
        migrations.AddField(
            model_name='person',
            name='user_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='group_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to='auth.Group'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire',
            field=models.PositiveIntegerField(help_text=b'Number of days after setting password that it will expire.', null=True, blank=True),
        ),
    ]
