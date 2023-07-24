import { OpenAIApi } from 'openai'

export interface CompletionsCache<T extends string> {
  completions: Record<string, string>
  getCacheKey: (input: string, key: T) => string
}

export interface GetCompletionFactoryArgs<T extends string> {
  openai: OpenAIApi
  systemPromptBuilder: Record<T, (...args: any[]) => string>
  cache: CompletionsCache<T>
}

export interface CompletionFactoryArgs<T extends string> {
  validateCompletion?: (response: string) => boolean
  promptKey: T
}

export const getCompletionFactory = <T extends string>({
  openai,
  cache: { getCacheKey, completions},
  systemPromptBuilder
}: GetCompletionFactoryArgs<T>) => {
  return function completionFactory({
    promptKey,
    validateCompletion,
  }: CompletionFactoryArgs<T>){
    return async function getCompletion(
      input: string,
      noCache: boolean,
      ...args: any[]
    ): Promise<string | null>  {
      const cacheKey = getCacheKey(input, promptKey)
      if (typeof completions[cacheKey] === 'string' && noCache !== true) {
        return completions[cacheKey]
      }
      const systemPrompt = systemPromptBuilder[promptKey](...args)
      try {
        const completion = await openai.createChatCompletion({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: systemPrompt,
          }, {
            role: 'user',
            content: input
          }]
        })
        console.info('completion response:', completion.data.choices)
        const response = completion.data.choices[0].message
        // if we get a valid response, save to cache!
        if (response?.content && validateCompletion?.(response.content) !== false) {
          completions[cacheKey] = response.content
          return response.content
        }
      } catch(error) {
        console.error('completion failed', error)
      }
      return null
    }
  }
}