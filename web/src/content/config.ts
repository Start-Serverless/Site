import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
    schema: ({ image }) =>
        z.object({
            draft: z.boolean(),
            title: z.string(),
            tags: z.array(z.string()),
            image: image(),
            authors: z.array(z.string()),
            publishDate: z.date(),
            description: z.string(),
        }),
});

export const collections = {
    blog: blogCollection,
};
