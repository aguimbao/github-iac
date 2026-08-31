import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
export const owner = config.get("owner") ?? "aguimbao";
