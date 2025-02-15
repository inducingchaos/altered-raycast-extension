# Todo

Add POC for:

- Thought Delete
- Add alias, validated and priority field to thoughts schema
- Update all fields through search bar
- Add AI tag + alias generation on backend

Do research:

- Skim entire raycast docs
- Best fetch alt if raycast can't do it
- Research tools for dynamically building API routes, whether tRPC is still worth it
- Best fuzzy search, check obsidian's implementation
- Workings of turbo repo
- Watch Theo's video on HTTP and compare Mintlify and Fumadocs
- Start with local-first approach that syncs to db for absolute speed

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
- Mayve incorporate update-env script and stabilize script into pre-commit hook (and make sure to git-add when NOT on github to include formatting changes in commit so they don't get left out and to just not format at all in GH workflow because that should be done by the user, double check CI for other optimizations)
- Set up API route solution
- Implement data access layer solution with type system (define vision first)
- Refactor endpoints and extension code
- Replace fuzzy search if necessary, and implement DB sort/search/pagination on TX level
- Install docs solution

Next, after:

- Create headless auth signup flow for raycast extension
- Research/implement whop paywall and subscription flow (3mo? "this is serious")
- Add localstorage data cache for thoughts with hash-based revalidation OR event id validation where I log events like CRUD on databases (we need to implement inegrity for this in data access layer) which would save us the compute of hashing and comparing on every run, we just compare the most recent CRUD ID - also implement Raycast LRU caching for promises (or just getting localstorage) for quicker loads instead of from disk (also for fetching make sure to use a SWR-like strategy to avoid waiting)
- Add a dedicated preferences command so that going to Raycast settings isnt needed for quick changes. Prefs should include thinkgs like whether to use a Form or list for capturing thoughts (different input UIs will be available) as well as defaults for submission (like whether to validate or not, to auto-generate tags/titles or not, to auto-AI-format sentences or not, there will also be modifiers for different Ingest/submit configurations so all of these settings, imagine them in a list, with 3 checkboxes for each, and each checkbox corresponds to a modifier like shift, option, cmd, and of course just plain enter - this would allow different configs for submissions with one extra keypress). One other idea for prefs and/or a input ui is to instead of just submitting the thought cotent (sentence), the input could clear and accept an alias (the title), same for tags, etc. This could also maybe be configured? Maybe instead (when creating a new thought) we push to a new list/form view, and provide suggestions for the alias/tags in real time based on the previous thought values such as content, displayed in a list below the input. We coudl use some clarity/exploration on this as the possibilities are many. We want to be opinionated to the best option but also some config options.
- Consider a separate "Validation" command for making mass operations to validate/invalidate data via rulesets or AI interpretation
- Consider a separate "Indexing" command for auto-indexing certain datasets by adding/deleting tags in a specified scope using all of the additional context, this is good beacuse new thoughts will give us a a better understanding of how to index the data
- Datasets cmd of course that would sort of provide in interface to create JSON schemas with types for the certain datasets
- (way in the future - all of these features are great but should come after we are able to simply upload our thoughts into the brain then start adding features once we can use THESE thoguhts to kind of build itself - otherwise we might back-step and poorly implement things that we thought out in the past) -> We should obviously integrate the use of files, but also once we have a brain, and successfully put that all in system instructions or trained/fine-tuned the model on it, we can not only use this to generate new thoughts from either ALL or a specific dataset, or a mix of both where it knows everything but has a focus on a specific dataset. We could test and see which works best. Exclusion is the best idea to prevent data leaks. We should have cmd/controls for training the brain, which needs to be done with consideration. How do we balance between training, prompt-injection, and RAG? The point I was getting to was to not only hereate thoughts, but also generate long-form thoughts as notes. For example, uploading all ideas for an app then having it generate an initial 1-month todo plan with everything about the app. Since our brain will be binded to its corresponding thought database, we could optionally create completion datasets to mark tasks in this context, as accounted for. Then when doing the same in another month, there would be no overlap. Aside from a dataset - which are ultimately creating "order" (in a database-stype layout) from the entropy of our brain we insert, which is great for visualization and creating clarity e.g. sharing a lost of programs you installed on your mac, vs writing a paragraph about all of them -- above these datasets, the closest thing to the human brain would just be re-inserting the thoughts about completion back into the brain. e.g., we included X in the first-month todo lsit for the app. Simultaneously, these could be included in that completion dataset we talked about. Lot's going on here which is why this is so amazing.
- Implement the quick-capture that hides on submission

- add more features that lean towards integration for productivity - instead of taking the path of integrating with other apps, we should take the path of integrating with the user's brain. for example, since we're taking a raycast-native approach for rapid backend development, we could leverage macos for things like sending notifactions/remindsers, giving the brain the ability to schedule crons, etc. That's actually probably the center of it because it's basically just finding the most efficient form of communication to the user. Via text to start, maybe talk later. Voice input using whisper for sure for efficiency - not sure how these would be validated though. personally, I think for the avg person auto-validation for both voice notes and messy inputs should be the main way of thiniing - since that's the rawest form of entropy. But this life is also about refining your entropy, doubling back on thoughts - creating order. which is why I would probably double-check all tpyed messagead AND voice notes, converting them to text. Just like how a woodworker would finish their project with fine-grit sandpaper - the best things in life (best outputs from my Altered brain) would come as a result of this refinement.

- prefs vs prompts - we need to add prefs (kind of like flags for app features and usability) for sure, but there's also a different klind of prefs that we might want to create a separate database table for prompts.(or maybe like thoughts - these exist as a non-editable dataset of prompt files?? but that wouldn't as fast as a db to load - prompts are core app experience, so they should probably be allowed their own static table). now we could make the prefs table accept long-form text for prompts like the formatting instructions, ALTERED core instructions, ingest instructions, revalidation instructions, etc. but that's probably not optimal. drastically diffferent data types deserve different tables.

