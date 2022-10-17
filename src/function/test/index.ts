import { APIGatewayProxyEvent } from "aws-lambda";
import { mysqlService } from 'service';

export const handler = async function (event: APIGatewayProxyEvent) {
    const host = JSON.parse(event.body ?? '{}').host;
    const sql = 'show databases';
    console.log('sql:', sql);
    const result = await mysqlService.executeSql(sql, host);
    console.log(JSON.stringify(result));
    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };
};