## What is this

A script to auto-generate code for a mock GET endpoint in `backends/api-server`.  Can be used to parallelize work between FE and BE.  Having an agreed upon response type will also be beneficial here, to prevent churn after the backend endpoint is created for real.

## Usage

```
node ./generate-mock-get-endpoint --path ${pathToFileContainingResponseType} --endpoint${mockEndpointPath} --interfaceName ${ResponseTypeInterfaceName}
```

For example:
```
node ./generate-mock-get-endpoint --path /Users/me/workspace/caribou/shared/route-responses/thing.ts --endpoint /drugs/hr-banana --interfaceName HrBananaResponse
```

Output will be a couple of files that can then be copy pasted into `backends/api-server`. 

## What this script actually does
Since this whole thing is a bit sus here is a breakdown of how it works.  Since this is a productivity tool, I figure it is OK if it doesn't work perfectly. Hopefully it will work well enough to save us some effort.

### Steps:
1. Validates user args.
2. Generates a single d.ts file using the `path` arg as the entry point in the `output` directory.  i.e. if you are trying to generate a GET endpoint that returns a response of type `HRBanana`, then you need to specify the absolute path to an existing typescript file that contains this type. This is to give openai the context needed to generate correct mock data for the interface we are interested in mocking in the mock route
3. Send a query to openai, containing the contextual typescript, and the name of the interface to be mocked.
4. With the openai completion, creates two code files in `output`.

### We don't need OpenAI for this
Good point. Open AI / LLM completion is not strictly necessary for this.  i.e. you could just manually insert some code using faker into the template files. But I wanted to experiment with lowering effort and time needed to get a mock route by the max + get feet wet with utilizing gpt for code gen.