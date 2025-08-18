from rest_framework import serializers
from .models_old import Registration
import re

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['registration_id', 'name', 'branch', 'admission_no', 'phone', 'email', 'created_at']
        read_only_fields = ['registration_id', 'created_at']
    
    def validate_name(self, value):
        """Validate name contains only letters and spaces"""
        if not re.match(r'^[a-zA-Z\s]+$', value.strip()):
            raise serializers.ValidationError("Name can only contain letters and spaces.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value.strip().title()
    
    def validate_branch(self, value):
        """Validate and standardize branch names"""
        common_branches = {
            'COE': 'COE', 'COMPUTER': 'COE', 'COMPUTER ENGINEERING': 'COE',
            'ECE': 'ECE', 'ELECTRONICS': 'ECE', 'ELECTRONICS AND COMMUNICATION': 'ECE',
            'EEE': 'EEE', 'ELECTRICAL': 'EEE', 'ELECTRICAL AND ELECTRONICS': 'EEE',
            'MECH': 'MECH', 'MECHANICAL': 'MECH', 'MECHANICAL ENGINEERING': 'MECH',
            'CIVIL': 'CIVIL', 'CIVIL ENGINEERING': 'CIVIL',
            'IT': 'IT', 'INFORMATION TECHNOLOGY': 'IT',
            'CSE': 'CSE', 'COMPUTER SCIENCE': 'CSE',
            'CHEMICAL': 'CHEMICAL', 'CHEMICAL ENGINEERING': 'CHEMICAL',
            'BIOTECHNOLOGY': 'BIOTECHNOLOGY', 'BIOTECH': 'BIOTECHNOLOGY',
            'AEROSPACE': 'AEROSPACE', 'AERONAUTICAL': 'AEROSPACE'
        }
        
        branch_upper = value.strip().upper()
        standardized_branch = common_branches.get(branch_upper, branch_upper)
        
        if len(standardized_branch) < 2:
            raise serializers.ValidationError("Branch name is too short.")
        
        return standardized_branch
    
    def validate_admission_no(self, value):
        """Validate admission number format and uniqueness"""
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError("Admission number must be exactly 6 digits.")
        
        if Registration.objects.filter(admission_no=value, is_active=True).exists():
            raise serializers.ValidationError("Student with this admission number is already registered.")
        
        return value
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        
        # Check for obviously invalid numbers
        if value.startswith('0000000000') or value.startswith('1111111111'):
            raise serializers.ValidationError("Please enter a valid phone number.")
        
        return value
    
    def validate_email(self, value):
        """Validate email domain and uniqueness"""
        allowed_domains = ['gmail.com', 'thapar.edu']
        email_lower = value.lower().strip()
        
        try:
            domain = email_lower.split('@')[1]
        except IndexError:
            raise serializers.ValidationError("Please enter a valid email address.")
        
        if domain not in allowed_domains:
            raise serializers.ValidationError(
                f"Email must be from one of these domains: {', '.join(allowed_domains)}"
            )
        
        if Registration.objects.filter(email=email_lower, is_active=True).exists():
            raise serializers.ValidationError("Student with this email is already registered.")
        
        return email_lower
    
    def validate(self, data):
        """Cross-field validation"""
        # Additional validation can be added here
        return data

class RegistrationListSerializer(serializers.ModelSerializer):
    """Serializer for listing registrations with all fields"""
    class Meta:
        model = Registration
        fields = [
            'registration_id', 'name', 'branch', 'admission_no', 
            'phone', 'email', 'created_at', 'updated_at', 'is_active'
        ]