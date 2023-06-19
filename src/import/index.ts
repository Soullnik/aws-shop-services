import path from "path"

export class ImportService {
    static handlerName = 'handler'

    static importProductsFile() {
        return path.join(__dirname, 'handlers', 'importProductsFile.ts')
    }
    static importFileParser() {
        return path.join(__dirname, 'handlers', 'importFileParser.ts')
    }
}