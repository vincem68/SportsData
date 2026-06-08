
export interface NewsResponse {
    
  articles: {

    headline: string
    description: string

    images: {
        url: string
    }[]

    links: {
        web: {
            href: string
        }
    }[]

  }[]
}

export interface News {
    headline: string
    description: string
    imageUrl?: string
    articleUrl: string
}

