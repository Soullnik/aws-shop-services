import { AvailableProduct, Product, Stock } from "src/products/models"

export const getMockProducts = (): Product[] => {
    return ([
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
            "description": "Short Product Description1",
            "title": "ProductOne",
            "price": 24,
        },
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
            "description": "Short Product Description7",
            "title": "ProductTitle",
            "price": 15,
        },
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
            "description": "Short Product Description2",
            "title": "Product",
            "price": 23,
        },
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
            "description": "Short Product Description4",
            "title": "ProductTest",
            "price": 15,
        },
        {
            "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
            "description": "Short Product Descriptio1",
            "title": "Product2",
            "price": 23,
        },
        {
            "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
            "description": "Short Product Description7",
            "title": "ProductName",
            "price": 15,
        }
    ])
}

export const getMockStocks = (): Stock[] => {
    return ([
        {
            "product_id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
            "count": 10
        },
        {
            "product_id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
            "count": 10
        },
        {
            "product_id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
            "count": 10
        },
        {
            "product_id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
            "count": 10
        },
        {
            "product_id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
            "count": 10
        },
        {
            "product_id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
            "count": 10
        }
    ])
}

export const getMockAvailableProduct = (): AvailableProduct[] => {
    return ([
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
            "description": "Short Product Description1",
            "title": "ProductOne",
            "price": 24,
            "count": 10
        },
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
            "description": "Short Product Description7",
            "title": "ProductTitle",
            "price": 15,
            "count": 10
        },
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
            "description": "Short Product Description2",
            "title": "Product",
            "price": 23,
            "count": 10
        },
        {
            "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
            "description": "Short Product Description4",
            "title": "ProductTest",
            "price": 15,
            "count": 10
        },
        {
            "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
            "description": "Short Product Descriptio1",
            "title": "Product2",
            "price": 23,
            "count": 10
        },
        {
            "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
            "description": "Short Product Description7",
            "title": "ProductName",
            "price": 15,
            "count": 10
        }
    ])
}