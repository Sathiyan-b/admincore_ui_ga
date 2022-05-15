import * as _ from "lodash";

class Parameter {
	parameter_name: string = "";
	value?: any;
	operator: string = "";
}

class QueryBuilder {
	query: string = "";
	parameters: Array<Parameter> = [];
	sort_field: string = "";
	sort_type: string = "";
	static readonly sort_types = {
		asc: " asc ",
		desc: " desc ",
	};
	limit: number = 0;
	constructor(the_query: string) {
		this.query = the_query;
	}
	addParameter(parameter_name: string, value: any, operator: string) {
		var parameter: Parameter = new Parameter();
		parameter.parameter_name = parameter_name;
		parameter.value = value;
		parameter.operator = operator;
		this.parameters.push(parameter);
	}
	appendParameters() {
		if (this.parameters.length > 0) {
			_.forEach(this.parameters, (v) => {
				if (this.query.toLowerCase().indexOf("where") == -1) {
					this.query += " where ";
				} else {
					this.query += " and ";
				}
				if (typeof v.value == "string")
					this.query += `${v.parameter_name} ${v.operator} '${v.value}'`;
				else
					this.query += `${v.parameter_name} ${v.operator} ${v.value}`;
			});
		}
	}
	getQuery(): string {
		this.appendParameters();
		if (this.sort_field.length > 0) {
			this.query += " order by " + this.sort_field;
			if (this.sort_type.length > 0) this.query += this.sort_type;
		}
		if (this.limit > 0) {
			this.query += " limit " + this.limit;
		}

		return this.query;
	}
}
export { QueryBuilder };
