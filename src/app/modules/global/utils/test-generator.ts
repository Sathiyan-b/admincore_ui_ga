import express from "express";
import _, { indexOf, join, replace, template, update } from "lodash";

let database_type = "SQL" || "Postgres";
database_type = "SQL";

let input = {
  name: "PointofCareSubscribers",
  columns: [
    {
      name: "id",
      type: "number",
    },
    {
      name: "pointofcare_id",
      type: "number",
    },
    {
      name: "user_id",
      type: "number",
    },
    {
      name: "created_on",
      type: "date",
    },
    {
      name: "created_by",
      type: "number",
    },
    {
      name: "modified_on",
      type: "date",
    },
    {
      name: "modified_by",
      type: "number",
    },
    {
      name: "is_active",
      type: "boolean",
    },
    {
      name: "is_factory",
      type: "boolean",
    },
    {
      name: "app_id",
      type: "number",
    },
    // {
    //   name: "created_by",
    //   type: "number",
    // },
    // {
    //   name: "modified_on",
    //   type: "date",
    // },
    // {
    //   name: "modified_by",
    //   type: "number",
    // },
    // {
    //   name: "is_active",
    //   type: "boolean",
    // },
    // {
    //   name: "is_factory",
    //   type: "boolean",
    // },
    // {
    //   name: "is_factory",
    //   type: "boolean",
    // },
    // {
    //   name: "notes",
    //   type: "string",
    // },
    // {
    //   name: "active_directory_dn",
    //   type: "string",
    // },
    // {
    //   name: "last_password_change",
    //   type: "date",
    // },
    // {
    //   name: "force_password_change",
    //   type: "boolean",
    // },
    // {
    //   name: "login_attemps",
    //   type: "number",
    // },
    // {
    //   name: "user_image_id",
    //   type: "number",
    // },
    // {
    //   name: "app_id",
    //   type: "number",
    // },
    // {
    //   name: "enterprise_id",
    //   type: "number",
    // },
    // {
    //   name: "ent_location_id",
    //   type: "number",
    // },
    // {
    //   name: "lang_code",
    //   type: "string",
    // },
    // {
    //   name: "created_by",
    //   type: "number",
    // },
    // {
    //   name: "modified_by",
    //   type: "number",
    // },
    // {
    //   name: "created_on",
    //   type: "date",
    // },
    // {
    //   name: "modified_on",
    //   type: "date",
    // },
    // {
    //   name: "is_active",
    //   type: "boolean",
    // },
    // {
    //   name: "is_suspended",
    //   type: "boolean",
    // },
    // {
    //   name: "parent_id",
    //   type: "number",
    // },
    // {
    //   name: "is_factory",
    //   type: "boolean",
    // },
    // {
    //   name: "notes",
    //   type: "string",
    // },
  ],
};

/* model */

var properties: Array<string> = [];
_.forEach(input.columns, (v) => {
  var property: string = "";

  switch (v.type) {
    case "string":
      property = `${v.name}:string = "";`;
      break;
    case "number":
      if (v.name == "id") property = `${v.name}:number = 0;`;
      else property = `${v.name}:number = 0`;
      break;
    case "date":
      property = `${v.name}:Date = new Date(9999, 11, 31, 23, 59, 59);`;
      break;
    case "boolean":
      property = `${v.name}:boolean = false;`;

    default:
      break;
  }
  properties.push(property);
});

// version_name: string | null = null;

let model_template: string = `
  export class ${input.name} extends Base{
    ${properties.join("\n")}
  }
  export class ${input.name}Wrapper extends @name{
  
  }
  `;
let modelname = input.name;
let modelpropertylist = `${properties.join("\n")}`;
let model = _.replace(model_template, /@name/g, modelname);
model = _.replace(model, /@propertylist/g, modelpropertylist);

// console.log(model);

// let _model = `export class ${input.name} from base{
//   ${model_template}
// }`
// console.log(_model)

