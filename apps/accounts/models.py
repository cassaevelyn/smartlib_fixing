"""
User and authentication models for Smart Lib
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.core.models import BaseModel, TimeStampedModel
from apps.core.utils import generate_unique_code
import uuid


class User(AbstractUser, BaseModel):
    """
    Custom User model extending Django's AbstractUser
    """
    USER_ROLES = [
        ('STUDENT', 'Student'),
        ('ADMIN', 'Library Admin'),
        ('SUPER_ADMIN', 'Super Admin'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    # Override username to make it optional
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    
    # Basic Information
    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
        blank=True
    )
    
    # Personal Information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Academic/Professional Information
    student_id = models.CharField(max_length=50, blank=True, unique=True, null=True)
    institution = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)
    year_of_study = models.PositiveIntegerField(null=True, blank=True)
    
    # User Role and Status
    role = models.CharField(max_length=15, choices=USER_ROLES, default='STUDENT')
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True)
    verification_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Profile Information
    profile_picture = models.ImageField(upload_to='profiles/', blank=True)
    bio = models.TextField(max_length=500, blank=True)
    
    # Preferences
    preferred_language = models.CharField(max_length=10, default='en')
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # Loyalty and Gamification
    loyalty_points = models.PositiveIntegerField(default=0)
    total_bookings = models.PositiveIntegerField(default=0)
    total_study_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    
    # Security
    failed_login_attempts = models.PositiveIntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    password_reset_token = models.CharField(max_length=100, blank=True)
    password_reset_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'accounts_user'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role', 'is_verified']),
            models.Index(fields=['student_id']),
            models.Index(fields=['is_deleted', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def save(self, *args, **kwargs):
        # Generate username from email if not provided
        if not self.username:
            self.username = self.email.split('@')[0]
            # Ensure uniqueness
            counter = 1
            original_username = self.username
            while User.objects.filter(username=self.username).exists():
                self.username = f"{original_username}{counter}"
                counter += 1
        
        super().save(*args, **kwargs)
    
    @property
    def is_super_admin(self):
        """Check if user is a super admin"""
        return self.role == 'SUPER_ADMIN'
    
    @property
    def is_admin(self):
        """Check if user is any type of admin"""
        return self.role in ['ADMIN', 'SUPER_ADMIN']
    
    @property
    def is_student(self):
        """Check if user is a student"""
        return self.role == 'STUDENT'
    
    def get_full_name(self):
        """Return the full name of the user"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_display_name(self):
        """Return display name (full name or email)"""
        full_name = self.get_full_name()
        return full_name if full_name else self.email
    
    def can_login(self):
        """Check if user can login"""
        if not self.is_active or self.is_deleted:
            return False
        
        # Check if account is locked
        if self.account_locked_until and timezone.now() < self.account_locked_until:
            return False
        
        # Only verified users can login
        return self.is_verified
    
    def reset_failed_login_attempts(self):
        """Reset failed login attempts"""
        self.failed_login_attempts = 0
        self.account_locked_until = None
        self.save(update_fields=['failed_login_attempts', 'account_locked_until'])
    
    def increment_failed_login_attempts(self):
        """Increment failed login attempts and lock account if necessary"""
        self.failed_login_attempts += 1
        
        # Lock account after 5 failed attempts for 30 minutes
        if self.failed_login_attempts >= 5:
            self.account_locked_until = timezone.now() + timezone.timedelta(minutes=30)
        
        self.save(update_fields=['failed_login_attempts', 'account_locked_until'])
    
    def add_loyalty_points(self, points, reason=""):
        """Add loyalty points to user"""
        self.loyalty_points += points
        self.save(update_fields=['loyalty_points'])
        
        # Create loyalty transaction record
        LoyaltyTransaction.objects.create(
            user=self,
            points=points,
            transaction_type='EARNED',
            reason=reason,
            created_by=self
        )
    
    def deduct_loyalty_points(self, points, reason=""):
        """Deduct loyalty points from user"""
        if self.loyalty_points >= points:
            self.loyalty_points -= points
            self.save(update_fields=['loyalty_points'])
            
            # Create loyalty transaction record
            LoyaltyTransaction.objects.create(
                user=self,
                points=-points,
                transaction_type='SPENT',
                reason=reason,
                created_by=self
            )
            return True
        return False


