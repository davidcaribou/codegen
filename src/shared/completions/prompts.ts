export const getMockDataPrompt = (declarationCode: string) => {
  return (
    `Respond to user statements referencing a type alias or interface contained in the typescript declaration code included
    at the end of this prompt. Reply with a string of valid typescript code that initializes a const variable,
    named "mockData", of the stated type. Do not include anything except the code itself, do not surround it with the name typescript or backticks. Choose from among the following faker-js commands to provide the
    values for the mock data:
    * faker.name.firstName
    * faker.name.lastName
    * faker.helpers.arrayElement
    * faker.datatype.number
    * faker.lorem.word
    * faker.datatype.uuid
    * faker.datatype.boolean
    Do not import faker or use any other libraries.
    If the type specified by the user is not contained in this system prompt, then respond with 'idk'.
    
    i.e. In response to a user statement: 
    \`\`\`
      Student
    \`\`\`
    ,if that is the name of a type alias or interface contained in the system prompt,
    reply with a formatted code string, assuming faker is in scope:
    \`\`\`
    const mockData: Student = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      studentId: faker.datatype.uuid()
    }
    \`\`\`
  
    Use the following type definitions as context to understand the type in the user statement.  The user statement
    must refer to a type in this block to receive code, otherwise the reply should be 'idk'. 
    \`\`\`
    ${declarationCode}
    \`\`\`
    `
  )
}


// code to augment the mock code


type NewParams = {
  mapParam?: {
    mockFieldName: string
    mockParameterName: string
  }
  hardcodedParams?: Record<string, string>
  pluginParams?: Record<string, {name: string, type: string}>
}

export const augmentMockDataUserPrompt = ({
  mapParam,
  hardcodedParams,
  pluginParams,
}: NewParams): string => {
  const mapParamInstruction = mapParam
    ? `Update the mock data generator parameter to include a new field: ${mapParam.mockParameterName} of type string[].
    Return a mock array that maps the ${mapParam.mockParameterName} array, replacing the ${mapParam.mockFieldName} value with the value of
    the ${mapParam.mockParameterName} item.`
    : ''
  const hardcodeParamsInstruction = hardcodedParams
    ? `Update the mock data generator to hardcode the value of the following comma delimited fields: ${Object.keys(hardcodedParams).join(',')}
    with the following comma delimited values respectively: ${Object.values(hardcodedParams)}.`
    : ''
  const pluginParamsInstruction = pluginParams
    ? `Update the mock data generator parameter to include the following new fields:
    ${Object.values(pluginParams).map(({ name }) => name).join(',')} of these types respectively:
    ${Object.values(pluginParams).map(({ type }) => type).join(',')}.
    Replace the value of the following comma delimited fields: ${Object.keys(pluginParams)} with the value of these new parameter fields respectively: 
    ${Object.values(pluginParams).map(({ name }) => name).join(',')}.`
    : ''

  return [
    mapParamInstruction,
    hardcodeParamsInstruction,
    pluginParamsInstruction
  ].filter(s => s).join('\n')
}

export const augmentMockDataSystemPrompt = ({
  mockDataSource,
  typeName,
}: {
  mockDataSource: string
  typeName: string
}) => {
  return `
  Given the following typescript code template: 
\`\`\`
const generateMockData = async ({
  maxDelayMs = 2000,
  errorResistance = 0.95,
}: {
  maxDelayMs?: number
  errorResistance?: number
}): Promise<ApiResponse> => {
  // built in flake!
  const errorRoll = Math.random()
  if (errorRoll >= errorResistance) {
    return Promise.reject()
  }

  const delay = Math.max(500, Math.round(maxDelayMs * Math.random())) // minimum half second delay
  await new Promise((resolve) => setTimeout(resolve, delay))

  const mockData: ${typeName} = ${mockDataSource};
  return mockData
}

  return mockData
}
\`\`\`
modify the initialization of the variable mockData, based on the instructions in the
user statement, while making sure the return type is unchanged.
If the return type is an array, the user statement may ask to create a map from
an array parameter with one or more of the mock variables being provided by
the argument.  Likewise the user statement may ask to substitute a given field
with a value provided in the arguments. Reply to the user statement with a code
formatted string of the modified generateMockData definition. Do not
include any additional verbiage, just the code string itself.
  `
}