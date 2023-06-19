export interface Product {
    description: string,
    id: string,
    price: number,
    title: string
}

export interface Stock {
    'product_id': string,
    count: number,
}

export type AvailableProduct = Product & { count: number }