class UserProfile(BaseModel):
    """
    Extended user profile information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)
    
    # Academic Information
    enrollment_date = models.DateField(null=True, blank=True)
    graduation_date = models.DateField(null=True, blank=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Library Preferences
    preferred_study_environment = models.CharField(
        max_length=20,
        choices=[
            ('SILENT', 'Silent'),
            ('QUIET', 'Quiet'),
            ('COLLABORATIVE', 'Collaborative'),
            ('MIXED', 'Mixed')
        ],
        default='MIXED'
    )
    preferred_seat_type = models.CharField(
        max_length=20,
        choices=[
            ('INDIVIDUAL', 'Individual Desk'),
            ('GROUP', 'Group Table'),
            ('LOUNGE', 'Lounge Chair'),
            ('STANDING', 'Standing Desk')
        ],
        default='INDIVIDUAL'
    )
    
    # Accessibility Needs
    accessibility_requirements = models.JSONField(default=list, blank=True)
    special_accommodations = models.TextField(blank=True)
    
    # Social Media
    linkedin_profile = models.URLField(blank=True)
    twitter_handle = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'accounts_user_profile'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Profile"


class AdminProfile(BaseModel):
    """
    Profile for library administrators
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='admin_profile',
        limit_choices_to={'role__in': ['ADMIN', 'SUPER_ADMIN']}
    )
    
    # Library Management
    managed_library = models.ForeignKey(
        'library.Library',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='administrators'
    )
    
    # Admin Information
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    
    # Permissions
    can_manage_users = models.BooleanField(default=True)
    can_manage_bookings = models.BooleanField(default=True)
    can_manage_inventory = models.BooleanField(default=True)
    can_view_analytics = models.BooleanField(default=True)
    can_manage_events = models.BooleanField(default=True)
    
    # Contact Information
    office_phone = models.CharField(max_length=15, blank=True)
    office_location = models.CharField(max_length=200, blank=True)
    
    class Meta:
        db_table = 'accounts_admin_profile'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Admin"
    
    def save(self, *args, **kwargs):
        if not self.employee_id:
            self.employee_id = generate_unique_code('EMP', 6)
        super().save(*args, **kwargs)


class UserLibraryAccess(BaseModel):
    """
    Model to track user applications and access to specific libraries
    """
    ACCESS_STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
        ('EXPIRED', 'Expired'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='library_access')
    library = models.ForeignKey('library.Library', on_delete=models.CASCADE, related_name='user_access')
    
    # Application Information
    application_date = models.DateTimeField(auto_now_add=True)
    application_reason = models.TextField(blank=True, help_text="Why do you want access to this library?")
    
    # Status and Approval
    status = models.CharField(max_length=15, choices=ACCESS_STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_library_access'
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Access Details
    is_active = models.BooleanField(default=False)
    joined_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    
    # Usage Statistics
    total_visits = models.PositiveIntegerField(default=0)
    total_bookings = models.PositiveIntegerField(default=0)
    last_visit = models.DateTimeField(null=True, blank=True)
    
    # Notes
    admin_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'accounts_user_library_access'
        unique_together = ['user', 'library']
        ordering = ['-application_date']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['library', 'status']),
            models.Index(fields=['status', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.library.name} ({self.status})"
    
    def save(self, *args, **kwargs):
        # Auto-set is_active and joined_date when approved
        if self.status == 'APPROVED':
            if not self.is_active:
                self.is_active = True
            if not self.joined_date:
                self.joined_date = timezone.now()
            if not self.approval_date:
                self.approval_date = timezone.now()
        else:
            # If status changes from APPROVED to something else, deactivate
            if self.pk:  # Only for existing records
                old_instance = UserLibraryAccess.objects.get(pk=self.pk)
                if old_instance.status == 'APPROVED' and self.status != 'APPROVED':
                    self.is_active = False
        
        super().save(*args, **kwargs)
    
    def approve(self, approved_by_user, admin_notes=""):
        """Approve the library access application"""
        self.status = 'APPROVED'
        self.approved_by = approved_by_user
        self.approval_date = timezone.now()
        self.is_active = True
        self.joined_date = timezone.now()
        if admin_notes:
            self.admin_notes = admin_notes
        self.save()
    
    def reject(self, rejected_by_user, rejection_reason="", admin_notes=""):
        """Reject the library access application"""
        self.status = 'REJECTED'
        self.approved_by = rejected_by_user
        self.approval_date = timezone.now()
        self.rejection_reason = rejection_reason
        self.is_active = False
        if admin_notes:
            self.admin_notes = admin_notes
        self.save()
    
    def suspend(self, suspended_by_user, admin_notes=""):
        """Suspend the library access"""
        self.status = 'SUSPENDED'
        self.is_active = False
        if admin_notes:
            self.admin_notes = admin_notes
        self.save()
    
    def reactivate(self, reactivated_by_user, admin_notes=""):
        """Reactivate suspended library access"""
        if self.status == 'SUSPENDED':
            self.status = 'APPROVED'
            self.is_active = True
            if admin_notes:
                self.admin_notes = admin_notes
            self.save()
    
    @property
    def is_expired(self):
        """Check if access has expired"""
        if self.expiry_date:
            return timezone.now() > self.expiry_date
        return False
    
    def increment_visit(self):
        """Increment visit count"""
        self.total_visits += 1
        self.last_visit = timezone.now()
        self.save(update_fields=['total_visits', 'last_visit'])
    
    def increment_booking(self):
        """Increment booking count"""
        self.total_bookings += 1
        self.save(update_fields=['total_bookings'])


class LoyaltyTransaction(BaseModel):
    """
    Model to track loyalty points transactions
    """
    TRANSACTION_TYPES = [
        ('EARNED', 'Points Earned'),
        ('SPENT', 'Points Spent'),
        ('EXPIRED', 'Points Expired'),
        ('ADJUSTED', 'Manual Adjustment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loyalty_transactions')
    points = models.IntegerField()  # Can be negative for deductions
    transaction_type = models.CharField(max_length=15, choices=TRANSACTION_TYPES)
    reason = models.CharField(max_length=200)
    
    # Related objects (optional)
    booking = models.ForeignKey(
        'seats.SeatBooking',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='loyalty_transactions'
    )
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='loyalty_transactions'
    )
    
    # Balance after transaction
    balance_after = models.PositiveIntegerField()
    
    class Meta:
        db_table = 'accounts_loyalty_transaction'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['transaction_type']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.points} points ({self.transaction_type})"
    
    def save(self, *args, **kwargs):
        # Set balance_after if not provided
        if not self.balance_after:
            self.balance_after = self.user.loyalty_points
        super().save(*args, **kwargs)


