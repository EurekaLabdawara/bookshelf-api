const { nanoid } = require('nanoid');
const books = require('./books');
const ValidationError = require('./validationError');

function validationBookInput(input, method) {
  const message = method === 'add' ? 'menambahkan' : 'memperbarui';

  if (input.name === undefined) {
    throw new ValidationError(`Gagal ${message} buku. Mohon isi nama buku`);
  }

  if (input.readPage > input.pageCount) {
    throw new ValidationError(`Gagal ${message} buku. readPage tidak boleh lebih besar dari pageCount`);
  }
}

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  try {
    validationBookInput(request.payload, 'add');

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;
    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);
    const isSuccess = books.filter((book) => book.id === id).length > 0;
    if (isSuccess) {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });
      response.code(201);
      return response;
    }
  } catch (error) {
    const response = h.response({
      status: 'fail',
      message: error.message,
    });
    response.code(400);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'err',
  });
  response.code(400);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const {
    name: paramName,
    reading: paramReading,
    finished: paramFinished,
  } = request.query;

  let filtered = books;
  if (paramName) {
    filtered = filtered.filter((book) => book.name.toLowerCase().includes(paramName.toLowerCase()));
  }
  if (paramReading && (paramReading === '0' || paramReading === '1')) {
    filtered = filtered.filter((book) => book.reading === Boolean(parseInt(paramReading, 2)));
  }
  if (paramFinished && (paramFinished === '0' || paramFinished === '1')) {
    filtered = filtered.filter((book) => book.finished === Boolean(parseInt(paramFinished, 2)));
  }

  const allBook = [...filtered.map((book) => {
    const { id, name, publisher } = book;
    return {
      id,
      name,
      publisher,
    };
  })];
  const response = h.response({
    status: 'success',
    data: {
      books: allBook,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((b) => b.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  try {
    validationBookInput(request.payload);

    const updatedAt = new Date().toISOString();
    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
      };
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  } catch (error) {
    const response = h.response({
      status: 'fail',
      message: error.message,
    });
    response.code(400);
    return response;
  }
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