- db relation to trained data - this is a whole other domain of developemnt. We need to figure out how to reliably gibe the LLM context (thoughtID in database, ways to cross-reference based on tags, follow backlinked thoughts via the attachmentID, etc) so that it can provide sources when necessary or requested. one example is creating dynamic datasets. For example - find all the thoughts related to my app idea "BLANK". It might have that thought in it's "memory" and be able to correctly remember the associated ID (just as a side effect of the basic stategy - prompt/RAG/train), it might want to to a full-text search of all the thought content, it might want to search for all relevant tags and do a wuery to get all those thoughts and consider each, or find the most relevant thoughts and search forwards and backwards based on the date, or maybe even detect date-related content and create a query for that, or do something similar for other types of content - like maybe in a thought I talk about "BLANK" app and say how its in a monorepo sharing code with app 2 - then we might want to go one layer deeper (these layers need to be self-regulated and determined with AI when it's not worth going deeper) and seach for all content about app 2 to see if there's any other rabbit holes that may point to whatever our mission was (maybe it was finding app ideas for "BLANK", so if the chances of finding app ideas in that rabbit hole is unlikely then it will stop)... this will take mroe thought, but i think it comes down to 2 things: how the data is inserted/strutured (maybe in RAG we either embed details in the sentence like the date using english for better reference, or the opposite where it has it's seoarate field or placed at end of line) and the tools we give the llm for querying. And maybe a third factor - the llm's brain itself. We SHOULD develop a brain for the LLM, not only to use as a base for people trying to use ALTERED but for the Altered core system itself. let me elaborate. It's good as a base layer on top of main models because automatically our app knows about our app and can provide insight related to it, this adds to AI's goal of "knowing everything", but also for the apps core self-usage - because apps like these self-digital-brains have really never been seen before, the LLM's use of the app and philosphy is only as good as the entropy (human-discovered patterns and insights) that we add to the knowledge base and/or training. So being how this is factor #3 in the categories for how we could cross-references DB<>LLM (myself, or altered should remember that little typing acronym for marketing of iiinput, the OS of altered) - for example, the strategy examples I mentioned earlier about querying and going down rabbit-holes are only useful if humans like me, the developer, think of them and record them. Yes, maybe there's LLM data-referencing strategies here adn there by college students/researchers, etc that might come in handy - but some of mine are probably unique, and of course, app specific. Bottom line with this point is that having an Altered brain that RUNS the app for other brains (with knowledge about queries, cross referencing,etc) I think is acutally essential for avoiding hard-programming algorithms, limits, and column-specific prompts in. We may eventually end up giving the internal (trained by us) AI full control to use SQL queries on our database (that obviously are filtered programatically for security reasons, to only allow querying on the active user, etc etc) for the ultimate infinitely-growing performance.

