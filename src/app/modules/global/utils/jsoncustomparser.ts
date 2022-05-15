class JsonCustomParser {
	parse<T>(str: string, default_value: T) {
		var result: T = default_value;
		try {
			result = JSON.parse(str);
		} catch (e) {
			result = default_value;
		}
		return result;
	}
}
export const json_custom_parser = new JsonCustomParser();
