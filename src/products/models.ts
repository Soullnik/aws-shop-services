export interface Product {
    description: string,
    id: string,
    price: number,
    title: string
}

export interface Stock {
    id: string,
    count: number,
}

export type AvailableProduct = Stock & Product