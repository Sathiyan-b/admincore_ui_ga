import ldap, {
	SearchEntry,
	SearchOptions,
	Client,
	SearchReference,
	LDAPResult,
	SearchCallbackResponse,
	SearchEntryObject,
	Error,
} from "ldapjs";
import * as _ from "lodash";
import { IDisposable, logger } from ".";

class Ldap implements IDisposable {
	config: Ldap.LdapConfig;
	client: Client;
	constructor(
		_config: Ldap.LdapConfig = {
			base_dn: _.get(process, "env.LDAP_BASE_DN", ""),
			url: _.get(process, "env.LDAP_URL", ""),
			user_name: _.get(process, "env.LDAP_USER_NAME", ""),
			password: _.get(process, "env.LDAP_PASSWORD"),
		}
	) {
		try {
			this.config = _config;
			this.client = ldap.createClient({
				url: this.config.url,
			});
		} catch (error) {
			throw error;
		}
	}
	async init() {
		var { user_name, password } = this.config;
		try {
			await this.bind({ user_name, password, client: this.client });
		} catch (error) {
			throw error;
		}
	}
	async bind({
		user_name,
		password,
		client,
	}: {
		user_name: string;
		password: string;
		client: Client;
	}) {
		try {
			await new Promise((resolve, reject) => {
				(client as Client).bind(user_name, password, (err: any) => {
					if (err) {
						reject(err);
					}
					resolve(true);
				});
				var error_listener = (error: any) => {
					(this.client as Client).off("error", error_listener);
					reject(error);
				};
				(this.client as Client).on("error", error_listener);
			});
		} catch (error) {
			throw error;
		}
	}
	async getEntries({
		dn = this.config.base_dn,
		filter = Ldap.Filters.ORGANIZATIONAL_UNIT,
	}: {
		dn?: string;
		filter?: Ldap.Filters | string;
	}) {
		var client: Client = this.client as Client;
		var result: Array<SearchEntryObject> = [];
		try {
			var opts: SearchOptions = {
				filter,
				scope: "sub",
				// attributes: ["dn", "sn", "cn"],
			};

			await new Promise((resolve, reject) => {
				client.search(dn, opts, function (
					err: any,
					res: SearchCallbackResponse
				) {
					if (err) {
						console.log("err", err);
						reject(err);
					}
					res.on("searchEntry", function (entry: SearchEntry) {
						result.push(entry.object);
					});
					res.on("searchReference", function (
						referral: SearchReference
					) {
						console.log("referral: " + referral.uris.join());
					});
					res.on("error", function (err: Error) {
						reject(err);
					});
					res.on("end", function (result: LDAPResult) {
						console.log("status: " + result.status);
						resolve(true);
					});
				});
			});
		} catch (error) {
			throw error;
		}
		return result;
	}
	async getUsersOfGroup({ dn }: { dn: string }) {
		var result: Array<SearchEntryObject> = [];
		try {
			result = await this.getEntries({
				filter: `&(objectclass=user)(memberOf=${dn})`,
			});
		} catch (error) {
			throw error;
		}
		return result;
	}
	async getGroupMembershipForUser({ dn }: { dn: string }) {
		var result: Array<SearchEntryObject> = [];
		try {
			result = await this.getEntries({
				filter: `&(objectclass=group)(member=${dn})(!(isCriticalSystemObject=TRUE))`,
			});
		} catch (error) {
			throw error;
		}
		return result;
	}
	async authenticateUser({
		user_name = "",
		password = "",
	}: {
		user_name: string;
		password: string;
	}) {
		var result: Array<SearchEntryObject> = [];
		try {
			var client = ldap.createClient({
				url: this.config.url,
			});
			await this.bind({ user_name, password, client });
			result = await this.getEntries({
				filter: `&(objectclass=user)(userprincipalname=${user_name})`,
			});
		} catch (error) {
			throw error;
		}
		return result;
	}
	async getTreeNode() {
		var node: Ldap.Node = {
			name: this.config.base_dn,
			children: [],
			details: null,
		} as Ldap.Node;
		try {
			/* groups */
			var group_list = await this.getEntries({
				filter: Ldap.Filters.GROUP,
			});
			var group_list_node: Ldap.Node = {
				name: "groups",
				details: null,
				children: [],
			} as Ldap.Node;

			_.forEach(group_list, (group_item) => {
				var group: Ldap.Node = {
					name: group_item.cn,
					details: group_item,
					children: null,
				} as Ldap.Node;
				(group_list_node.children as Array<Ldap.Node>).push(group);
			});
			node.children?.push(group_list_node);
			/* users */
			var user_list = await this.getEntries({
				filter: Ldap.Filters.USER,
			});
			var user_list_node: Ldap.Node = {
				name: "users",
				details: null,
				children: [],
			} as Ldap.Node;

			_.forEach(user_list, (user_item) => {
				var user: Ldap.Node = {
					name: user_item.cn,
					details: user_item,
					children: null,
				} as Ldap.Node;
				(user_list_node.children as Array<Ldap.Node>).push(user);
			});
			node.children?.push(user_list_node);
			/* ou */
			var ou_list: Array<any> = await this.getEntries({
				filter: Ldap.Filters.ORGANIZATIONAL_UNIT,
			});
			var ou_list_node: Ldap.Node = {
				name: "OUs",
				details: null,
				children: [],
			} as Ldap.Node;
			for (var i = 0, length = ou_list.length; i < length; i++) {
				var groups = await this.getEntries({
					dn: ou_list[i].dn,
					filter: Ldap.Filters.GROUP,
				});
				ou_list[i].groups = groups;
				var users = await this.getEntries({
					dn: ou_list[i].dn,
					filter: Ldap.Filters.USER,
				});
				ou_list[i].users = users;
			}
			_.forEach(ou_list, (ou_item) => {
				var ou: Ldap.Node = {
					name: ou_item.ou + " (OU)",
					details: ou_item,
					children: [],
				} as Ldap.Node;

				/* groups */
				var group_list: Ldap.Node = {
					name: "groups",
					details: null,
					children: [],
				} as Ldap.Node;

				_.forEach(ou_item.groups, (group_item) => {
					var group: Ldap.Node = {
						name: group_item.cn,
						details: group_item,
						children: null,
					} as Ldap.Node;
					(group_list.children as Array<Ldap.Node>).push(group);
				});

				/* users */
				var user_list: Ldap.Node = {
					name: "users",
					details: null,
					children: [],
				} as Ldap.Node;

				_.forEach(ou_item.users, (user_item) => {
					var user: Ldap.Node = {
						name: user_item.cn,
						details: user_item,
						children: null,
					} as Ldap.Node;
					(user_list.children as Array<Ldap.Node>).push(user);
				});

				(ou.children as Array<Ldap.Node>).push(group_list);
				(ou.children as Array<Ldap.Node>).push(user_list);

				(ou_list_node.children as Array<Ldap.Node>).push(ou);
			});
			node.children?.push(ou_list_node);
		} catch (error) {
			throw error;
		}
		return node;
	}
	async dispose() {
		try {
			await new Promise((resolve, reject) => {
				this.client.unbind(function (err) {
					if (err) {
						reject(err);
					}
					resolve(true);
				});
			});

			(this.client as Client).destroy(
				function (err: any) {
					if (err) {
						logger.getLogger("[LDAP]" + JSON.stringify(err))
					}
				}
			)
		} catch (error) {
			throw error;
		}
	}
}

module Ldap {
	export enum Filters {
		USER = "&(objectclass=user)(!(isCriticalSystemObject=TRUE))",
		GROUP = "&(objectclass=group)(!(isCriticalSystemObject=TRUE))",
		ORGANIZATIONAL_UNIT = "&(objectclass=organizationalUnit)(!(isCriticalSystemObject=TRUE))",
		USER_WITH_CRITICAL = "(objectclass=user)",
		GROUP_WITH_CRITICAL = "(objectclass=group)",
		ORGANIZATIONAL_UNIT_WITH_CRITICAL = "(objectclass=organizationalUnit)",
	}
	export class LdapConfig {
		url: string = "";
		user_name: string = "";
		password: string = "";
		base_dn: string = "";
	}
	export class Node {
		name: string = "";
		details: any = {};
		children: Array<any> | null = [];
	}
}
export { Ldap };