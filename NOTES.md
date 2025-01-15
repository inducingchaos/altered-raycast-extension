# Todo

Add POC for:

- Thought Delete
- Add alias, validated and priority field to thoughts schema
- Update all fields through search bar
- Add AI tag + alias generation on backend

Do research:

- Skim entire raycast docs
- Research tools for dynamically building API routes, whether tRPC is still worth it
- Best fuzzy search, check obsidian's implementation
- Workings of turbo repo
- Watch Theo's video on HTTP and compare Mintlify and Fumadocs

Consider choices (after research):

- Ripping down the dynamic data access layer in favour of more pieced-together safety flows (i think yes, considering the alternative means re-implementing drizzle as an abstraction layer)
    - two uptions: add dynamic note system to create consistency, or create wrappers similar to the "cascade delete" system for typesafe data-access with custom errors
- Refactoring the data type layer to use a config object rather than multiple exported vars
    - This is probably optimal - export object with properties from config function. Allows generics without specifying. Make permissions more clear for update/delete
    - Maybe shift to create-edit just so its secure by default?
- Consider using turbo repo for internal package and raycast extension on server
- Consider using a different fuzzy search library
- Decide on a docs solution

Cleanup:

- Set up turborepo, if decided
- Set up API route solution
- Implement data access layer solution with type system (define vision first)
- Refactor endpoints and extension code
- Replace fuzzy search if necessary, and implement DB sort/search/pagination on TX level
- Install docs solution

Next, after:

- Create headless auth signup flow for raycast extension
- Research/implement whop paywall and subscription flow (3mo? "this is serious")
