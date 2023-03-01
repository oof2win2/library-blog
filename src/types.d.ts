interface GoogleBooksAPIVolume {
  kind: "books#volume";
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: {
    title: string;
    subtitle: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description: string;
    industryIdentifiers: {
      type: string;
      identifier: string;
    }[];
    pageCount: number;
    dimensions: {
      height: string;
      width: string;
      thickness: string;
    };
    printType: string;
    mainCategory: string;
    categories: string[];
    averageRating: number;
    ratingsCount: number;
    contentVersion: string;
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      extraLarge: string;
    };
    language: string;
    previewLink: string;
    infoLink: string;
    canonicalVolumeLink: string;
  };
  // other stuff as well, but that's not interesting for us
}

// https://developers.google.com/books/docs/v1/using#PerformingSearch
interface GoogleBooksAPIVolumeListRequest {
  q: string;
  startIndex?: number;
  maxResults?: number;
}
interface GoogleBooksAPIVolumeListResponse {
  kind: "books#volumes";
  totalItems: number;
  items: GoogleBooksAPIVolume[];
}
