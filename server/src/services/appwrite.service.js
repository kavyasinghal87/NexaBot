const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Helper to get Database ID and Collection ID (hardcoded for now or from env)
// Ideally these should be in env, but for simplicity we'll assume a standard ID or pass it in.
// Let's assume the user has created a database and collection.
// We will use placeholders that the user must verify.
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'nexa-db';
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID || 'audits';

const { Query } = require('node-appwrite');

async function saveAuditLog(data) {
    try {
        // Inject dummy data to satisfy existing required fields in user's schema
        const payload = {
            ...data,
            repoName: 'Nexa-Audit',
            status: 'Completed',
            auditResult: 'Analysis Completed', // Satisfy required 'auditResult' field
            prNumber: 1 // Satisfy required 'prNumber' field
        };

        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            payload
        );
        return response;
    } catch (error) {
        console.error('Appwrite Save Error:', error);
        throw error;
    }
}

async function getUserAudits(userId) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt') // Use system attribute $createdAt
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Appwrite Fetch Error:', error);
        return [];
    }
}

async function deleteUserAudits(userId) {
    try {
        const audits = await getUserAudits(userId);
        console.log(`Found ${audits.length} audits to delete for user ${userId}`);

        if (audits.length === 0) return { success: true, count: 0 };

        const deletePromises = audits.map(audit =>
            databases.deleteDocument(DATABASE_ID, COLLECTION_ID, audit.$id)
        );
        await Promise.all(deletePromises);
        return { success: true, count: audits.length };
    } catch (error) {
        console.error('Appwrite Delete Error:', error);
        throw error;
    }
}

module.exports = {
    saveAuditLog,
    getUserAudits,
    deleteUserAudits
};
