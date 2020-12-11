import { PoolConnection } from 'mysql';
import ContractSql from '../Contracts/ContractSql';
import { HpyerServerConfigDbQueryOption } from '../../Types/Hpyer';
export declare const DefaultQueryOptions: HpyerServerConfigDbQueryOption;
declare class ProviderMysql extends ContractSql {
    conn: PoolConnection;
    constructor(conn: PoolConnection);
    escape(str: string | Array<string>): Array<string> | string;
    parseWhereValue(k: string, v: string | Array<string>): string;
    parseWhereItem(k: string, v: string | Array<string | boolean>): string;
    parseWhere(where: object | Array<string | boolean> | string): string;
    disconnect(): boolean;
    execute(sql: string, values?: object, fetch_last_id?: boolean): Promise<any>;
    transaction(callback: any): Promise<boolean>;
    startTrans(): Promise<any>;
    commit(): Promise<any>;
    rollback(): Promise<any>;
    findAll(table: string, where?: object | Array<string | boolean> | string, options?: HpyerServerConfigDbQueryOption): Promise<any>;
    findOne(table: string, where?: object | Array<string | boolean> | string, options?: HpyerServerConfigDbQueryOption): Promise<any>;
    findCount(table: string, where?: object | Array<string | boolean> | string, field?: string): Promise<any>;
    create(table: string, data: object, fetch_last_id?: boolean): Promise<any>;
    replace(table: string, data: object): Promise<any>;
    update(table: string, data: object, where?: object | Array<string | boolean> | string): Promise<boolean>;
    delete(table: string, where?: object | Array<string | boolean> | string): Promise<boolean>;
    increase(table: string, field: string, where?: object | Array<string | boolean> | string, qty?: number): Promise<boolean>;
    discrease(table: string, field: string, where?: object | Array<string | boolean> | string, qty?: number): Promise<boolean>;
}
declare const getConnection: (options: any) => Promise<ProviderMysql>;
export default getConnection;