- eventually implement supervised/unsupervised feedback loop for improving autonomously
- This is so huge because if we get market leverage we will have access to everyone's thoughts, not in a malicious way but just in a wow, holy shit way

- For datasets with checklists - we could maybe provide an alternate raycast view to check off items - this could maybe be controlled by using the searc accessory dropdown to select a column to interact with. bound to keyboatd actions as well.
- We should announce iiinput api in the future to track interest and potentially discourage competitors from building something similar

- Instead of going straight for customers, maybe we focus on the big teck game of findinf investors and building behind the scenes. Altohugh I don't really want to give up equity on this, as losing board control fo this idea could be the loss of a lifetime.
- heavy on the integration with humans over apps thing, remember that for marketing. not like the "AI shirt pin" thing (but maybe for non-tech people?) but in prefering minimalism over extra-integrationism.

- minimalism is a core part of this philosophy. input, putput of brain power/entropy, offloading the creation of order to systems, reducing UI, and finding the most efficient methods to interface humans <> ALTERED.

- the best place (for me) to recieve information like reminders is through messages on my phone. and since raycast will initally be only as raycast on mac - maybe we could use raycast applescript to send imessage to myself, which would be a no-ocst way to integrate with imessage app. only downside is the mac would have to be running thougj. SMS would be ideal, but it's expensive as hell. Maybe we could make a native app that's almost as linear, but then we have to get people to open it. People already naturally open messages. This could be mostly solved with a native app (or maybe raycast mobile, soon) but that's a big thing to develop. Maybe we could use some hacks with PWAs or the shortuts app for now to send push notifs from our server (which will be one of the most effective ways for altered to communicate - by getting a user's attention at certain times, redirecting their attention, and providing brief info without having to open their app, or even worse, their mac.)

- sharing scoped brain segments (AI chat style) and datasets (raw information) actually these are probably combined - for example, if you want to be a personal trainer, or share your app ideas with a coworker, we should have a way to import/share a segment of your brain with someone else. There should be controls for managing/revoking this.

- AI authoring - we want to record what thoughts were solely created by you, or AI, or both - and if both, provide a score on how much of the thought was created by you. This should be a separate db table, probably internal not available as a dataset (whereas prompts might be - but instead of opening as a file, we could edit inline - RECONSIDER this I think we should just make promt management internal.) maybe we find a happy-medium, where it "displays" as a dataset but has a SYSTEM flag to indicate it's separate. this distinction would semantically allow us to upen non-standard data in arbitrary editors (like a prompt in a form, where it would normally be a file that opens externally)

- Which system tables should be visible to the user as non-changable datasets? (e.g. prompts, thoughts, workflows when we get to it, etc) I think everything that is editable as a basic primitive and is meant to be changed directly by the user could be shown as a dataset. For example - internal event logs, authoring entries, etc should be hidden as they are purely for internal function and/or metadata, not meant to be changed by the user.

- Could we integrate notes into the UI? I originally wanted to open files externally, but considering the integration of backlinks, etc NOTES specifically may be able to be integrated.

- We should have a way to create notes from thoughts, and vice-versa. Or better yet, on strict-mode (which may exist, as a set of locked presets like requiring validation) note content cannot exist without a thought. We could allow rewrites (example, sentence to short-list-point) which would create a new thought that has a backlink to the original thought.