// ***************************************************************************************************************
/* service */
/* select query */
let table_name_path = input.name.toLowerCase();
let file_path_service_template: string = `
import _ from "lodash";
import { Pool, PoolClient } from "pg";
import { DB, Environment, QueryBuilder, using } from "../../global/utils";
import { @tablename, @tablenameWrapper } from "../models/@tablepath.model";
import { BaseService } from "./base.service";`;

let table_name = input.name;

let file_path_service_entity_template = _.replace(
  file_path_service_template,
  /@tablename/g,
  table_name
);

let table_name_path_temp = _.replace(
  file_path_service_entity_template,
  /@tablepath/g,
  table_name_path
);

var sql_select_query: string = "";
var sql_insert_query: string = "";
var sql_update_query: string = "";
var sql_delete_query: string = "";
var select_method: string = "";
var select_transaction: string = "";
var insert_method: string = "";
var insert_transaction: string = "";
var update_method: string = "";
var update_transaction: string = "";
var delete_method: string = "";
var delete_transaction: string = "";
var sql_select_query_template: string = "";
var select_method_template: string = "";
var select_transaction_template: string = "";
var sql_insert_query_template: string = "";
var sql_update_query_template: string = "";
var delete_method_template: string = "";
var insert_query_name: string = "";
var updatequerytablename: string = "";
var update_method_tablename: string = "";
var delete_table_name: string = "";
var insert_query_table_name: string = "";
var sql_update_query_name: string = "";
var delete_method_name: string = "";
var insert_query_template: string = "";
var selectmodelnamereplace: string = "";
var insert_query_template_test: string = "";
var sql_insert_query_test: string = "";
var selectmodelname_: string = "";
var insert_method_tablename: string = "";
var select_transaction_1: string = "";

