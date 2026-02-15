import { describe, expect, it } from "vitest";
import {
	createEmptyResponse,
	createJsonResponse,
	createTextResponse,
} from "./response-formatter";

describe("Response Formatter", () => {
	describe("createJsonResponse", () => {
		it("should format JSON data with default pretty printing", () => {
			const testData = { name: "Test", value: 123, nested: { key: "value" } };
			const response = createJsonResponse(testData);

			// No nulls in testData, so output matches standard stringify
			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: JSON.stringify(testData, null, 2),
					},
				],
			});
		});

		it("should format JSON data without pretty printing when specified", () => {
			const testData = { name: "Test", value: 123 };
			const response = createJsonResponse(testData, { pretty: false });

			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: JSON.stringify(testData),
					},
				],
			});
		});

		it("should use custom indentation when specified", () => {
			const testData = { name: "Test", value: 123 };
			const response = createJsonResponse(testData, {
				pretty: true,
				indent: 4,
			});

			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: JSON.stringify(testData, null, 4),
					},
				],
			});
		});

		it("should handle arrays correctly", () => {
			const testArray = [1, 2, 3, { name: "Test" }];
			const response = createJsonResponse(testArray);

			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: JSON.stringify(testArray, null, 2),
					},
				],
			});
		});

		it("should strip null and undefined values from output", () => {
			const testData = {
				name: "Test",
				nullField: null,
				undefinedField: undefined,
				nested: { value: 1, empty: null },
			};
			const response = createJsonResponse(testData);
			const parsed = JSON.parse(response.content[0].text);

			expect(parsed).toEqual({
				name: "Test",
				nested: { value: 1 },
			});
			expect("nullField" in parsed).toBe(false);
			expect("empty" in parsed.nested).toBe(false);
		});

		it("should handle top-level null and undefined values", () => {
			// Top-level null becomes undefined via replacer, then stringify returns undefined
			expect(createJsonResponse(null).content[0].text).toBe(undefined);
			expect(createJsonResponse(undefined).content[0].text).toBe(undefined);
		});
	});

	describe("createTextResponse", () => {
		it("should create a text response with the provided message", () => {
			const message = "This is a test message";
			const response = createTextResponse(message);

			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: message,
					},
				],
			});
		});

		it("should handle empty strings", () => {
			const response = createTextResponse("");

			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: "",
					},
				],
			});
		});
	});

	describe("createEmptyResponse", () => {
		it("should create an empty response with default message", () => {
			const response = createEmptyResponse();

			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: "No data found",
					},
				],
			});
		});

		it("should create an empty response with custom message", () => {
			const customMessage = "Custom empty message";
			const response = createEmptyResponse(customMessage);

			expect(response).toEqual({
				content: [
					{
						type: "text",
						text: customMessage,
					},
				],
			});
		});
	});
});
