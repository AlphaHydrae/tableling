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

  model : Book,

  sync : function(method, model, options) {

    if (method != 'read') {
      throw new Error('Not implemented for this demo');
    }

    var data = books;
    var req = options.data;

    if (req.quickSearch) {
      var term = req.quickSearch.toLowerCase();
      data = _.filter(data, function(item) {
        return item.title.toLowerCase().indexOf(term) >= 0 || item.author.toLowerCase().indexOf(term) >= 0 || item.year.toString().toLowerCase().indexOf(term) >= 0;
      });
    }

    var n = data.length;

    if (req.sort) {
      data = data.sort(function(a, b) {

        for (var i = 0; i < req.sort.length; i++) {

          var parts = req.sort[i].split(' ');
          var attr = parts[0].toLowerCase();
          var direction = parts[1];

          a = a[attr].toString().toLowerCase();
          b = b[attr].toString().toLowerCase();

          var comp = a.localeCompare(b);
          if (comp != 0) {
            return comp * (direction == 'asc' ? 1 : -1);
          }
        }
        return 0;
      });
    }

    var page = parseInt(req.page || 1);
    var pageSize = parseInt(req.pageSize || 5);
    var i = (page - 1) * pageSize;
    data = data.slice(i, i + pageSize);

    var json = {
      total: n,
      data: data
    };

    var response = $.Deferred();
    response.resolve(json);
    options.success(json);
    model.trigger('request', model, null, options);
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
  template: _.template('<thead><tr><th class="sorting title">Title</th><th class="sorting author">Author</th><th class="sorting year">Year</th></tr><tbody />'),
  itemView: BookRow,
  emptyView: NoBookRow,
  itemViewContainer: 'tbody'
});

var BooksTable = Tableling.Bootstrap.Table.extend({

  tableView : BooksTableView,
  tableViewOptions : {
    collection: new Books()
  },
  pageSizeViewOptions : {
    sizes : [ 5, 10, 15 ]
  }
});

$(function() {

  new Backbone.Marionette.Region({
    el: '#books'
  }).show(new BooksTable());
});
