import express from "express";
import _, { indexOf, join, replace, template } from "lodash";
import { sql_select_query,
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
    delete_transaction } from "./test-generator";

import { table_name_path_controller,
        entityControllerTemplate,
        getControllerTemplate,
        insertControllerTemplate,
        updatecontrollertemplate,
        deleteControllerTemplate } from "./test-generator"

import { properties, input } from "./test-generator";
import * as fs from 'fs';
import * as path from 'path';


fs.writeFile(
    path.join(__dirname, `./src/app/modules/alarm/models/${input.name.toLowerCase()}.model.ts`),
    `import { Base } from "../../global/models/base.model";
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



  fs.writeFile(
    path.join(__dirname, `./src/app/modules/alarm/service/${input.name.toLowerCase()}.service.ts`),
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

  fs.writeFile(path.join(__dirname, `\./src/app/modules/alarm/controller/${input.name.toLowerCase()}.controller.ts`), 
`${table_name_path_controller}
${entityControllerTemplate}
${getControllerTemplate}
${insertControllerTemplate}
${updatecontrollertemplate}
${deleteControllerTemplate}
`, (err) => {
        console.error(err);
        
    });