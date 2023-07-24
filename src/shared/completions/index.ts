
import { openai } from "./openai";
import { getCompletionFactory, GetCompletionFactoryArgs } from "./openai/utils";
import { getMockDataPrompt } from "./prompts";

type PromptKey = 'GET_MOCK_DATA'

const systemPromptBuilder: GetCompletionFactoryArgs<PromptKey>[
  'systemPromptBuilder'
] = {
  GET_MOCK_DATA: getMockDataPrompt
}

const completionFactory = getCompletionFactory<PromptKey>({
  openai,
  systemPromptBuilder,
})

export const getMockDataCompletion = completionFactory({
  promptKey: 'GET_MOCK_DATA'
})