
export interface TeamNewsResponse {
    
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

export interface TeamNews {
    headline: string
    description: string
    imageUrl?: string
    articleUrl: string
}

