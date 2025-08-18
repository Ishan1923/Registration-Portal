from django.db import models
from djongo import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import uuid

def validate_email_domain(email):
    """validates email, wither gmail or thapar.edu"""
    allowed_domain = ['thapar.edu', 'gmail.com']
    domain = email.split('@')[-1].lower()
    if domain not in allowed_domain:
        raise ValidationError(
            f'Email must be from one of these domains: {", ".join(allowed_domain)}'
        )

class Registration(models.Model):
    _id = models.ObjectIdField()
    registration_id = models.UUIDField(default = uuid.uuid4, unique = True)

    name = models.CharField(
        max_length = 100,
        help_text = "Full name of the student"
    )

    branch = models.CharField(
        max_length=100,
        help_text="Branch(e.g., COE, ENC, ECE, etc.)"
    )

    admission_no = models.CharField(
        max_length = 6,
        validators = [RegexValidator(
            regex = r'^d{6}$',
            message = 'Admission number must be exaclty 6 digits'
        )],
        unique = True,
        help_text = "6-digit admission number"
    )

    phone = models.CharField(
        max_length=10,
        validators=[RegexValidator(
            regex=r'^\d{10}$',
            message = 'Phone number must be exactly 10 digits'
        )],
        help_text="10-digit mobile number"
    )

    email = models.EmailField(
        validators=[validate_email_domain],
        unique = True,
        help_text = "Email must be from gmail.com or thapar.edu"
    )

    #metadata
    created_at = models.DateTimeField(auto_now_add = True)
    updates_at = models.DateTimeField(auto_now = True)
    is_active = models.BooleanField(default = True)

    class Meta:
        db_table = 'registrations'
        ordering = ['-created_at']
    def __str__(self):
        return f"{self.name} ({self.admission_no} - {self.branch})"

    def clean(self):
        """Additional Validation"""
        super().clean()
        if self.branch:
            self.branch = self.branch.upper()
        if self.name:
            self.name = self.name.title()

# Create your models here.