- How do we handle duplicate thoughts? Humans do have repeated thoughts - but in order to maintain order and avoid doubl-tasks in datasets, etc we should have a way to group them. This kind of grouping should be different than a backlink, and different than an attachment. Maybe we need a different table called "Connections" or something that ultimately link these different things with a type. And these are very distinct types - backlinks are for a one-way connection typically, these "duplicate groups" are for more of a symbiotic relationship, and of course file attachments are links to external things. These could just be extra columns on the thoughts table, but I feel like they might deserve their own table for efficeny and expandability... They would all function differently within the app. For example, thoughts with a duplicate group (whatever we name it, REWRITES maybe) would be grouped in datasets as one thing. This gets very nuanced though, because maybe a different thought could have additional information... this is whree the drafts area and validation comes in. AI would probably identify this as a unclear-thought and ask you to separate it or something. This is like the brain's way of finding clarity. And it kind emphasized the purpose of a "thought-based" structure - we need the thoughts to be as small as possible for optimal function. Now that introduces another type of relationship - direct relations, like how a first name is associated with a last name. We should think about this ahead of time so the brain can start to create connections... I feel like I may be reinventing an LLM at this point but at the same time, or database-bound LLM would be groundbreaking. Here's a function related to this we need to program in, which would help invalidate thoughts and create drafts: Duplicate/overlapping thought detection. in the case of maybe a thought about a first name (as a simple example), and one about a first & last name - if this was alternatively a todo or something else that overlapped, you can see where the problem comes in with the usability in datasets. To achieve clarity, we would need to either separate the first/last thought and specify a relationship between the first thought, the last thought (a sibling connection), and possibly the other stray first thought (which would be a rewrite of the other one - or in this case, being so simple, it could just be deleted). The other option is to just keep the combined first/last thought if we didn't need it broken down further and avoid the deeper relations altogother. This whole thing is another challenging problem we need to approach (and as with others, consider if it's even worth approaching). There will be cases where using the first/last example, we WILL need both the first and first/last thoughts independently - perhaps we need the firstname thought somewhere but also want to use the first/last as a whole... idk, this creates a dilemma to go against a deterministic structure... almost like the fn/ln combo is a combination of thoughts that isn't big enough to deserve it's own note. Or maybe it does? OR this could simply be a backlink relationship... and in datasets where you might want either piece of content, typically you would only want one scope (single/double). Except these backlink relations wouldn't be direct insertions of the child thought as an actual "backlink" would be in a note - it's more of just a scoped relaationship. We should probably name this relationship something else then. A backling more accurately is just the insertion into a note. That all said though... if we can combine thoughts into bigger ones within the confines of the rules we just set, how big could these get? Where's the distinction from notes? If they're really big, what dictates the need for a "backlink"-type relationship, adn where in the bigger one does it point to? Maybe each relationship could have a nautral-language description, the exists outside the person's "brain". This is what the avg human could read and determine the meaning of the link. But it should be tailored, therefore this "connection" is actually a context-aware thought that belongs to the person? Would implementing this be overkill and introduce bloat? Are the links enough, just basically for creating order within datasets and avoiding duplicates? Or should these be more descriptive so LLMS can make connections? Although I think the answer here... is that the simple description of the connection itself (like backlink/rewrite, whatever name) should be obvious enough. If it's not, then maybe it needs a refactor or shouldn'r be connected. This is where JUDGEMENT comes in, both of us sorting drafts and also the LLM's self-judgement as it learns.

- The re-indexing and training of the brain could almost be synonmomized with meditation lol

- We should have a way to split large text content into shorter, suggested chunks for inserting and validating for ingest. This could be done manually but the UX is better if we drop in something large, then have it show up as a single draft item (a single thought ref to the imported text file), then either a chunking/running function/interface for reducing it. Maybe it's a specific number of chars (adjsuted intelligently to the nearest paragraph/sentence/etc) in which you could select from (like drag a range), then that would be excluded and you could save it, rewrite, or divide it as well. the chunk would be subtracted from the original thought.

- thoughts are weighted based on their priority, but also based on their age/date

- Comprehensive logging should include things like total api requests to Whop in addition to every other "operation/action" that happens. We can use these in the future for metrics and metering and analytics.

- We need to think about on the internal side of things, how I can refernce large chunks of code when adding thoughts to my brain to share with other developers. This shoulf be easy when I take the time to think about it.

- Should we have to separate brains for really big responsibilities within Altered? One for running the internal systems (as deterministic as possible, we would only load this brian with for-sure thoughts, for both telling users about implemented features, etc but also sharing clarity for developers), and another brain for less certain, experimental, strategic thought amoung the team? Thinking now - a human does both by creating order (datasets, connections, etc), so one brain should be able to as well. We just need to keep order, test this, we can always migrate later.

