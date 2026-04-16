// MongoDB Initialization Script
// This script runs when the MongoDB container is first created

// Create admin user
db = db.getSiblingDB('admin');
db.createUser({
    user: process.env.MONGO_ROOT_USER || 'admin',
    pwd: process.env.MONGO_ROOT_PASSWORD || 'password',
    roles: [
        { role: 'root', db: 'admin' }
    ]
});

// Create application database and user
db = db.getSiblingDB(process.env.MONGO_DATABASE || 'uni-notify');

// Create application user with readWrite role
db.createUser({
    user: 'appuser',
    pwd: 'apppassword', // Change this in production!
    roles: [
        { role: 'readWrite', db: process.env.MONGO_DATABASE || 'uni-notify' }
    ]
});

// Create collections with validators for better data integrity
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
                name: { bsonType: 'string' },
                email: { bsonType: 'string' },
                password: { bsonType: 'string' },
                role: { 
                    bsonType: 'string',
                    enum: ['student', 'lecturer', 'hod', 'dean', 'principal', 'admin', 'guild_president']
                }
            }
        }
    }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });
db.users.createIndex({ school: 1 });

// Events collection
db.createCollection('events');
db.events.createIndex({ createdBy: 1 });
db.events.createIndex({ createdAt: -1 });
db.events.createIndex({ status: 1 });

// Notifications collection
db.createCollection('notificationlogs');
db.notificationlogs.createIndex({ studentId: 1, createdAt: -1 });
db.notificationlogs.createIndex({ status: 1 });
db.notificationlogs.createIndex({ referenceId: 1 });

// Announcements collection
db.createCollection('announcements');
db.announcements.createIndex({ createdAt: -1 });
db.announcements.createIndex({ status: 1 });
db.announcements.createIndex({ lecturer: 1 });

// Governance Announcements
db.createCollection('governanceannouncements');
db.governanceannouncements.createIndex({ authorId: 1, createdAt: -1 });
db.governanceannouncements.createIndex({ status: 1 });
db.governanceannouncements.createIndex({ pendingApprovalFromRole: 1 });

print('==========================================');
print('MongoDB initialization complete!');
print('Database: ' + (process.env.MONGO_DATABASE || 'uni-notify'));
print('==========================================');