class UserSession(BaseModel):
    """
    Model to track user sessions for analytics
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Session Details
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Location (if available)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'accounts_user_session'
        ordering = ['-login_time']
        indexes = [
            models.Index(fields=['user', '-login_time']),
            models.Index(fields=['session_key']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.login_time}"
    
    @property
    def duration(self):
        """Calculate session duration"""
        end_time = self.logout_time or timezone.now()
        return end_time - self.login_time
    
    def end_session(self):
        """End the session"""
        self.logout_time = timezone.now()
        self.is_active = False
        self.save()


class UserVerification(BaseModel):
    """
    Model to handle user verification processes
    """
    VERIFICATION_TYPES = [
        ('EMAIL', 'Email Verification'),
        ('PHONE', 'Phone Verification'),
        ('DOCUMENT', 'Document Verification'),
        ('ADMIN', 'Admin Verification'),
    ]
    
    VERIFICATION_STATUS = [
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verifications')
    verification_type = models.CharField(max_length=15, choices=VERIFICATION_TYPES)
    status = models.CharField(max_length=15, choices=VERIFICATION_STATUS, default='PENDING')
    
    # Verification Data
    token = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, blank=True)  # For SMS/Email codes
    expires_at = models.DateTimeField()
    
    # Document Verification (if applicable)
    document_type = models.CharField(max_length=50, blank=True)
    document_file = models.FileField(upload_to='verifications/', blank=True)
    
    # Verification Details
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_users'
    )
    rejection_reason = models.TextField(blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        db_table = 'accounts_user_verification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'verification_type']),
            models.Index(fields=['token']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.verification_type} ({self.status})"
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = generate_unique_code('VER', 32)
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Check if verification has expired"""
        return timezone.now() > self.expires_at
    
    def verify(self, verified_by_user=None):
        """Mark verification as verified"""
        self.status = 'VERIFIED'
        self.verified_at = timezone.now()
        self.verified_by = verified_by_user
        self.save()
        
        # Update user verification status if this is email verification
        if self.verification_type == 'EMAIL':
            self.user.is_verified = True
            self.user.save(update_fields=['is_verified'])
    
    def reject(self, rejected_by_user, reason=""):
        """Mark verification as rejected"""
        self.status = 'REJECTED'
        self.verified_at = timezone.now()
        self.verified_by = rejected_by_user
        self.rejection_reason = reason
        self.save()