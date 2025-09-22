import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.config.database import connect_to_mongo, close_mongo_connection, db

async def test_connection():
    """Test MongoDB connection"""
    try:
        await connect_to_mongo()
        
        # Test basic operations
        collection = db.database.test_collection
        
        # Insert a test document
        result = await collection.insert_one({"test": "connection", "status": "success"})
        print(f"Inserted document with ID: {result.inserted_id}")
        
        # Find the document
        document = await collection.find_one({"_id": result.inserted_id})
        print(f"Retrieved document: {document}")
        
        # Clean up
        await collection.delete_one({"_id": result.inserted_id})
        print("Test document cleaned up")
        
        print("✅ Database connection test successful!")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_connection())
