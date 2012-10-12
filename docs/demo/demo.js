var books = [
  {
    "title" : "Nineteen Eighty-Four",
    "author" : "George Orwell",
    "year" : 1949
  },
  {
    "title" : "Fahrenheit 451",
    "author" : "Ray Bradbury",
    "year" : 1953
  },
  {
    "title" : "A Tale of Two Cities",
    "author" : "Charles Dickens",
    "year" : 1859
  },
  {
    "title" : "Robinson Crusoe",
    "author" : "Daniel Defoe",
    "year" : 1719
  },
  {
    "title" : "Emma",
    "author" : "Jane Austen",
    "year" : 1815
  },
  {
    "title" : "Frankenstein",
    "author" : "Mary Shelley",
    "year" : 1818
  },
  {
    "title" : "The Count of Monte Cristo",
    "author" : "Alexandre Dumas",
    "year" : 1844
  },
  {
    "title" : "Wuthering Heights",
    "author" : "Emily Brontë",
    "year" : 1847
  },
  {
    "title" : "The Woman in White",
    "author" : "Wilkie Collins",
    "year" : 1859
  },
  {
    "title" : "Alice's Adventures In Wonderland",
    "author" : "Lewis Carroll",
    "year" : 1865
  },
  {
    "title" : "The Portrait of a Lady",
    "author" : "Henry James",
    "year" : 1881
  },
  {
    "title" : "Brave New World",
    "author" : "Aldous Huxley",
    "year" : 1932
  }
];

Tableling.debug = true;
console.log('Tableling is in debug mode.');

var Book = Backbone.Model.extend({});

var Books = Tableling.Collection.extend({

  sync : function(method, model, options, error) {

    if (method != 'read') {
      throw new Error('Not implemented for this demo');
    }

    var data = books;
    var req = options.data;
    var i = (req.page - 1) * req.pageSize;
    data = data.slice(i, i + req.pageSize);

    if (req.quickSearch) {
      var term = req.quickSearch.toLowerCase();
      data = _.filter(data, function(item) {
        return item.title.toLowerCase().indexOf(term) >= 0;
      });
    }

    var json = {
      total: books.length,
      data: data
    };

    var response = $.Deferred();
    response.resolve(json);
    options.success(json);
    return response;
  }
});

var NoBookRow = Backbone.Marionette.ItemView.extend({
  tagName: 'tr',
  className: 'empty',
  template: _.template('<td colspan="3">No book found</td>')
});

var BookRow = Backbone.Marionette.ItemView.extend({

  tagName: 'tr',
  template: _.template('<td class="title" /><td class="author" /><td class="year" />'),

  ui : {
    title: '.title',
    author: '.author',
    year: '.year'
  },

  onRender : function() {
    this.ui.title.text(this.model.get('title'));
    this.ui.author.text(this.model.get('author'));
    this.ui.year.text(this.model.get('year'));
  }
});

var BooksTableView = Tableling.Bootstrap.TableView.extend({
  tagName: 'table',
  className: 'table table-striped table-hover',
  template: _.template('<thead><tr><th>Title</th><th>Author</th><th>Year</th></tr><tbody />'),
  itemView: BookRow,
  emptyView: NoBookRow,
  itemViewContainer: 'tbody',

  initialize : function(options) {
    Tableling.Bootstrap.TableView.prototype.initialize.call(this, options);
  }
});

var BooksTable = Tableling.Bootstrap.Table.extend({

  tableView : BooksTableView,
  tableViewOptions : {
    collection: new Books({
      model: Book
    })
  }
});

$(function() {

  new Backbone.Marionette.Region({
    el: '#books'
  }).show(new BooksTable({
    tableling: {
      pageSize: 5
    }
  }));
});
