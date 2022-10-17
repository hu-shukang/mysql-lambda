import { createConnection, Connection } from 'mysql2/promise'
import { SecretsManager } from 'aws-sdk'

export class MysqlService {
    public async executeSql(sql: string, host: string): Promise<any> {
        let conn: Connection | undefined = undefined;
        try {
            conn = await this.getConnection(host);
            const [rows] = await conn.execute(sql);
            return rows;
        } finally {
            this.closeConnection(conn);
        }
    }
    private async getConnection(host: string): Promise<Connection> {
        // const secretInfo = {"password":"*KIW^]f8u3)!Ib{u","dbname":"testdb","engine":"mysql","port":3306,"dbInstanceIdentifier":"instance1","host":"instance1.cynrpxwvnzys.ap-northeast-1.rds.amazonaws.com","username":"admin"};
        const secretInfo = await this.getSecretInfo();
        console.log('secretInfo', secretInfo);
        const conn = await createConnection({
            // testrds-dbproxy.proxy-cynrpxwvnzys.ap-northeast-1.rds.amazonaws.com
            host: host, // 'testrds-dbproxy.proxy-cynrpxwvnzys.ap-northeast-1.rds.amazonaws.com',
            user: secretInfo.username,
            password: secretInfo.password,
            database: 'mysql',
        });

        return conn;
    }

    private async closeConnection(conn: Connection | undefined) {
        if (conn == undefined) {
            return;
        }
        try {
            await conn.end()
        } catch (e: any) {
            console.log(e.message);
        }
    }

    private async getSecretInfo(): Promise<any> {
        const secretsManager = new SecretsManager({
            region: "ap-northeast-1",
        })
        const response = await secretsManager.getSecretValue({
        SecretId: 'RDSSecret',
        }).promise();
        console.log(response);
        if (response.SecretString == undefined) {
            return {}
        }
        return JSON.parse(response.SecretString);
    }
}