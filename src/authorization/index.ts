import path from "path"

export class AuthorizationService {
    static handlerName = 'handler'

    static basicAuthorizer() {
        return path.join(__dirname, 'handlers', 'basicAuthorizer.ts')
    }
}