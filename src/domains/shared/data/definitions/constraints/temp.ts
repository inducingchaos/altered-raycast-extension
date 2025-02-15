// // ts-ignore

// //  DELETED COMMENTS THAT WE STILL NEED

// // Options: In the functions for configuring, etc we should transform this to ease of use when implementing
// //  These contraints (like required, since it's more primitive) are shown to the user as contraints as they exist externally but are still technically a type of constraint. >>> primitive data types are also kind of constraints, as they need validation
// //  The generated UI for the contraint once configured. Better name than info like display? Error is for if validation fails.
// //  Validate: The main function that validates the constraint. Better name for this? Also considering putting all "dynamic" info in a combined object to signify that it's not meant to be used from the definition object. We could even segregate it somehow.

// // on options name/desc: since we use a similar syntax for name/desc of options as we do for the constraint, could we consolidate this format somehow? Although we may not need the additional label/desc, although we should include the error part - I thought about using zod's custom message field, but in cases where we don't pass Zod and instead use a custom function, it's not possible to use that. So we should probably create a similar "info" object for these options.
// // on options validate: We want to make this simple for DX, but also adaptable... should we keep this as a function, or just accept a zod schema (and alternatively allow a custom function to be passed in)? Should we require parsing here or just check if it's a zod schema and do that behind the scenes? I'm thinking the latter, simpler the better. but then calling it validate wouldn't make as much sense... more like schema, but then passing a custom func wouldn't make sense. We could create a union type with both but the more union types, the more confusion...
// //  on options validate: This would make more sense to be called schema... idk what to do here
// //  on forTypes: from a macro perspective - is there a better way we could filter the constraints? I think relying on these primitive types HAS to be the way, because all almost all validation on numbers is done different than strings, dates, range types (which aren't really types themselves, more like functions), etc. I haven't even considered the collection issue for this yet, but it can probably wait. I do feel like it might fit into that "function" category.
// // ADD labels,etc back fro each option
// // Supercedes: Any better way for this as well? Ties into overall organization, grouping, etc.
// // on generate enclosure: Better name or structure for this? Should we segment (put all simple values in something like "range.definition", and these in something like "range.result" or _generated so that people don't call info from this instead of a configured constraint?)
// //  on validate: Now ideally, again we're only going to call/reference this inside the configureDataConstraint function, but it should return from there as a function like (value:)=>boolean or whatever the return type is (see below) - point here is that we might need to double-up this function so it returns a function. Not here though (Keep def DX simple) - we can do it inside the configureDataConstraint function.

// // main constraint definition type

// // required: createDataConstraint({
// //     id: "required",
// //     name: "Required",
// //     description: "Whether or not the value is required.",

// //     optionsSchema: z.null(),
// //     systemOnly: true,
// //     forTypes: ["string", "number", "boolean"],
// //     supersedes: [],

// //     info: {
// //         label: "Required",
// //         description: "The content cannot be empty."
// //     }
// // }),

// // "min-length": createDataConstraint({
// //     id: "min-length",
// //     name: "Min Length",
// //     description: "The minimum length of the value.",

// //     optionsSchema: z.object({
// //         value: z.number({ coerce: true })
// //     }),
// //     systemOnly: false,
// //     forTypes: ["string"],
// //     supersedes: [],

// //     info: {
// //         label: (options: { value: number }) => `Min Length: ${options.value}`,
// //         description: (options: { value: number }) =>
// //             `The content must be at least ${options.value} character${options.value === 1 ? "" : "s"}.`,

// //         error: {
// //             label: "Too Short"
// //         }
// //     }
// // }),

// // "min-value": createDataConstraint({
// //     id: "min-value",
// //     name: "Min Value",
// //     description: "The minimum value.",

// //     optionsSchema: z.object({
// //         value: z.number({ coerce: true })
// //     }),
// //     systemOnly: false,
// //     forTypes: ["number"],
// //     supersedes: [],

// //     info: {
// //         label: (options: { value: number }) => `Min: ${options.value}`,
// //         description: (options: { value: number }) => `The value must be greater than or equal to ${options.value}.`,

// //         error: {
// //             label: "Below Min Value"
// //         }
// //     }
// // }),
// // "max-value": createDataConstraint({
// //     id: "max-value",
// //     name: "Max Value",
// //     description: "The maximum value.",
// //     optionsSchema: z.object({
// //         value: z.number({ coerce: true })
// //     }),
// //     systemOnly: false,
// //     forTypes: ["number"],
// //     supersedes: [],

// //     info: {
// //         label: (options: { value: number }) => `Max: ${options.value}`,
// //         description: (options: { value: number }) => `The value must be less than or equal to ${options.value}.`,
// //         error: {
// //             label: "Exceeds Max Value"
// //         }
// //     }
// // }),

// /* EXAMPLE IMPLEMENTATION (DX Case 3)  */

// //  Get the constraints and display them in a list for the user to select from when configuring a schema column.

// const constraints = Object.entries(dataConstraints).map(([id, constraint]) => ({
//     id,
//     name: constraint.name,
//     description: constraint.description
// }))

// //  While on the topic - what is the best (conventional) way to store these types of code definitions, that aren't user-defined, but need to be referenced in the database? An array, object, map, or something else? I used a keyed object for type inference, but it could be done in many ways.

