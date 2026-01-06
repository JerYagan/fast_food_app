import { CreateUserParams, GetMenuParams, MenuItem, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite"

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    platform: "com.jeryagan.foodordering",
    databaseId: '695ba21c002536d0fafd',
    bucketId: '695cd4e60031b8199e1c',
    userCollectionId: '695ba32000382a543a09',
    categoriesCollectionId: '695cd1ae000f1bcce63a',
    menuCollectionId: '695cd26000169457780f',
    customizationsCollectionId: '695cd365002341cd7b6f',
    menuCustomizationsCollectionId: '695cd4050027602d66e2'
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!)
    .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name } : CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if (!newAccount) throw Error;
        await signIn({ email, password})

        const avatarUrl = avatars.getInitialsURL(name);

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                $id: newAccount.$id,
                email,
                name,
                avatar: avatarUrl
            },
        )

        return newUser;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signIn = async ({ email, password } : SignInParams) => {
    try {
        await account.createSession(email, password);

        const jwt = await account.createJWT();
        client.setJWT(jwt.jwt)

        return jwt;
    } catch (e) {
        throw new Error(e as string)
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("$id", currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (e) {
        console.log(e)
        throw new Error(e as string);
    }
}

export const getMenu = async ({ category, query } : GetMenuParams) => {
    try {
        const queries: string[] = [];
        if(category) queries.push(Query.equal('categories', category))
        if(query) queries.push(Query.search('name', query))

        const menus = await databases.listDocuments<MenuItem>(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        );

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )
        
        return categories.documents;
    } catch (e) {
        throw new Error(e as string)
    }
}