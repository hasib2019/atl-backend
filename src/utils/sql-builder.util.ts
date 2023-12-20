import { toSnakeKeys } from "keys-transform";
import lo from "lodash";
import { ISqlBuilderResult } from "../types/interfaces/sql-builder.interface";

/**
 * build where condition dynamically
 */
export function buildWhereSql(
  sql: string,
  filter: Object,
  skip: number,
  limit: number,
  injectionFilter: Function,
  operator: "AND" | "OR" = "AND"
): ISqlBuilderResult {
  let where: string = " WHERE";
  let params: any[] = [];
  let index = 0;
  for (let [key, value] of Object.entries(filter)) {
    const newKey = injectionFilter(key);
    if (index === lo.size(filter) - 1) where += ` ${newKey} = $${index + 1}`;
    else where += ` ${newKey} = $${index + 1} ${operator}`;
    params.push(value);
    index++;
  }
  sql += where;
  sql += ` ORDER BY id ASC LIMIT $${lo.size(filter) + 1} OFFSET $${lo.size(filter) + 2};`;
  params.push(limit, skip);
  return { sql, params };
}

/**
 * build aggregate where condition dynamically
 */
export function buildWhereAggrSql(
  sql: string,
  filter: Object,
  injectionFilter: Function,
  operator: "AND" | "OR" = "AND"
): ISqlBuilderResult {
  let where: string = " WHERE";
  let params: any[] = [];
  let index = 0;
  for (let [key, value] of Object.entries(filter)) {
    const newKey = injectionFilter(key);
    if (index === lo.size(filter) - 1) where += ` ${newKey} = $${index + 1}`;
    else where += ` ${newKey} = $${index + 1} ${operator}`;
    params.push(value);
    index++;
  }
  sql += where + ";";
  return { sql, params };
}

/**
 * build insert statement dynamically
 */
export function buildInsertSql(tableName: string, data: Object): ISqlBuilderResult {
  let attrs = "";
  let paramsStr = "";
  let sql = `INSERT INTO ${tableName} `;
  const snakeObject = toSnakeKeys(data);
  const params: any[] = [];
  let counter = 0;
  for (const [k, v] of Object.entries(snakeObject)) {
    attrs = attrs + `${k},`;
    paramsStr = paramsStr + `$${++counter},`;
    params.push(v);
  }
  sql += `(${attrs.slice(0, -1)})` + " VALUES " + `(${paramsStr.slice(0, -1)})`;
  sql += ` RETURNING *;`;

  return { sql, params };
}

/**
 * build update statement dynamically
 * for updating a single row by id
 */
export function buildUpdateSql(tableName: string, id: number, data: Object): ISqlBuilderResult {
  let attrs = "";
  let sql = `UPDATE ${tableName} SET `;
  const snakeObject = toSnakeKeys(data);
  const params: any[] = [];
  let counter = 0;
  for (const [k, v] of Object.entries(snakeObject)) {
    attrs += `${k} = $${++counter},`;
    params.push(v);
  }
  sql += attrs.slice(0, -1);
  sql += ` WHERE id = $${++counter}`;
  sql += ` RETURNING *;`;
  params.push(id);

  return { sql, params };
}

/**
 * Build update with where SQL dynamically
 */
export function buildUpdateWithWhereSql(tableName: string, whereData: Object, updateData: Object): ISqlBuilderResult {
  let attrs = "";
  let sql = `UPDATE ${tableName} SET `;
  const snakeUpdateDate = toSnakeKeys(updateData);
  const snakeWhereData = toSnakeKeys(whereData);
  const params: any[] = [];
  let counter = 0;
  for (const [k, v] of Object.entries(snakeUpdateDate)) {
    attrs += `${k} = $${++counter},`;
    params.push(v);
  }
  sql += attrs.slice(0, -1);
  let where = " WHERE ";
  for (const [k, v] of Object.entries(snakeWhereData)) {
    where += `${k} = $${++counter} AND `;
    params.push(v);
  }
  sql += where.slice(0, -4);
  sql += ` RETURNING *;`;
  return { sql, params };
}
export function buildInsertMultipleRow(tableName: string, data: object[], jsonField?: any) {
  let sql = `INSERT INTO ${tableName}`;
  let sqlKeys = Object.keys(toSnakeKeys(data[0]));
  let keysList = ``;
  for (const [i, e] of sqlKeys.entries()) {
    if (i == 0) {
      keysList = keysList + `(${e},`;
    } else if (i == sqlKeys.length - 1) {
      keysList = keysList + `${e})`;
    } else {
      keysList = keysList + `${e},`;
    }
  }

  sql = sql + "" + keysList + "" + "VALUES" + "";

  let start = 1;
  const params = [];
  let parameterList = ``;
  for (const [index, element] of data.entries()) {
    let keys = Object.keys(element);
    let v = ``;
    for (const [i, e] of keys.entries()) {
      if (i == 0) {
        v = v + `($${start},`;
        start++;
      } else if (i == keys.length - 1) {
        v = v + `$${start})`;
        start++;
      } else {
        v = v + `$${start},`;
        start++;
      }
      //@ts-ignore
      jsonField.length > 0 && jsonField.includes(e)
        ? //@ts-ignore
          params.push(JSON.stringify(element[e]))
        : //@ts-ignore
          params.push(element[e]);
    }
    if (index == data.length - 1) {
      parameterList = parameterList + "" + v;
    } else {
      parameterList = parameterList + "" + v + ",";
    }
  }

  sql = sql + parameterList + "" + "returning * ;";

  return { sql, params };
}

export function buildSql(
  sql: string,
  filter: any,
  operator: "AND" | "OR" = "AND",
  filterFunc: Function,
  primaryId: string,
  limit?: number,
  skip?: number
): string[] {
  let where: string = " where";
  let plainSql = "";
  const keys: string[] = Object.keys(filter);

  for (let [index, key] of keys.entries()) {
    if (typeof filter[key] == "object") {
      var newKey = filterFunc(key);
      if (index === keys.length - 1) where += ` ${newKey} = ANY ($${index + 1})`;
      else where += ` ${newKey} =  ANY ($${index + 1} ) ${operator}`;
    } else {
      var newKey = filterFunc(key);
      if (index === keys.length - 1) where += ` ${newKey} = $${index + 1}`;
      else where += ` ${newKey} = $${index + 1} ${operator}`;
    }
  }
  if (!(Object.keys(filter).length > 0)) {
    return [sql + ` ORDER BY ${primaryId} LIMIT ${limit} OFFSET ${skip}`, sql];
  }
  plainSql = sql + where;
  where = !limit && !skip ? where : where + ` ORDER BY ${primaryId} LIMIT ${limit} OFFSET ${skip}`;
  return [sql + where, plainSql];
}
