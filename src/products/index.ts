import path from "path";

export class ProductsService {

    static handlerName = 'handler'

    static getByIdHandlerPath() {
        return path.join(__dirname, 'handlers', 'getById.ts')
    }
    static getListHandlerPath() {
        return path.join(__dirname, 'handlers', 'getList.ts')
    }
    static getPostProductHandlerPath() {
        return path.join(__dirname, 'handlers', 'postProduct.ts')
    }
}