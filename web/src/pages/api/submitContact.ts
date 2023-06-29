import type { APIRoute } from "astro";
import { Amplify, withSSRContext } from "aws-amplify";
import { submitContact } from "../../graphql/mutations";

export const prerender = false;

Amplify.configure({
    aws_appsync_graphqlEndpoint:
        "https://5y5iospmjrfyncachnrgvt2kqq.appsync-api.us-east-1.amazonaws.com/graphql",
    aws_appsync_region: "us-east-1",
    aws_appsync_apiKey: "da2-pymoy5krk5bv3m5zigrg76q6b4",
    aws_appsync_authenticationType: "API_KEY",
});

export const post: APIRoute = async ({ request, redirect }) => {
    try {
        const SSR = withSSRContext();
        const data = await request.formData();
        const response = await SSR.API.graphql({
            query: submitContact,
            variables: {
                input: {
                    name: data.get("name"),
                    phone: data.get("phone"),
                    email: data.get("email"),
                },
            },
        });
        console.log(response);
    } catch (error) {
        console.log(JSON.stringify(error));
        return redirect("/?state=error");
    }
    return redirect("/?state=success");
};
