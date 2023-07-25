export const getRouteCode = (interfaceName: string, mockDataVariable: string) => `
import { faker } from '@faker-js/faker'
import { AppData, publicRoute, passthrough } from 'router'
import { ResultAsync } from 'neverthrow'
import routeErrors from 'errors'
import { ${interfaceName} } from 'shared'
import { RbacPermission } from 'router/rbac'

type ApiResponse = ${interfaceName}

const config = {
  operation: 'read:user' as RbacPermission,
  parser: passthrough(),
}

const generateMockData = async ({
  maxDelayMs = 2000,
  errorResistance = 0.95
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
  await new Promise(resolve => setTimeout(resolve, delay))
  ${mockDataVariable}
  return mockData
}  

export default publicRoute<ApiResponse>(
  config,
  ({ utils }) => {
    return ResultAsync.fromPromise(
      generateMockData({}), // OPTIONALLY OVERRIDE DEFAULTS HERE
      (err) => utils.intoRouteError(routeErrors.other('mock route failed. error: '+ err))
    ).map(AppData.init)
  }
)
`
export const getApiHook = (interfaceName: string, endpoint: string) => {
  return `
    import {${interfaceName}} from 'shared'
    import { useGetPrivateRequest } from '../fetch-promise'

    export const useGet${interfaceName} = () => {
      const _fetch = useGetPrivateRequest<${interfaceName}, undefined>({
        url: 'mock/${endpoint}',
      })
    
      return async () => {
        const result = await _fetch({})
        return result
      }
    }
  `
}