export const getMockDataPrompt = (declarationCode: string) => {
  return (
    `Respond to user statements referencing a type alias or interface contained in the typescript declaration code included
    at the end of this prompt. Reply with a string of valid typescript code that initializes a const variable,
    named "mockData", of the stated type. Choose from among the following faker-js commands to provide the
    values for the mock data:
    * faker.name.firstName
    * faker.name.lastName
    * faker.helper.arrayElement
    * faker.datatype.number
    * faker.lorem.word
    * faker.datatype.uuid
    
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