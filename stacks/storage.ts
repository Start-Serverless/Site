import { StackContext, Table } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
    const table = new Table(stack, "StartServerless", {
        fields: {
            pk: "string",
            sk: "string",
        },
        primaryIndex: { partitionKey: "pk", sortKey: "sk" },
        stream: "new_image",
    });
    return table;
}
