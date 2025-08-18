#!/usr/bin/env python3
"""
MongoDB Atlas Connection Test Script
Run this to verify your MongoDB Atlas connection is working
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Load environment variables
load_dotenv()

def test_mongodb_connection():
    """Test MongoDB Atlas connection with detailed feedback"""
    
    print("=" * 60)
    print("🔍 MONGODB ATLAS CONNECTION TEST")
    print("=" * 60)
    
    # Step 1: Check environment variables
    print("\n1️⃣  Checking Environment Variables...")
    connection_string = os.getenv('MONGODB_CONNECTION_STRING')
    
    if not connection_string:
        print("❌ ERROR: MONGODB_CONNECTION_STRING not found in .env file")
        print("📝 Please create a .env file with your MongoDB Atlas connection string:")
        print("   MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/")
        return False
    
    print("✅ Environment variable loaded")
    
    # Mask password in output for security
    masked_string = connection_string
    if "@" in masked_string:
        parts = masked_string.split("@")
        if ":" in parts[0]:
            user_pass = parts[0].split("://")[1]
            if ":" in user_pass:
                username = user_pass.split(":")[0]
                masked_string = connection_string.replace(user_pass, f"{username}:****")
    
    print(f"🔗 Connection string: {masked_string}")
    
    # Step 2: Test basic connection
    print("\n2️⃣  Testing MongoDB Connection...")
    try:
        client = MongoClient(
            connection_string,
            serverSelectionTimeoutMS=10000  # 10 second timeout
        )
        
        # Test connection with ping
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
    except ConnectionFailure as e:
        print(f"❌ Connection failed: {e}")
        return False
    except ServerSelectionTimeoutError as e:
        print(f"❌ Connection timeout: {e}")
        print("💡 This usually means:")
        print("   - Your IP address is not whitelisted in MongoDB Atlas")
        print("   - Your internet connection is blocking MongoDB ports")
        print("   - The connection string is incorrect")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    # Step 3: Test database operations
    print("\n3️⃣  Testing Database Operations...")
    try:
        # Access your database
        db = client['iste_registration']
        collection = db['registrations']
        
        print("✅ Database and collection accessed successfully")
        
        # Test write operation
        test_doc = {
            'test_entry': True,
            'timestamp': datetime.utcnow(),
            'message': 'Connection test successful'
        }
        
        result = collection.insert_one(test_doc)
        print(f"✅ Test document inserted with ID: {result.inserted_id}")
        
        # Test read operation
        found_doc = collection.find_one({'_id': result.inserted_id})
        if found_doc:
            print("✅ Test document retrieved successfully")
        
        # Clean up - remove test document
        collection.delete_one({'_id': result.inserted_id})
        print("✅ Test document cleaned up")
        
    except Exception as e:
        print(f"❌ Database operation failed: {e}")
        return False
    
    # Step 4: Test your registration functions
    print("\n4️⃣  Testing Registration Functions...")
    try:
        # Import your mongodb connection
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from registration.mongodb import mongodb
        
        print("✅ Successfully imported your mongodb connection")
        
        # Test registration stats
        stats = mongodb.get_registration_stats()
        print(f"✅ Current registrations: {stats.get('total_registrations', 0)}")
        
        # Test getting registrations
        registrations = mongodb.get_registrations(limit=5)
        print(f"✅ Retrieved {len(registrations)} recent registrations")
        
    except ImportError as e:
        print(f"⚠️  Could not import your registration.mongodb module: {e}")
        print("💡 This is OK if you haven't created it yet or running from wrong directory")
    except Exception as e:
        print(f"❌ Registration function test failed: {e}")
        return False
    
    # Step 5: Connection info
    print("\n5️⃣  Connection Information...")
    try:
        server_info = client.server_info()
        print(f"✅ MongoDB version: {server_info.get('version', 'Unknown')}")
        
        # Database stats
        db_stats = db.command("dbstats")
        print(f"✅ Database size: {db_stats.get('dataSize', 0)} bytes")
        print(f"✅ Collections: {len(db.list_collection_names())}")
        
    except Exception as e:
        print(f"⚠️  Could not get server info: {e}")
    
    finally:
        client.close()
        print("\n🔒 Connection closed safely")
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED! Your MongoDB Atlas connection is working perfectly!")
    print("=" * 60)
    return True

def test_environment_setup():
    """Test if all required packages and files are present"""
    
    print("\n🔧 Environment Setup Check...")
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("❌ .env file not found")
        print("📝 Create a .env file with:")
        print("   MONGODB_CONNECTION_STRING=your_atlas_connection_string")
        return False
    
    print("✅ .env file found")
    
    # Check required packages
    required_packages = [
        ('pymongo', 'pymongo'),
        ('python-dotenv', 'dotenv')
    ]
    missing_packages = []
    
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
            print(f"✅ {package_name} installed")
        except ImportError:
            missing_packages.append(package_name)
            print(f"❌ {package_name} not installed")
    
    if missing_packages:
        print(f"\n📦 Install missing packages:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting MongoDB Atlas Connection Test...\n")
    
    # First check environment
    if not test_environment_setup():
        print("\n❌ Environment setup failed. Please fix the issues above.")
        sys.exit(1)
    
    # Then test connection
    if test_mongodb_connection():
        print("\n✅ Your MongoDB Atlas setup is ready for Django!")
        sys.exit(0)
    else:
        print("\n❌ Connection test failed. Please check the errors above.")
        sys.exit(1)