import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { phone, email, name } = ctx.args;
	return {
		operation: "PutItem",
		key: util.dynamodb.toMapValues({
			pk: "CONTACT",
			sk: `CONTACT#${email}`,
		}),
		attributeValues: util.dynamodb.toMapValues(phone, email, name),
	};
}

export function reqsponse(ctx) {
	return {
		phone: ctx.args.phone,
		email: ctx.args.email,
		name: ctx.args.name
	}
}