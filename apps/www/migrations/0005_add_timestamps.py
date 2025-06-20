# Generated by Django 5.1.6 on 2025-02-28 14:14

from django.db import migrations, models
from django.utils import timezone

def fill_current_time(apps, schema_editor):
    ActiveModel = apps.get_model('www', 'blogentry')

    for entry in ActiveModel.objects.all():
        entry.created = timezone.now()
        entry.updated = timezone.now()
        entry.save(update_fields=["created", "updated"])

class Migration(migrations.Migration):

    dependencies = [
        ('www', '0004_require_uuid_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogentry',
            name='created',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='blogentry',
            name='updated',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.RunPython(
            fill_current_time,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='blogentry',
            name='created',
            field=models.DateTimeField(auto_now_add=True, blank=False),
        ),
        migrations.AlterField(
            model_name='blogentry',
            name='updated',
            field=models.DateTimeField(auto_now=True, blank=False),
        ),
    ]
