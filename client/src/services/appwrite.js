import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Matches server .env
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Project ID from env

export const account = new Account(client);
export const databases = new Databases(client);

export default client;

export const login = async (email, password) => {
    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        throw error;
    }
};

export const signup = async (email, password, name) => {
    try {
        return await account.create(ID.unique(), email, password, name);
    } catch (error) {
        throw error;
    }
};

export const passwordRecovery = async (email) => {
    try {
        // Redirect to reset-password page with userId and secret. 
        // NOTE: 'http://localhost:5173/reset-password' must be added to Appwrite Console -> Auth -> Security -> Redirect URLs
        return await account.createRecovery(email, `${window.location.origin}/reset-password`);
    } catch (error) {
        throw error;
    }
};

export const completePasswordRecovery = async (userId, secret, password, passwordAgain) => {
    try {
        return await account.updateRecovery(userId, secret, password, passwordAgain);
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

export const ensureSession = async () => {
    try {
        return await account.get();
    } catch (error) {
        // Suppress 401 errors as they are expected when no user is logged in
        // Browsers will still log the network 401, but we handle it gracefully here
        return null;
    }
};

export const getAuditHistory = async (userId) => {
    // Hardcoded IDs for now, ideally from env
    const DATABASE_ID = 'nexa-db';
    const COLLECTION_ID = 'audits';

    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                // Query.equal('userId', userId) // Uncomment when permissions/indexes are set
            ]
        );
        // Filter client-side if needed for now until indexes are made
        return response.documents.filter(doc => doc.userId === userId);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        return [];
    }
};
