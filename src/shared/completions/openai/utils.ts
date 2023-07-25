import { OpenAIApi } from 'openai'

export interface GetCompletionFactoryArgs<T extends string> {
  openai: OpenAIApi
  systemPromptBuilder: Record<T, (...args: any[]) => string>
}

export interface CompletionFactoryArgs<T extends string> {
  validateCompletion?: (response: string) => boolean
  promptKey: T
}

export const getCompletionFactory = <T extends string>({
  openai,
  systemPromptBuilder
}: GetCompletionFactoryArgs<T>) => {
  return function completionFactory({
    promptKey,
    validateCompletion,
  }: CompletionFactoryArgs<T>){
    return async function getCompletion(
      input: string,
      ...args: any[]
    ): Promise<string | null>  {
      const systemPrompt = systemPromptBuilder[promptKey](...args)
      try {
        const completion = await openai.createChatCompletion({
          model: process.env.MODEL_NAME ?? 'gpt-4',
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

        // optionally validate (i.e. parse) the response string from gpt before returning the string
        // useful if requesting json strings
        if (response?.content && validateCompletion?.(response.content) !== false) {
          return response.content
        }
      } catch(error) {
        console.error('completion failed', error)
      }
      return null
    }
  }
}