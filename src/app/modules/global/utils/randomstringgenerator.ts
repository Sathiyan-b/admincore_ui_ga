class RandomStringGenerator {
	constructor() {}
	generate(length: number, characters: String) {
		var random_string = "";
		for (var i = length; i > 0; i--) {
			random_string +=
				characters[Math.floor(Math.random() * characters.length)];
		}
		return random_string;
	}
}
const random_string_generator = new RandomStringGenerator();
export { random_string_generator };
