export const getMockDataPrompt = ([ declarationCode ]: string[]) => {
  return (
    `Respond to user statements referencing a type alias or interface contained in the typescript declaration code included
    at the end of this prompt. Reply with typescript code that initializes a const variable,
    named "mockData", of the stated type. Use the faker-js library to provide random typed data.  Make the reply a
    string of valid typescript code that is formatted for readability.
    If the type specified by the user is not contained in this system prompt, then responsd simply with 'idk'.
    
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
      studentId: faker.number.bigInt()
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