- And although we should definitely adapt the db tables and infra to allow multiple brains under one account - for cases like accessing a cpompay brain? Or sohuld we? Becuase maybe we don't even need to create a standalone brain for altered, we could just create a shared dataset that you could contribute to and others could to. This goes back to the idea of sharing part of your brain, one dataset - exept now there's two types - a one to many where peopel can just inherit your knowledge in you brain (with controls for you to revoke/manage, adn controls for them to restrict kind like delete but just for them, or diable altogether), and a many to one where other people can contribute to this dataset too. And since datasets can serve as independant knowledge bases, it could run the app, and we could nterface with it as something standalone fi we wanted to by generating purely from the dataset, or as our whole brain. We need to consider how to structure permissions, segmentation fo this group dataset idea,etc. Best to implement/test and adjust.

- sections of brain to hide/ignore by default - exclude sensitive passwords, photos, memories. The content of these should be invisible, but still accessible by reference. By the description, title, etc. And thought content is sensitive, it should have a rewrite-style other thought that references it/describes in in a non-sensitive way. And if a LLM knowledge query wants to access something like a password, we could show an alert prompt in raycast to ask the user if they want to access it. This could be on the thought level, the dataset level, etc. Not sure how these would be implemented in a way that is clean and parallel... maybe some sort of additional config row/thought/internal table that says what's sensitive. The AI needs instructions for this too - for example to try and reference the most specific sensitive thought first before asking to reveal the whole dataset, in example passwords. this security could be on a code level, not just a prompt level. We DO need to make sure that for each sensitive thought entry - there is a (set rule) of visible metadata that can be used to access the sensitive thing.

- When adding a dataset like website inspiration to offload my pinned tabs in Arc, paste from clipboard will be nice. The best way to develop essential features is to just use it. Like all of those will be validated as I put them in until I want to add another col, like a multi-select (which may be implemented as a tag, maybe thoughts themselves, or a separate table). Having that dropdown in the search bar would be super nice here as selecting the column to edit would allow is to switch to checklist mode, etc.

- Datasets is a system dataset, along with thoughts.
- As things like datasets and notes grow, remember - structure becomes unneccesary order. Having 3 different datasets with the same name like "car collections" might feel like we need to nest them somehow. I think this should be made aware when we're naming if there's duplicates - then we could easily switch to an editing view to rename each of them, or better yet (because all of our datasets runn off of schemas, which is another system dataset) we could just invalidate those schemas if we want. Or, we could just have multiple with the same names. This is a good example of the index-based approach with fuzzy llm search - ITS okay to have 3 datasets with the same name if you want, because each dataset itself should have tags and a content description. This way, just search adn the most relevant one should appear at the top. That's why the Aliases sohuld almost come secon becuase they summarize what the dataset actually is.

- add docs about... Terminology (essential terms), Philosophies (why duplicates/indexing over structure, why small thoughts, how the internals work without giving away trade secrets), How to use the app based on what you want to do (capture new info, access an ordered dataset, refine drafts (ingest), adjust structure (schemas), generate new thoughts, do complex queries without creating a dataset, adjust foundational promts, adjust ui settings, manage permissions and security, basic personal info config, etc) - they should know what is, why it works how it does, how to use it, when, and where etc.

- Should cols on datasets (for anything, you can create these kind of like notion but in a more srtict, atomic, minimal way) be implemented as a standalone db table? My original idea was to implement them as tags e.g., #tagname #colname:colvalue but I'm having second thoughts about performance and expandability. However what I really like about the tag approach is it's closer to something local-first, where you can define cols even without the app with minimal effort of you really had to. For example, of someone wanted to make a list of their thoughts on one running file, separated by a line break - they could add the thought then the tags/cols. This would make our app much more versatile. Only caveat is that tags and cols WOULD be the same table. They wouldn't have to be separated (i'm not storing all the tags together in a row for each note - each tag has a row and we use joins) so really the only distinction would be 2 data use cases in one table. There's really no caveat, I think even for performance besides the raw string check for whether its dynamic or not. We could even just have a db col for that. But then why not have another table? To prevent bloat? Overall I think it's a philsophy decision here - and whether we want to add more advanced data types than basic primitive that fit in a tag (and I actually want to keep it dead simple... even just the bloat of data types and colors in notion is too much for me).