if (database_type === "Postgres") {
  sql_select_query_template = `
      sql_select : string = \`
      SELECT @columnlist
      FROM @tablename @alias
      @condition;
      \`;
    `;
  let selectquerytablename = input.name.toLowerCase();
  let selectqueryalias = _.filter(
    input.name.split(/(?=[A-Z])/).join(""),
    (v) => {
      return v == v.toUpperCase();
    }
  )
    .join("")
    .toLowerCase();
  let selectquerycolumnlist = _.map(input.columns, (v, i) => {
    return `${i == 0 ? "" : ""}${selectqueryalias}.${v.name}`;
  }).join(", ");
  sql_select_query = _.replace(
    sql_select_query_template,
    /@tablename/g,
    selectquerytablename
  );
  sql_select_query = _.replace(sql_select_query, /@alias/g, selectqueryalias);
  sql_select_query = _.replace(
    sql_select_query,
    /@columnlist/,
    selectquerycolumnlist
  );

  // select method
  select_method_template = `public async select(
  _req: @tablename
): Promise<Array<@tablename>> {
  var result: Array<@tablename> = [];
  try {
    await using(this.db.getDisposablePool(), async (pool) => {
      var client = await pool.connect();
      if (client != null) {
        result = await this.selectTransaction(client, _req);
      }
    });
  } catch (error) {
    throw error;
  }
  return result;
}`;

  let selectmodelname = modelname;

  select_method = _.replace(
    select_method_template,
    /@tablename/g,
    selectmodelname
  );

  /* select transaction */
  select_transaction_template = `
  public async selectTransaction(
      _client: PoolClient,
      _req: @modelname
    ): Promise<Array<@modelname>> {
      var result: Array<@modelname> = [];
      try {
        var query: string = this.sql_select;
        var condition_list: Array<string> = [];
        if (_req.id > 0) {
          condition_list.push(\`@modelname.id = \${_req.id}\`);
        }
        if (condition_list.length > 0) {
          query = query.replace(
            /@condition/g,
            \`WHERE \${condition_list.join(" and ")}\`
          );
        } else {
          query = query.replace(/@condition/g, "");
        }
        var { rows } = await _client.query(query);
        if (rows.length > 0) {
          _.forEach(rows, (v) => {
            var temp: @modelname = new @modelname();
            @propertyassignmentlist
            result.push(temp);
          });
        }
      } catch (error) {
        throw error;
      }
      return result;
    }
  `;
  let selecttransmodelname = modelname;

  let selecttranspropertyassignmentlist = _.map(input.columns, (v) => {
    let propertyassignment = "";
    switch (v.type) {
      case "number":
        if (v.name == "id")
          propertyassignment = `temp.${v.name} = v.${v.name} != null ? parseInt(v.${v.name}) : 0;`;
        else
          propertyassignment = `temp.${v.name} = v.${v.name} != null ? parseInt(v.${v.name}) : null;`;
        break;
      case "string":
      case "boolean":
      case "date":
        propertyassignment = `temp.${v.name} = v.${v.name};`;
        break;
      default:
        break;
    }
    return propertyassignment;
  }).join("\n");

  select_transaction = _.replace(
    select_transaction_template,
    /@modelname/g,
    selecttransmodelname
  );
  select_transaction = _.replace(
    select_transaction,
    / @propertyassignmentlist/,
    selecttranspropertyassignmentlist
  );

  // ****************************************************************************************************************
  // f query
  sql_insert_query_template = `
sql_insert: string = \`
INSERT INTO @tablename(@columnlist)
VALUES (@columnvalues)
RETURNING *;  
\`;
`;

  // insert method

  let insert_method_template: string = `  public async insert(_req: @tablename): Promise<@tablename> {
  try {
    await using(this.db.getDisposablePool(), async (pool) => {
      var client = await pool.connect();
      if (client != null) {
        await this.insertTransaction(client, _req);
      }
    });
  } catch (error) {
    throw error;
  }
  return _req;
}`;
  let insertquerytablename = input.name;

  insert_method = _.replace(
    insert_method_template,
    /@tablename/g,
    insertquerytablename
  );

  let insertqueryvalues: any = _.map(input.columns, (v, i) => {
    return `${"$" + (i + 1)}`;
  }).join(", ");

  let insertquerycolumnlist = _.map(input.columns, (v) => {
    return `${v.name}`;
  }).join(", ");

  insert_query_template = input.name.toLowerCase();
  sql_insert_query = _.replace(
    sql_insert_query_template,
    /@tablename/g,
    insert_query_template
  );

  sql_insert_query = _.replace(
    sql_insert_query,
    /@columnvalues/g,
    insertqueryvalues
  );

  sql_insert_query = _.replace(
    sql_insert_query,
    /@columnlist/g,
    insertquerycolumnlist
  );

  // insert transcation

  let insert_transaction_template = `
public async insertTransaction(
    _client: PoolClient,
    _req: @modelname
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;
      _req.version = 1;

      var { rows } = await _client.query(this.sql_insert, [
        @parametername
       
      ]);
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }`;

  let parameternameassignmentlist: any = _.map(input.columns, (v) => {
    return `_req.${v.name}`;
  }).join(",\n");

  let inserttransmodelname = input.name;

  insert_transaction = _.replace(
    insert_transaction_template,
    /@modelname/g,
    inserttransmodelname
  );

  insert_transaction = _.replace(
    insert_transaction,
    /@parametername/g,
    parameternameassignmentlist
  );

  // ****************************************************************************************************************
  // update query

  sql_update_query_template = `sql_update: string = \`
    UPDATE @tablename
    SET @tablevalues
    WHERE @tableid
    RETURNING *;
  \`;
  `;

  updatequerytablename = input.name.toLowerCase();

  sql_update_query = _.replace(
    sql_update_query_template,
    /@tablename/g,
    selectquerytablename
  );

  // update_method

  let update_method_template: string = `  public async update(_req: @tablename): Promise<@tablename> {
  try {
    await using(this.db.getDisposablePool(), async (pool) => {
      var client = await pool.connect();
      if (client != null) {
        await this.updateTransaction(client, _req);
      }
    });
  } catch (error) {
    throw error;
  }
  return _req;
}`;

  update_method_tablename = input.name;

  update_method = _.replace(
    update_method_template,
    /@tablename/g,
    update_method_tablename
  );

  let updatesetvalues: any = _.map(input.columns, (v, i) => {
    if (v.name == "id") {
      return " ";
    } else {
      return `${v.name}${" = $" + (i + 1)}${
        i == input.columns.length - 1 ? "" : ","
      }`;
    }
  }).join(" ");

  sql_update_query = _.replace(
    sql_update_query,
    /@tablevalues/,
    updatesetvalues
  );

  let whereconditionquery = "id = $1";

  sql_update_query = _.replace(
    sql_update_query,
    /@tableid/,
    whereconditionquery
  );

  // update transaction

  let update_transaction_template = `public async updateTransaction(
    _client: PoolClient,
    _req: @tablename
  ): Promise<void> {
    try {
      _req.modified_on = new Date();

      var { rows } = await _client.query(this.sql_update, [
      @parameternames
      ]);
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
        _req.version = row.version != null ? parseInt(row.version) : 0;
      }
    } catch (error) {
      throw error;
    }
  }`;

  let parameternamesassignmentlist: any = _.map(input.columns, (v) => {
    return `_req.${v.name}`;
  }).join(",\n");

  update_transaction = _.replace(
    update_transaction_template,
    /@parameternames/g,
    parameternamesassignmentlist
  );
  update_transaction = _.replace(
    update_transaction,
    /@tablename/,
    update_method_tablename
  );

  // ****************************************************************************************************************
  // delete query

  let sql_delete_query_template = `  sql_delete: string =
\` DELETE FROM public.@tablename
   WHERE @deletecondition
   RETURNING *; \`
`;

  let deletequerytablename = input.name.toLowerCase();

  sql_delete_query = _.replace(
    sql_delete_query_template,
    /@tablename/,
    deletequerytablename
  );

  let whereconditionquerydelete = "id = $1";
  sql_delete_query = _.replace(
    sql_delete_query,
    /@deletecondition/,
    whereconditionquerydelete
  );

  // delete method

  let delete_method_template: string = `public async delete(_req: @tablename): Promise<@tablename> {
  try {
    await using(this.db.getDisposablePool(), async (pool) => {
      var client = await pool.connect();
      if (client != null) {
        await this.deleteTransaction(client, _req);
      }
    });
  } catch (error) {
    throw error;
  }
  return _req;
}`;

  delete_table_name = input.name;

  delete_method = _.replace(
    delete_method_template,
    /@tablename/g,
    delete_table_name
  );

  // delete transaction
  let delete_transaction_template: string = `public async deleteTransaction(
    _client: PoolClient,
    _req: @tablename
  ): Promise<void> {
    try {
      _req.modified_on = new Date();

      var { rows } = await _client.query(this.sql_update, [
      @params
      ]);
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
        _req.version = row.version != null ? parseInt(row.version) : 0;
      }
    } catch (error) {
      throw error;
    }
  }`;

  let paramsnamesassignmentlist: any = _.map(input.columns, (v) => {
    return `_req.${v.name}`;
  }).join(",\n");

  delete_transaction = _.replace(
    delete_transaction_template,
    /@params/g,
    paramsnamesassignmentlist
  );
  delete_transaction = _.replace(
    delete_transaction,
    /@tablename/,
    delete_table_name
  );
} else if (database_type == "SQL") {
  sql_select_query_template = `
      sql_select : string = \`
      SELECT @columnlist
      FROM @tablename 
      @condition;
      \`;
    `;
  let selectquerytablename = input.name.toLowerCase();
  let selectqueryalias = _.filter(
    input.name.split(/(?=[A-Z])/).join(""),
    (v) => {
      return v == v.toUpperCase();
    }
  )
    .join("")
    .toLowerCase();
  let selectquerycolumnlist = _.map(input.columns, (v, i) => {
    return `${i == 0 ? "" : ""}${input.name.toLowerCase()}.${v.name}`;
  }).join(", ");
  sql_select_query = _.replace(
    sql_select_query_template,
    /@tablename/g,
    selectquerytablename
  );
  sql_select_query = _.replace(sql_select_query, /@alias/g, selectqueryalias);
  sql_select_query = _.replace(
    sql_select_query,
    /@columnlist/,
    selectquerycolumnlist
  );

  // select method
  select_method_template = `  public async select(
  _req: @tablename
): Promise<Array<@tablename>> {
  var result: Array<@tablename> = [];
  try {
    await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        result = await this.selectTransaction(db, _req);
      
    });
  } catch (error) {
    throw error;
  }
  return result;
}`;

  let selectmodelname = modelname;

  select_method = _.replace(
    select_method_template,
    /@tablename/g,
    selectmodelname
  );

  /* select transaction */
  let select_transaction_template: string = `
  public async selectTransaction(
       db: DB,
      _req: @modelname,
    ): Promise<Array<@modelname>> {
      var result: Array<@modelname> = [];
      try {
        var query: string = this.sql_select;
        var condition_list: Array<string> = [];
        if (_req.id > 0) {
          condition_list.push(\`@modelname.id = \${_req.id}\`);
        }
        if (condition_list.length > 0) {
          query = query.replace(
            /@condition/g,
            \`WHERE \${condition_list.join(" and ")}\`
          );
        } else {
          query = query.replace(/@condition/g, "");
        }
        var rows  = await db.executeQuery(query);
        if (rows.length > 0) {
          _.forEach(rows, (v) => {
            var temp: @modelname = new @modelname();
            @propertyassignmentlist
            result.push(temp);
          });
        }
      } catch (error) {
        throw error;
      }
      return result;
    }
  `;
  let selecttransmodelname = modelname;
  let selecttranspropertyassignmentlist = _.map(input.columns, (v) => {
    let propertyassignment = "";
    switch (v.type) {
      case "number":
        if (v.name == "id")
          propertyassignment = `temp.${v.name} = v.${v.name} != 0 ? parseInt(v.${v.name}) : 0;`;
        else
          propertyassignment = `temp.${v.name} = v.${v.name} != 0 ? parseInt(v.${v.name}) : 0;`;
        break;
      case "string":
        propertyassignment = `temp.${v.name} = (v != null && v.${v.name}.length != 0)? v.${v.name}: ""`;
        break;
      case "boolean":
      case "date":
        propertyassignment = `temp.${v.name} = v.${v.name};`;
        break;
      default:
        break;
    }
    return propertyassignment;
  }).join("\n");

  select_transaction = _.replace(
    select_transaction_template,
    /@modelname/g,
    selecttransmodelname
  );
  select_transaction = _.replace(
    select_transaction,
    / @propertyassignmentlist/,
    selecttranspropertyassignmentlist
  );

  // ****************************************************************************************************************
  // insert query
  sql_insert_query_template = `
sql_insert: string = \`
INSERT INTO @tablename(@columnlist)
VALUES (@columnvalues)
RETURNING *;  
\`;
`;

  insert_query_table_name = _.replace(
    sql_insert_query_template,
    /@tablename/g,
    selectquerytablename
  );

  // insert method

  let insert_method_template: string = `  public async insert(_req: @tablename): Promise<@tablename> {
  try {
    await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
      
        await this.insertTransaction(db, _req);
    });
  } catch (error) {
    throw error;
  }
  return _req;
}`;

  insert_query_name = input.name;
  insert_method = _.replace(
    insert_method_template,
    /@tablename/g,
    insert_query_name
  );

  let insertquerytablename = input.name;
  var temp = _.filter(input.columns, (v1) => {
    return v1.name != "id";
  });
  let insertqueryvalues = _.map(temp, (v1) => {
    return `${"@" + v1.name}`;
  }).join(", ");

  // let insertqueryvalues: any = _.map(input.columns, (v, i) => {
  //   if(v.name == "id"){
  //     return ""} else{
  //   return `${"@" + v.name}`};
  // }).join(", ");

  var temp = _.filter(input.columns, (v1) => {
    return v1.name != "id";
  });
  let insertquerycolumnlist = _.map(temp, (v1) => {
    return `${v1.name}`;
  }).join(", ");

  // let insertquerycolumnlist = _.map(input.columns, (v) => {
  //   if(v.name == "id"){
  //     return null
  //   } else{
  //   return `${v.name}`;}
  // }).join(", ");

  sql_insert_query_test = input.name.toLowerCase();

  sql_insert_query = _.replace(
    sql_insert_query_template,
    /@tablename/g,
    sql_insert_query_test
  );

  sql_insert_query = _.replace(
    sql_insert_query,
    /@columnvalues/g,
    insertqueryvalues
  );

  sql_insert_query = _.replace(
    sql_insert_query,
    /@columnlist/g,
    insertquerycolumnlist
  );

  // insert transcation

  let insert_transaction_template = `
public async insertTransaction(
    db: DB,
    _req: @modelname,
  ): Promise<void> {
    try {
      _req.created_on = new Date();
      _req.is_active = true;

      let rows = await db.executeQuery(this.sql_insert, 
       { @parametername }
       
      );
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }`;

  var temp = _.filter(input.columns, (v1) => {
    return v1.name != "id";
  });
  let parameternameassignmentlist = _.map(temp, (v1) => {
    return `${v1.name}:_req.${v1.name}`;
  }).join(",\n ");

  // let parameternameassignmentlist: any = _.map(input.columns, (v) => {
  //   return `${v.name}:_req.${v.name}`;
  // }).join(",\n");

  let inserttransmodelname = modelname;

  insert_transaction = _.replace(
    insert_transaction_template,
    /@modelname/g,
    inserttransmodelname
  );

  insert_transaction = _.replace(
    insert_transaction,
    /@parametername/g,
    parameternameassignmentlist
  );

  // ****************************************************************************************************************
  // update query

  sql_update_query_template = `sql_update: string = \`
    UPDATE @tablename
    SET @tablevalues
    WHERE @tableid
    RETURNING *;
  \`;
  `;

  let updatequerytablename = input.name.toLowerCase();

  sql_update_query = _.replace(
    sql_update_query_template,
    /@tablename/,
    updatequerytablename
  );

  // update_method

  let update_method_template: string = `public async update(_req: @tablename): Promise<@tablename> {
  try {
    await using(this.db_provider.getDisposableDB(), async (db) => {
      await db.connect();
      await this.updateTransaction(db, _req);
    });
  } catch (error) {
    throw error;
  }
  return _req;
}`;

  sql_update_query_name = input.name;

  update_method = _.replace(
    update_method_template,
    /@tablename/g,
    sql_update_query_name
  );

  let updatesetvalues: any = _.map(input.columns, (v, i) => {
    if (v.name == "id") {
      return "";
    } else {
      return `${v.name}${" = @" + v.name}${
        i == input.columns.length - 1 ? "" : ","
      }`;
    }
  }).join(" ");

  sql_update_query = _.replace(
    sql_update_query,
    /@tablevalues/,
    updatesetvalues
  );

  let whereconditionquery = "id = @id";

  sql_update_query = _.replace(
    sql_update_query,
    /@tableid/,
    whereconditionquery
  );

  // update transaction

  let update_transaction_template = `public async updateTransaction(
    db: DB,
    _req: @tablename
  ): Promise<void> {
    try {
        var rows  = await db.executeQuery(this.sql_update, 
      { @parameternames }
      );
      if (rows.length > 0) {
        let row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }`;

  let parameternamesassignmentlist: any = _.map(input.columns, (v) => {
    return `${v.name}:_req.${v.name}`;
  }).join(",\n");

  update_transaction = _.replace(
    update_transaction_template,
    /@parameternames/g,
    parameternamesassignmentlist
  );
  update_transaction = _.replace(
    update_transaction,
    /@tablename/,
    sql_update_query_name
  );

  // ****************************************************************************************************************
  // delete query

  let sql_delete_query_template = `  sql_delete: string =
\` DELETE FROM @tablename
   WHERE @deletecondition
   RETURNING *; \`
`;

  let deletequerytablename = input.name.toLowerCase();

  sql_delete_query = _.replace(
    sql_delete_query_template,
    /@tablename/,
    deletequerytablename
  );

  let whereconditionquerydelete = "id = @id";
  sql_delete_query = _.replace(
    sql_delete_query,
    /@deletecondition/,
    whereconditionquerydelete
  );

  // delete method

  delete_method_template = `public async delete(_req: @tablename): Promise<@tablename> {
  try {
    await using(this.db_provider.getDisposableDB(), async (db) => {
        await db.connect();
        await this.deleteTransaction(db, _req);
      
    });
  } catch (error) {
    throw error;
  }
  return _req;
}`;

  delete_method_name = input.name;

  delete_method = _.replace(
    delete_method_template,
    /@tablename/g,
    delete_method_name
  );

  // delete transaction
  let delete_transaction_template: string = `public async deleteTransaction(
    db: DB,
    _req: @tablename
  ): Promise<void> {
    try {
      _req.modified_on = new Date();

      var rows  = await db.executeQuery(this.sql_delete, 
      { id:_req.id, }
      );
      if (rows.length > 0) {
        var row = rows[0];
        _req.id = row.id != null ? parseInt(row.id) : 0;
      }
    } catch (error) {
      throw error;
    }
  }`;

  let paramsnamesassignmentlist: any = _.map(input.columns, (v) => {
    return `${v.name}:_req.${v.name}`;
  }).join(",\n");

  delete_transaction = _.replace(
    delete_transaction_template,
    /@params/g,
    paramsnamesassignmentlist
  );
  delete_transaction = _.replace(
    delete_transaction,
    /@tablename/,
    delete_method_name
  );
}

