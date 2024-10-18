import { XMLParser } from "fast-xml-parser";
import * as v from "valibot";
import { XMLProjectSchema } from "./xml_elem_types.ts";
import type { Project } from "./elem_types.ts";
import { convertToProject } from "./converter.ts";

/**
 * An custom error class for handling parsing errors of a .gan XML file.
 *
 * @template TSchema - The Valibot schema type used for validation
 * @extends {Error}
 */
export class ParseError<
  TSchema extends
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
> extends Error {
  /**
   * Array of validation issues encountered during parsing.
   */
  readonly issues: [v.InferIssue<TSchema>, ...v.InferIssue<TSchema>[]];

  /**
   * Creates a new ParseError instance.
   *
   * @param message - The error message describing what went wrong
   * @param issues - Non-empty array of validation issues encountered
   */
  constructor(
    message: string,
    issues: [v.InferIssue<TSchema>, ...v.InferIssue<TSchema>[]],
  ) {
    super(message);
    this.name = "ParseError";
    this.issues = issues;
  }
}

/**
 * Parses a GanttProject XML file string into a Project object.
 *
 * @param xmlString - The contents of a .gan file as a string
 * @returns A validated Project object representing the parsed XML
 * @throws {ParseError} If the XML is invalid
 *
 * @example
 * ```typescript
 * try {
 *   const xmlContent = await Deno.readTextFile('project.gan');
 *   const project = parseGanttProjectXML(xmlContent);
 *   console.log(`Parsed project with ${project.tasks.length} tasks`);
 * } catch (error) {
 *   if (error instanceof ParseError) {
 *     console.error('Issues with the .gan file:', error.issues);
 *   }
 *   throw error;
 * }
 * ```
 */
export function parseGanttProjectXML(xmlString: string): Project {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
  });
  const parsedXML = parser.parse(xmlString);
  const result = v.safeParse(XMLProjectSchema, parsedXML.project);
  if (!result.success) {
    throw new ParseError(".gan file could not be parsed", result.issues);
  }
  return convertToProject(result.output);
}
