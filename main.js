let selectedRow = null;

const map = new Map();
let count = 0;

class Book {
  constructor(bookname, author, bookid) {
    this.bookname = bookname;
    this.author = author;
    this.bookid = bookid;
  }
}

class UI {
  static displayBooks() {
    const storedBooks = Store.getBooks();
    const books = storedBooks;

    books.forEach((book) => UI.addBookToList(book));
  }

  static removeBook(el) {
    if (el.classList.contains("delete")) {
      el.parentElement.parentElement.remove();
    }
  }

  static clearForm() {
    document.querySelector("#bookname").value = "";
    document.querySelector("#author").value = "";
    document.querySelector("#bookid").value = "";
  }

  static editBook(el) {
    selectedRow = el.parentElement.parentElement;
    const bookid =
      el.parentElement.previousElementSibling.previousElementSibling
        .textContent;
    const books = Store.getBooks();
    books.forEach((book) => {
      if (book.bookid == bookid) {
        const bookname = book.bookname;
        const author = book.author;

        document.querySelector("#bookname").value = bookname;
        document.querySelector("#author").value = author;
        document.querySelector("#bookid").value = bookid;
      }
    });
  }

  static editRow(row, bookname, author, bookid) {
    row.cells[0].innerHTML = bookname;
    row.cells[1].innerHTML = author;
    row.cells[2].innerHTML = bookid;
  }

  static addBookToList(book) {
    const list = document.querySelector("#book-list");

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${book.bookname}</td>
      <td>${book.author}</td>
      <td>${book.bookid}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
      <td><a href="#" class="btn btn-secondary btn-sm edit">Edit</a></td>
    `;

    list.appendChild(row);
  }

  static displayAlert(message, className) {
    const div = document.createElement("div");
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector(".container");
    const form = document.querySelector("#book-form");
    container.insertBefore(div, form);

    setTimeout(() => {
      document.querySelector(".alert").remove();
    }, 3000);
  }
}

class Store {
  static addBook(book) {
    const books = Store.getBooks();
    books.push(book);
    localStorage.setItem("books", JSON.stringify(books));
  }

  static getBooks() {
    let books;
    if (localStorage.getItem("books") === null) {
      books = [];
    } else books = JSON.parse(localStorage.getItem("books"));
    return books;
  }

  static editBook(bookid, bookname, author) {
    const books = Store.getBooks();

    books.forEach((k) => {
      if (k.bookid == bookid) {
        k.bookname = bookname;
        k.author = author;
      }
    });

    localStorage.setItem("books", JSON.stringify(books));
  }

  static removeBook(bookid) {
    count--;
    const books = Store.getBooks();
    books.forEach((book, index) => {
      if (book.bookid == bookid) {
        books.splice(index, 1);
      }
    });
    map.delete(bookid);
    localStorage.setItem("books", JSON.stringify(books));
  }
}

document.addEventListener("DOMContentLoaded", UI.displayBooks);

document.querySelector("#book-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const bookname = document.querySelector("#bookname").value;
  const author = document.querySelector("#author").value;
  let bookid = document.querySelector("#bookid").value;

  if (bookid == "") {
    bookid = Math.floor(Math.random() * 100 + 1);
    while (map.get(bookid) != undefined && count < 100) {
      bookid = Math.floor(Math.random() * 100 + 1);
    }
    if (count == 100) {
      UI.displayAlert("Max Storage reached", "danger");
      return;
    }
  }

  if (bookname == "" || author === "" || bookid === "") {
    UI.displayAlert("Fill in all the details", "danger");
  } else {
    let flag = 0;
    const books = Store.getBooks();
    books.forEach((book) => {
      if (book.bookid == bookid) {
        Store.editBook(bookid, bookname, author);
        UI.editRow(selectedRow, bookname, author, bookid);
        UI.displayAlert("Book edited", "success");
        UI.clearForm();
        flag = 1;
      }
    });
    if (flag === 0) {
      const book = new Book(bookname, author, bookid);
      console.log(count);

      Store.addBook(book);
      map.set(bookid, 1);
      count++;

      UI.addBookToList(book);

      UI.displayAlert("Book added", "success");

      UI.clearForm();
    }
  }
});

document.querySelector("#book-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    UI.removeBook(e.target);

    Store.removeBook(e.target.parentElement.previousElementSibling.textContent);

    UI.displayAlert("Book removed", "success");
  } else if (e.target.classList.contains("edit")) {
    UI.editBook(e.target);
  }
});