let service = `
class ${input.name}Service extends BaseService {
  ${sql_select_query}
  ${sql_insert_query}
  ${sql_update_query}
  ${sql_delete_query}
  ${select_method}
  ${select_transaction}
  ${insert_method}
  ${insert_transaction}
  ${update_method}
  ${update_transaction}
  ${delete_method}
  ${delete_transaction}
}
`;
// console.log(service);

/* controller */
// controller get
const router = express.Router();
let controllertablename: string = input.name;
let table_name_path_c = input.name.toLowerCase();

let file_path_controller_template = `import express from "express";
import { ActionRes } from "../../global/models/actionres.model";
import { @tablename, @tablenameWrapper } from "../models/@tablepath.model";
import { @tablenameService } from "../service/@tablepath.service";
const router = express.Router();`;

let entity_file_path_controller_template = _.replace(
  file_path_controller_template,
  /@tablename/g,
  controllertablename
);

let table_name_path_controller = _.replace(
  entity_file_path_controller_template,
  /@tablepath/g,
  table_name_path_c
);
/* entity controller */
let entity_controller_template: string = `router.get("/entity", async (req, res, next) => {
        try {
          var result: ActionRes<@tablename> = new ActionRes<@tablename>({
            item: new @tablename(),
          });
          next(result);
        } catch (error) {
          next(error);
        }
      });`;

