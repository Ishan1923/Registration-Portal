import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from bson import ObjectId
from datetime import datetime, UTC
import uuid
import logging
from dotenv import load_dotenv


load_dotenv()

logger = logging.getLogger(__name__)

class MongoDBConnection:
    def __init__(self, use_atlas=True):
        try:
            if use_atlas:

                connection_string = os.getenv('MONGODB_CONNECTION_STRING')
                if not connection_string:
                    raise Exception("MONGODB_CONNECTION_STRING not found in environment variables")
                
                self.client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
            else:

                self.client = MongoClient(
                    'mongodb://localhost:27017/', 
                    serverSelectionTimeoutMS=5000
                )

            self.client.admin.command('ping')

            self.db = self.client['iste_registration']
            self.collection = self.db['registrations']

            self.collection.create_index("admission_no", unique=True)
            self.collection.create_index("email", unique=True)
            self.collection.create_index("registration_id", unique=True)
            
            logger.info("Connected to MongoDB successfully")
            
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise Exception("MongoDB connection failed. Check your connection string and network.")
        except Exception as e:
            logger.error(f"MongoDB setup error: {e}")
            raise
    
    def create_registration(self, data):
        """Create a new registration"""
        try:
            registration_data = {
                'registration_id': str(uuid.uuid4()),
                'name': data['name'].strip(),
                'admission_no': data['admission_no'].upper().strip(),
                'email': data['email'].lower().strip(),
                'phone': data['phone'].strip(),
                'branch': data['branch'].upper().strip(),
                'year': int(data['year']),
                'is_active': True,
                'created_at': datetime.now(UTC),  
                'updated_at': datetime.now(UTC)   
            }
            
            result = self.collection.insert_one(registration_data)
            registration_data['_id'] = result.inserted_id
            
            logger.info(f"Registration created: {registration_data['name']} ({registration_data['admission_no']})")
            return registration_data
            
        except DuplicateKeyError as e:
            logger.warning(f"Duplicate registration attempt: {data.get('admission_no', 'Unknown')}")
            raise ValueError("Student already registered with this admission number or email")
        except Exception as e:
            logger.error(f"Error creating registration: {e}")
            raise
    
    def get_registrations(self, branch=None, limit=100):
        """Get registrations with optional filtering"""
        try:
            query = {'is_active': True}
            
            if branch:
                query['branch'] = {'$regex': f'^{branch.upper()}', '$options': 'i'}
            
            cursor = self.collection.find(query).sort('created_at', -1).limit(limit)
            registrations = list(cursor)
            
            logger.info(f"Retrieved {len(registrations)} registrations")
            return registrations
            
        except Exception as e:
            logger.error(f"Error fetching registrations: {e}")
            raise
    
    def get_registration_stats(self):
        """Get registration statistics"""
        try:
            total = self.collection.count_documents({'is_active': True})
            branch_pipeline = [
                {'$match': {'is_active': True}},
                {'$group': {'_id': '$branch', 'count': {'$sum': 1}}},
                {'$sort': {'_id': 1}}
            ]
            branch_stats = {}
            for result in self.collection.aggregate(branch_pipeline):
                branch_stats[result['_id']] = result['count']
            email_pipeline = [
                {'$match': {'is_active': True}},
                {'$project': {
                    'domain': {
                        '$arrayElemAt': [
                            {'$split': ['$email', '@']}, 1
                        ]
                    }
                }},
                {'$group': {'_id': '$domain', 'count': {'$sum': 1}}},
                {'$sort': {'_id': 1}}
            ]
            email_stats = {}
            for result in self.collection.aggregate(email_pipeline):
                email_stats[result['_id']] = result['count']
            year_pipeline = [
                {'$match': {'is_active': True}},
                {'$group': {'_id': '$year', 'count': {'$sum': 1}}},
                {'$sort': {'_id': 1}}
            ]
            year_stats = {}
            for result in self.collection.aggregate(year_pipeline):
                year_stats[f"Year {result['_id']}"] = result['count']
            
            stats = {
                'total_registrations': total,
                'branch_wise': branch_stats,
                'email_domains': email_stats,
                'year_wise': year_stats
            }
            
            logger.info(f"Generated stats: {total} total registrations")
            return stats
            
        except Exception as e:
            logger.error(f"Error generating stats: {e}")
            raise
    
    def registration_exists(self, admission_no=None, email=None):
        """Check if registration already exists"""
        try:
            query = {'is_active': True}
            
            if admission_no and email:
                query = {
                    '$or': [
                        {'admission_no': admission_no.upper().strip()},
                        {'email': email.lower().strip()}
                    ],
                    'is_active': True
                }
            elif admission_no:
                query['admission_no'] = admission_no.upper().strip()
            elif email:
                query['email'] = email.lower().strip()
            else:
                return False
            
            result = self.collection.find_one(query, {'_id': 1})
            return result is not None
            
        except Exception as e:
            logger.error(f"Error checking registration existence: {e}")
            return False
    
    def get_registration_by_id(self, registration_id):
        """Get a single registration by registration_id"""
        try:
            registration = self.collection.find_one({
                'registration_id': registration_id,
                'is_active': True
            })
            return registration
        except Exception as e:
            logger.error(f"Error fetching registration by ID: {e}")
            return None
try:
    mongodb = MongoDBConnection()
    logger.info("MongoDB connection instance created successfully")
except Exception as e:
    logger.error(f"Failed to initialize MongoDB connection: {e}")
    mongodb = None