- We should probably make either enter or cmd-enter a way to validate thoughts in ingest, with other shortcuts to edit, etc. If it needs extra steps like fill in another field, enter could take us to that view/form.

- We should implement undos for all CRUD operations. This would require a local-first cache of user actions (different from logs - although this could just be a db col on the internal events/logs table).

- Use count and offset for pagination in url params
- Find cmd for opening a file or thought in the extension

- in altered, add todo for periodically removing expired tokens
- Add defaults to sdkit config exports

- add logging in every func that's togglable with a debug flag and domain

- make config files optional and privide sdkit defaults

1. Drizzle SQL in Ray ext
2. Config loader for SDKit

3. Nanoid pass-through for network

4. Pass through

- Add auto-filling datasets from social media posts,etc

1. remember function
2. HTTP first but with 5s delay for local testing
3. How you can use mental lists to rememebr things

- temporary/exp datasets
- dynamic rules as operations that req a certain input can be used to create conditions for expiration, e.g., X times after the last entriy or pudate

- For e.g., logging, i think module-based configs are best. Because if you implement network func and you want to modify locales and logging behaviour, you would go to one config file instead of having to create two. IDK... what's more important here? IT's all DX... the ease of defining all props of a module in one file, or the uniformity of having all localization strings together?

# 1: Module-based configs

- Smaller chunks, easier to create and manage
- Harder to organize/scope modules, requires more refactoring
- More universal functionality

# 2: Type-based configs

- Easier to understand type/format
- Simple structure

...just decide as you go, current approach is probably fine. Having a bit of structure provides opportunity for refactoring, where module-based does not.

- put alias recs in store desc use as cmd name then put branded name in subtitle

- create codeComment API for consistent domain-specific comments
- create createDisplayParams func or ReadableOptionsObject util type to generate "with"/"for" style params for functions, with helper terms (is is a identifier, from means transforming an object, with means passing object, for means performing an action for something externally or a purpose, and means additional data, using means leveraging values to create an output, where is specifying a "condition", etc) so maybe "forPurpose" respectibly is "output-identification" "input-tooling/transformation" "input-subject/passing" "specifying-dependants" -- could have verbose mode, where using is usingObject, etc this could be "withSuffix"

- TTC + "do" mode
- Completion bias, and how doing small things compound
- Implement default messages for each id in a exception domain

- !!! don't worry too much about prototyping the app past simple add-remove, focus on adding thoughts and developing framework APIs for AI to rapidly build with and use

- Consider extending properties on `DataConstraintOption` to include validation errors.

```
type RequestData = Record<string, unknown>

export async function unwrapNetworkRequestData<T extends RequestData>({
    usingRequest,
    withValidation
}: {
    usingRequest: Request
    withValidation: ValidationSchema
}): Promise<T>
```

- first half of (code) day, refactor for scale, second half, build for speed

- For the above func, it may include a simple auth check in it unitl real auth is imp'd, and withValidation is an aliased, structured zod schema in a sense. It inherits the <> type to give it structure, using a util type to map its value types to the following. primitives are as strings like "number" "undefined". union types are string arrays. Since text based, we can accept string types like "cookie", but to avoid collisions with the primitives like "number" we need to prefix them with "string:". Instead of splitting this on colon which could create collisions, we split on "string:" and check the result count. for more complex validation/types, we can pass a function like `({ validator: v }) => v.string()` or `({ validator: v, value }) => v.string().parse(value)` (returns Zod result object) or `({ validator: v, value }) => v.string().parse(value).success` or `({ value }) => !!value`.

TODO extension preparation for store:

- Change CMD subtitles: Don't use subtitles as descriptions for your command
- Update README for onboarding screen / api key
- Create screenshots
- Add a license

// Before mass upload, we need:

- Dataset creation and selection
- HyperForm completion
- Monorepo setup