let entityControllerTemplate = _.replace(
  entity_controller_template,
  /@tablename/g,
  controllertablename
);
// console.log(entityControllerTemplate)

/* get controller */

let get_controller_template: string = `router.post("/get", async (req, res, next) => {
  try {
    var result: ActionRes<Array<@tablename>> = new ActionRes<
      Array<@tablename>
    >();
    var service: @tablenameService = new @tablenameService();
    result.item = await service.select(req.body.item);
    next(result);
  } catch (error) {
    next(error);
  }
});`;

let getControllerTemplate = _.replace(
  get_controller_template,
  /@tablename/g,
  controllertablename
);

// console.log(getControllerTemplate)
// insert controller

let insert_contoller_template: string = `router.post("/insert", async (req, res, next) => {
        try {
          var result: ActionRes<@tablename> = new ActionRes<@tablename>();
          var service: @tablenameService = new @tablenameService();
          result.item = await service.insert(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });`;

let insertControllerTemplate: string = _.replace(
  insert_contoller_template,
  /@tablename/g,
  controllertablename
);

// console.log(insertControllerTemplate);

// update controller

let update_controller_template: string = `router.post("/update", async (req, res, next) => {
        try {
          var result: ActionRes<@tablename> = new ActionRes<@tablename>();
          var service: @tablenameService = new @tablenameService();
          result.item = await service.update(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });`;

