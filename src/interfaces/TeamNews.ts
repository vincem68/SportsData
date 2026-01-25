export interface TeamNewsResponse {
  articles: Article[]
}

interface Article {
    headline: string
    description: string
    images: Image[]
    links: Link[]
}

interface Image {
    url: string
}

interface Link {
    web: Web
}

interface Web {
    href: string
}

export interface TeamNews {
    headline: string
    description: string
    imageUrl?: string
    articleUrl: string
}

