# Generated by Django 5.2.3 on 2025-06-19 11:30

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SystemConfiguration",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("key", models.CharField(max_length=100, unique=True)),
                ("value", models.TextField()),
                ("description", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["key"],
            },
        ),
        migrations.CreateModel(
            name="FileUpload",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("file", models.FileField(upload_to="uploads/%Y/%m/%d/")),
                ("original_name", models.CharField(max_length=255)),
                (
                    "file_type",
                    models.CharField(
                        choices=[
                            ("IMAGE", "Image"),
                            ("DOCUMENT", "Document"),
                            ("BOOK_COVER", "Book Cover"),
                            ("EVENT_BANNER", "Event Banner"),
                            ("LIBRARY_IMAGE", "Library Image"),
                            ("USER_AVATAR", "User Avatar"),
                        ],
                        max_length=20,
                    ),
                ),
                ("file_size", models.PositiveIntegerField()),
                ("mime_type", models.CharField(max_length=100)),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="uploaded_files",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="ActivityLog",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "activity_type",
                    models.CharField(
                        choices=[
                            ("LOGIN", "User Login"),
                            ("LOGOUT", "User Logout"),
                            ("SEAT_BOOK", "Seat Booking"),
                            ("SEAT_CHECKIN", "Seat Check-in"),
                            ("SEAT_CHECKOUT", "Seat Check-out"),
                            ("BOOK_RESERVE", "Book Reservation"),
                            ("BOOK_PICKUP", "Book Pickup"),
                            ("BOOK_RETURN", "Book Return"),
                            ("EVENT_REGISTER", "Event Registration"),
                            ("EVENT_ATTEND", "Event Attendance"),
                            ("SUBSCRIPTION_PURCHASE", "Subscription Purchase"),
                            ("PROFILE_UPDATE", "Profile Update"),
                            ("PASSWORD_CHANGE", "Password Change"),
                        ],
                        max_length=25,
                    ),
                ),
                ("description", models.TextField()),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.TextField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="activity_logs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["user", "-created_at"],
                        name="core_activi_user_id_33cb61_idx",
                    ),
                    models.Index(
                        fields=["activity_type", "-created_at"],
                        name="core_activi_activit_84f18c_idx",
                    ),
                ],
            },
        ),
    ]