let updatecontrollertemplate: string = _.replace(
  update_controller_template,
  /@tablename/g,
  controllertablename
);
// console.log(updatecontrollertemplate);

// delete controller

let delete_controller_template: string = `router.post("/delete", async (req, res, next) => {
        try {
          var result: ActionRes<@tablename> = new ActionRes<@tablename>();
          var service: @tablenameService = new @tablenameService();
          result.item = await service.delete(req.body.item);
          next(result);
        } catch (error) {
          next(error);
        }
      });
      export { router as @tablenameController}`;

let deleteControllerTemplate: string = _.replace(
  delete_controller_template,
  /@tablename/g,
  controllertablename
);

// console.log(deleteControllerTemplate)

let controller: string = `
const router = express.Router();
${entityControllerTemplate}
${getControllerTemplate}
${insertControllerTemplate}
${updatecontrollertemplate}
${deleteControllerTemplate}
`;

import * as fs from "fs";
import * as path from "path";
import { string } from "joi";
import e from "express";

fs.writeFile(
  path.join(
    __dirname,
    `\./src/app/modules/project/controller/${input.name.toLowerCase()}.controller.ts`
  ),
  `${table_name_path_controller}
${entityControllerTemplate}
${getControllerTemplate}
${insertControllerTemplate}
${updatecontrollertemplate}
${deleteControllerTemplate}
`,
  (err) => {
    console.error(err);
  }
);

