class JsonCustomStringifier {
	stringify(obj: any) {
		let cache: Array<any> | null = [];
		const retVal = JSON.stringify(obj, (key, value) =>
			typeof value === "object" && value !== null
				? cache!.includes(value)
					? undefined // Duplicate reference found, discard key
					: cache!.push(value) && value // Store value in our collection
				: value
		);
		cache = null;
		return retVal;
	}
}
export const json_custom_stringifier = new JsonCustomStringifier();
