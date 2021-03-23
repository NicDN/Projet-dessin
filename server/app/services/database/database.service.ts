import { injectable } from 'inversify';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';

const DATABASE_URL = 'mongodb+srv://admin:log2990-309@cluster0.vmeuf.mongodb.net/polydessin?retryWrites=true&w=majority';
const DATABASE_NAME = 'polydessin';

// mongoDB infos:
// user adress: nicolas.demersneuwirth@gmail.com
// password: log2990-309

@injectable()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url, this.options);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }

        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    get database(): Db {
        return this.db;
    }
}