fs.writeFile(
  path.join(
    __dirname,
    `./src/app/modules/project/service/${input.name.toLowerCase()}.service.ts`
  ),
  `${table_name_path_temp}

   export class ${input.name}Service extends BaseService {
  
  ${sql_select_query}
  ${sql_insert_query}
  ${sql_update_query}
  ${sql_delete_query}
  ${select_method}
  ${select_transaction}
  ${insert_method}
  ${insert_transaction}
  ${update_method}
  ${update_transaction}
  ${delete_method}
  ${delete_transaction}
}
`,
  (err) => {
    console.error(err);
  }
);

fs.writeFile(
  path.join(
    __dirname,
    `./src/app/modules/project/models/${input.name.toLowerCase()}.model.ts`
  ),
  `import { Base } from "./base.model"
export class ${input.name} extends Base{
  ${properties.join("\n")}
}
export class ${input.name}Wrapper extends ${input.name}{

}
`,
  (err) => {
    console.log(err);
  }
);

// import _ from "lodash";
// import { Pool, PoolClient } from "pg";
// import { using } from "../../../../global/utils";
// import { Users, UserWrapper } from "../models/users.model";
// import { BaseService } from "./base.service";

// import express from "express";
// import { ActionRes } from "../../../../global/model/actionres.model";
// import { Users, UsersWrapper } from "../models/users.model";
// import { UsersService } from "../service/users.service";
// const router = express.Router();

// {
//   name: "id",
//   type: "number",
// },
// {
//   name: "name",
//   type: "string",
// },
// {
//   name: "date_of_birth",
//   type: "date",
// },
// {
//   name: "address",
//   type: "string",
// },
// {
//   name: "phone_number",
//   type: "number",
// },
// {
//   name: "version",
//   type: "number",
// },
// {
//   name: "created_on",
//   type: "date",
// },
// {
//   name: "modified_on",
//   type: "date",
// },
// {
//   name: "is_active",
//   type: "boolean",
// }

export { properties };

export {
  sql_select_query,
  sql_insert_query,
  sql_update_query,
  sql_delete_query,
  select_method,
  select_transaction,
  insert_method,
  insert_transaction,
  update_method,
  update_transaction,
  delete_method,
  table_name_path_temp,
  delete_transaction,
};

export {
  table_name_path_controller,
  entityControllerTemplate,
  getControllerTemplate,
  insertControllerTemplate,
  updatecontrollertemplate,
  deleteControllerTemplate,
};

export { input };