// //  Get the parameters and details for the selected constraint & display in UI for user to configure. - maybe we could make the options config object more implementation-friendly, like flattening it or converting to an array? We need to balance the definition/implementation DX here... maintaining structure, while making it easy to display and work with.

// const selectedConstraintId: DataConstraintID = "range"
// const selectedConstraint = dataConstraints[selectedConstraintId]
// // or similar syntax, we may make the options simpler for dynamically passing to display in the UI for configuration
// const {
//     min,
//     max,
//     step: { value, offset }
// } = selectedConstraint.options

// //  The implementation could validate the params using the `validate` function of each option, or simply pass back a whole object that could be validated under the hood. If we define a config object for system manually, it should have inference. We could also pass this object directly to the `configureDataConstraint` function.

// const rangeConfig: DataConstraintConfig<"range"> = {
//     id: "range",
//     options: {
//         min: 3,
//         max: 7,
//         step: {
//             value: 1.5,
//             offset: 1
//         }
//     }
// }

// //  Returns the dynamic validation function and the generated info.
// //  - What should we return from the constraint result, just the generated info or everything as a complete constraint object?
// const { info, validate: validateRangedNumber } = configureDataConstraint({ params: rangeConfig })

// //  We can then use the constraint to validate the data where the schema is used.

// const data = 50

// // What format should the result be in? Should it be like this as a safeParse result, or a simple boolean, a detailed object, or something else?
// const { success, error, data } = validateRangedNumber(data)

// // - DX 4: Manual definition and/or storage in either a database, or a json/ts file. It should be friendly enough to write yourself, but also dynamic and efficient.
// {
//     constraints: [
//         {
//             // ...
//         }
//     ]
// }

// // - How might we store constraint configs in the database? Create a constraints table with the id of the constraint, and then the options as stringified JSON in mySQL? Doing each option as a row might get messy. Should we use Nanoids for these to, and maybe do something like <row - constraint nid> - <option nid> - <option value>? What's best practice or common for something like this?

// // -in the future, how might we allow custom user-defined constraints? It would have to a a custom formula/function language (like excel or Notion) or just plain typescript... but that's a security risk. We would need to really sandbox and error-proof it, and that might be hard. Using pre-defined constraints is probably best for now?

// /*

// Ask Composer:

// PREFACE - these q's were written a lot earlier than the above changes, but most still apply

// Would you suggest any changes to this Data Constraint model? I'm building a database tool like that of notion, where there are primitive data types, and then optional constraints/rules you can add to the dataset schema for each column. We're defining this in code and letting users pick from the ones we define.

// My struggle is, one, organization. As the possible validation options grow, lets say we have 100, what is a good way to properly organize them and keep track of what already exists and maybe overlaps? I added a supersedes option for the user end of things, so if two rules are combined into one (like the range example) there will be a warning or error shown to use that instead. But, that doesn't solve the DX/internal issue here. I guess like anything else, split into different files/categories, and review previous ones before implementing something new...

// Issue two is the general arbitrary data hierarchy & model. I've been fighting between whether or not to include required as a constraint. Reasons for: it needs/shares almost all the properties a constraint does, by definition it is a constraint, and it is displayed as a tag in the same way as constraints. However: it is almost on the primitive type-level in the way the application operates. For example, no validation checks are done if the type is not required. Also, I'm probably going to implement "required" as ui separate to the constraints collection/input, as it is very common and primitive in nature. Either way, required will be included in the schema (either as a constraint or a required boolean) but this is more of a ux/dx/model concern than anything.

// As an extension of that concern - since we are really parsing everything initially as strings (accepting form inputs from Raycast, and otherwise) - the data types themselves are technically constraints as well? And should the range be implemented on the number type as a primitive (because it enables looping and selection functionality in the UI)? My take on that one is no, because all of our constraints are code-defined so we can create dynamic behavior based on that - but I did consider it in the start. Even the range type/constraint is a mind fuck, because technically a range *type* is an input of 1-10, etc where a number type with a range constraint is just limited, etc.

// I also don't know where in this model collections, (maybe objects? Although any kind of structured collections would likely just be references to another "row" of our database...) and options/enums would fit in here. I think an enum-style type would just be a primitive with an options constraint, and I could implement the relative functionality based on that.

// What are your thoughts on these conclusions based on knowledge of other people's implementations, and could you help me find some clarity on that what and where, etc? Please try to hit all of my points.

// */

// // This stuff was for type inference for the config object before we made it recursive and partially literal instead of an entire ZodSchema.

// // This is a test

// // type T = (typeof dataConstraints.range.testOptions)["infer"]

// //  This type will need to be adapted for the following

// // export type DataConstraintConfigOptions<
// //     ID extends DataConstraintID,
// //     CamelCaseID extends CamelCaseDataConstraintID = KebabCaseToCamelCase<ID>,
// //     Constraint extends DataConstraint = (typeof dataConstraints)[CamelCaseID],
// //     OptionsSchema = Constraint["optionsSchema"]
// // > = OptionsSchema extends ZodSchema ? z.infer<OptionsSchema> : never

// //  This defines the inferred config shape and details needed.

// // export type DataConstraintConfig<ID extends DataConstraintID = DataConstraintID> = {
// //     id: ID
// //     options: DataConstraintConfigOptions<ID>
// // }
