from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .mongodb import mongodb
import logging
import json

logger = logging.getLogger(__name__)

def index(request):
    """Render the registration form HTML page"""
    return render(request, 'index.html')

@api_view(['POST'])
def create_registration(request):
    """API endpoint to create a new registration"""
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['name', 'admission_no', 'email', 'phone', 'branch', 'year']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if registration already exists
        if mongodb.registration_exists(
            admission_no=data['admission_no'],
            email=data['email']
        ):
            return Response(
                {'error': 'Student already registered with this admission number or email'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create registration
        registration = mongodb.create_registration(data)
        
        # Convert ObjectId to string for JSON serialization
        if '_id' in registration:
            registration['_id'] = str(registration['_id'])
        if 'created_at' in registration:
            registration['created_at'] = registration['created_at'].isoformat()
        if 'updated_at' in registration:
            registration['updated_at'] = registration['updated_at'].isoformat()
        
        return Response(
            {'message': 'Registration successful!', 'data': registration}, 
            status=status.HTTP_201_CREATED
        )
        
    except ValueError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def list_registrations(request):
    """API endpoint to list registrations"""
    try:
        branch = request.GET.get('branch')
        limit = int(request.GET.get('limit', 100))
        
        registrations = mongodb.get_registrations(branch=branch, limit=limit)
        
        # Convert ObjectIds and dates to strings
        for registration in registrations:
            if '_id' in registration:
                registration['_id'] = str(registration['_id'])
            if 'created_at' in registration:
                registration['created_at'] = registration['created_at'].isoformat()
            if 'updated_at' in registration:
                registration['updated_at'] = registration['updated_at'].isoformat()
        
        return Response(
            {'registrations': registrations, 'count': len(registrations)}, 
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Error fetching registrations: {e}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def registration_stats(request):
    """API endpoint to get registration statistics"""
    try:
        stats = mongodb.get_registration_stats()
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def registration_form(request):
    """Render the registration form"""
    return render(request, 'index.html')