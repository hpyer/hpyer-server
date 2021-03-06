import { ConnectionConfig, Pool, PoolConnection } from 'mysql';
import ContractSql from '../Contracts/ContractSql';
import { HpyerDbSqlTransactionClosure, HpyerServerConfigDbQueryOption } from '../../Types/Hpyer';
export declare const DefaultQueryOptions: HpyerServerConfigDbQueryOption;
declare class ProviderMysql extends ContractSql {
    pool: Pool;
    conn: PoolConnection;
    options: ConnectionConfig;
    constructor(pool: Pool, options: ConnectionConfig);
    disconnect(): boolean;
    getConnection(): Promise<PoolConnection>;
    execute(sql: string, values?: object, fetch_last_id?: boolean): Promise<any>;
    transaction(closure: HpyerDbSqlTransactionClosure): Promise<any>;
    startTrans(): Promise<any>;
    commit(): Promise<any>;
    rollback(): Promise<any>;
    findAll(table: string, where?: object | Array<string | boolean> | string, options?: HpyerServerConfigDbQueryOption | string): Promise<any>;
    findOne(table: string, where?: object | Array<string | boolean> | string, options?: HpyerServerConfigDbQueryOption | string): Promise<any>;
    findCount(table: string, where?: object | Array<string | boolean> | string, field?: string): Promise<any>;
    create(table: string, data: object, fetch_last_id?: boolean): Promise<any>;
    replace(table: string, data: object): Promise<any>;
    update(table: string, data: object, where?: object | Array<string | boolean> | string): Promise<boolean>;
    delete(table: string, where?: object | Array<string | boolean> | string): Promise<boolean>;
    increase(table: string, field: string, where?: object | Array<string | boolean> | string, qty?: number): Promise<boolean>;
    discrease(table: string, field: string, where?: object | Array<string | boolean> | string, qty?: number): Promise<boolean>;
}
declare const getDbInstance: (options: ConnectionConfig) => ProviderMysql;
export default getDbInstance;
