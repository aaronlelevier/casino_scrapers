# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('contact', '0002_auto_20151012_1153'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='address',
            options={'ordering': ('address',)},
        ),
        migrations.AlterModelOptions(
            name='email',
            options={'ordering': ('email',)},
        ),
        migrations.AlterModelOptions(
            name='phonenumber',
            options={'ordering': ('number',)},
        ),
        migrations.RemoveField(
            model_name='address',
            name='location',
        ),
        migrations.RemoveField(
            model_name='address',
            name='person',
        ),
        migrations.RemoveField(
            model_name='email',
            name='location',
        ),
        migrations.RemoveField(
            model_name='email',
            name='person',
        ),
        migrations.RemoveField(
            model_name='phonenumber',
            name='location',
        ),
        migrations.RemoveField(
            model_name='phonenumber',
            name='person',
        ),
        migrations.AddField(
            model_name='address',
            name='content_type',
            field=models.ForeignKey(default=1, to='contenttypes.ContentType'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='address',
            name='object_id',
            field=models.UUIDField(default=uuid.uuid4),
        ),
        migrations.AddField(
            model_name='email',
            name='content_type',
            field=models.ForeignKey(default=1, to='contenttypes.ContentType'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='email',
            name='object_id',
            field=models.UUIDField(default=uuid.uuid4),
        ),
        migrations.AddField(
            model_name='phonenumber',
            name='content_type',
            field=models.ForeignKey(default=1, to='contenttypes.ContentType'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='phonenumber',
            name='object_id',
            field=models.UUIDField(default=uuid.uuid4),
        ),
    ]
