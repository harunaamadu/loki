// @ts-check
import { module } from "@prisma/composer";
import lokiService from "./service.mjs";

export default module("loki", ({ provision }) => {
  provision(lokiService);
});
