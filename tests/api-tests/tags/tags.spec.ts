import { test } from "@fixtures";
import { expect } from "@utils/custom-expect";

test.describe(
	"Feature: Tags API",
	{
		annotation: {
			type: "api-tags",
			description: "Tests for the Tags API endpoints",
		},
		tag: ["@tags"],
	},
	() => {
		test("GET tags", async ({
			api,
			endpoints,
			httpStatus: { Status200_Ok },
		}) => {
			const tagsResponse = await api
				.path(endpoints.tags)
				.getRequest(Status200_Ok);
			await expect(tagsResponse).shouldMatchSchema("tags", "GET_tags", true);
			expect(tagsResponse).toHaveProperty("tags");
			expect(tagsResponse.tags[0]).shouldBeEqual("Test");
			expect(tagsResponse.tags.length).shouldBeLessThanOrEqual(10);
		});
	},
);
