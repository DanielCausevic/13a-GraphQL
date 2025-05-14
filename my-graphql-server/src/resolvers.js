import { PubSub } from 'graphql-subscriptions';
import { books, authors } from './data.js';

const pubsub = new PubSub();
const BOOK_ADDED = 'BOOK_ADDED';

export default {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find(b => b.id === id),
    authors: () => authors,
    author: (_, { id }) => authors.find(a => a.id === id),
  },

  Mutation: {
    createBook: (_, { authorId, title, releaseYear }) => {
      const newBook = {
        id: String(books.length + 1),
        title,
        releaseYear,
        authorId
      };
      books.push(newBook);
      pubsub.publish(BOOK_ADDED, { bookAdded: newBook });
      return newBook;
    },
    updateBook: (_, { id, authorId, title, releaseYear }) => {
      const book = books.find(b => b.id === id);
      if (!book) return null;
      if (authorId) book.authorId = authorId;
      if (title) book.title = title;
      if (releaseYear !== undefined) book.releaseYear = releaseYear;
      return book;
    },
    deleteBook: (_, { id }) => {
      const index = books.findIndex(b => b.id === id);
      if (index === -1) return { message: "Book not found" };
      books.splice(index, 1);
      return { message: "Book deleted successfully" };
    }
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator([BOOK_ADDED]),
    }
  },

  Book: {
    author: (book) => authors.find(a => a.id === book.authorId)
  },

  Author: {
    books: (author) => books.filter(b => b.authorId === author.id)
  }
};
