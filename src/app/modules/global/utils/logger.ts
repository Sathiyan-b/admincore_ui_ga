import log4js from "log4js";

log4js.configure({
	appenders: {
		out: { type: "stdout" },
		file: {
			type: "file",
			filename: "logs/global.log",
			maxLogSize: 10000000,
			layout: {
				type: "basic",
			},
		},
		auth_log: {
			type: "file",
			filename: "logs/auth.log",
			maxLogSize: 10000000,
			layout: {
				type: "basic",
			},
		},
		ALARM_log: {
			type: "file",
			filename: "logs/alarm.log",
			maxLogSize: 10000000,
			layout: {
				type: "basic",
			},
		},
	},
	categories: {
		default: { appenders: ["file", "out"], level: "debug" },
		"[AUTH]": {
			appenders: ["auth_log", "out"],
			level: "debug",
		},
		"[ALARM]": {
			appenders: ["ALARM_log", "out"],
			level: "debug",
		},
	},
});
export { log4js as logger };
