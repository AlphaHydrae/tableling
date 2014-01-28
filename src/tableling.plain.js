Tableling.Plain = {};

Tableling.Plain.Table = Tableling.Modular.extend({

  className: 'tableling',
  modules: [ 'table', 'pageSize', 'quickSearch', 'info', 'page' ],
  template: _.template('<div class="header"><div class="pageSize" /><div class="quickSearch" /></div><div class="table" /><div class="footer"><div class="info" /><div class="page" /></div>'),

  regions: {
    tableRegion: '.table',
    pageSizeRegion: '.pageSize',
    quickSearchRegion: '.quickSearch',
    infoRegion: '.info',
    pageRegion: '.page'
  }
});

// TODO: make table view a module
Tableling.Plain.TableView = Backbone.Marionette.CompositeView.extend({

  moduleEvents: {
    'click thead th.sorting': 'updateSort',
    'click thead th.sorting-asc': 'updateSort',
    'click thead th.sorting-desc': 'updateSort'
  },

  // TODO: add auto-sort
  initialize: function(options) {

    this.vent = options.vent;
    this.sort = [];
    this.vent.on('table:setup', this.setSort, this);
    this.vent.on('table:refreshed', this.setSort, this);
    this.events = _.extend({}, this.events || {}, this.moduleEvents);

    if (typeof(this.initializeModule) == 'function') {
      this.initializeModule(options);
    }
  },

  updateSort: function(ev) {

    var el = $(ev.currentTarget);
    if (!(el.hasClass('sorting') || el.hasClass('sorting-asc') || el.hasClass('sorting-desc'))) {
      return;
    }

    var field = this.fieldName(el);

    if (ev.shiftKey || this.sort.length == 1) {

      var index = -1;
      _.find(this.sort, function(item, i) {
        if (item.split(' ')[0] == field) {
          index = i;
        }
      });

      if (index >= 0) {

        var parts = this.sort[index].split(' ');
        this.sort[index] = parts[0] + ' ' + (parts[1] == 'asc' ? 'desc' : 'asc');
        this.showSort();
        return this.vent.trigger('table:update', this.config());
      }
    }

    if (!ev.shiftKey) {
      this.sort.length = 0;
    }

    this.sort.push(field + ' asc');

    this.showSort();

    this.vent.trigger('table:update', this.config());
  },

  setSort: function(config) {
    if (config && config.sort) {
      this.sort = config.sort.slice(0);
      this.showSort();
    }
  },

  showSort: function() {

    this.$el.find('thead th.sorting, thead th.sorting-asc, thead th.sorting-desc').removeClass('sorting sorting-asc sorting-desc').addClass('sorting');

    for (var i = 0; i < this.sort.length; i++) {

      var parts = this.sort[i].split(' ');
      var name = parts[0];
      var direction = parts[1];
      
      field = this.$el.find('thead [data-field="' + name + '"]');
      if (!field.length) {
        field = this.$el.find('thead th:contains("' + name + '")');
      }

      if (field.length) {
        field.removeClass('sorting').addClass(direction == 'desc' ? 'sorting-desc' : 'sorting-asc');
      }
    }
  },

  config: function() {
    return {
      page: 1,
      sort: this.sortConfig()
    };
  },

  sortConfig: function() {
    return this.sort.length ? this.sort : null;
  },

  fieldName: function(el) {
    return el.data('field') || el.text();
  }
});

Tableling.Plain.PageSizeView = Tableling.Plain.Table.prototype.pageSizeView = Tableling.FieldModule.extend({

  // TODO: update current page intelligently
  name: 'pageSize',
  template: function(data) {
    return _.template('<select name="pageSize" /> <%- entries %>', data);
  },

  i18n: {
    entries: 'entries per page'
  },
  sizes: [ 10, 15, 20, 25, 50 ],

  ui: {
    field: 'select'
  },

  initialize: function(options) {
    this.sizes = _.clone(options.sizes || this.sizes);
    Tableling.FieldModule.prototype.initialize.call(this, options);
  },

  onRender: function() {
    this.ui.field.empty();
    _.each(this.sizes, _.bind(this.addSize, this));
  },

  addSize: function(size) {
    $('<option />').text(size).appendTo(this.ui.field);
  },

  setupValue: function(value) {
    if (value) {
      Tableling.FieldModule.prototype.setupValue.apply(this, Array.prototype.slice.call(arguments));
    }
  },

  config: function() {
    var config = Tableling.FieldModule.prototype.config.call(this);
    config.page = 1;
    return config;
  }
});

Tableling.Plain.QuickSearchView = Tableling.Plain.Table.prototype.quickSearchView = Tableling.FieldModule.extend({

  name: 'quickSearch',
  template: function(data) {
    return _.template('<input type="text" name="quickSearch" placeholder="<%- quickSearch %>" />', data);
  },

  i18n: {
    quickSearch: 'Quick search...'
  },

  config: function() {
    var config = Tableling.FieldModule.prototype.config.call(this);
    config.page = 1;
    return config;
  }
});

Tableling.Plain.InfoView = Tableling.Plain.Table.prototype.infoView = Tableling.Module.extend({

  template: function(data) {
    return _.template(data.template, {
      first: '<span class="first">0</span>',
      last: '<span class="last">0</span>',
      total: '<span class="total">0</span>'
    });
  },

  i18n: {
    template: 'Showing <%= first %> to <%= last %> of <%= total %> entries'
  },

  ui: {
    first: '.first',
    last: '.last',
    total: '.total'
  },

  refresh: function(data) {
    if (data) {
      this.ui.first.text(this.firstRecord(data));
      this.ui.last.text(this.lastRecord(data));
      this.ui.total.text(data.total);
    }
  },

  firstRecord: function(data) {
    return data.length ? ((data.page || 1) - 1) * data.pageSize + 1 : 0;
  },

  lastRecord: function(data) {
    return data.length ? this.firstRecord(data) + data.length - 1 : 0;
  }
});

Tableling.Plain.PageView = Tableling.Plain.Table.prototype.pageView = Tableling.Module.extend({
    
  template: _.template('<ul class="pagination"><li class="first"><a href="#">&lt;&lt;</a></li><li class="previous"><a href="#">&lt;</a></li><li class="next"><a href="#">&gt;</a></li><li class="last"><a href="#">&gt;&gt;</a></li></ul>'),
  pageTemplate: _.template('<li class="page"><a href="#"><%- number %></a></li>'),

  ui: {
    first: '.first',
    previous: '.previous',
    next: '.next',
    last: '.last'
  },

  events: {
    'click .first:not(.disabled)': 'goToFirstPage',
    'click .previous:not(.disabled)': 'goToPreviousPage',
    'click .page:not(.disabled)': 'goToPage',
    'click .next:not(.disabled)': 'goToNextPage',
    'click .last:not(.disabled)': 'goToLastPage'
  },

  refresh: function(data) {
    this.$el.find('.page').remove();
    if (!data || !data.length) {
      this.ui.first.addClass('disabled');
      this.ui.previous.addClass('disabled');
      this.ui.next.addClass('disabled');
      this.ui.last.addClass('disabled');
    } else {
      this.data = data;
      this.enable(this.ui.first, this.getPage(data) > 1);
      this.enable(this.ui.previous, this.getPage(data) > 1);
      this.setupPages();
      this.enable(this.ui.next, this.getPage(data) < this.numberOfPages(data));
      this.enable(this.ui.last, this.getPage(data) < this.numberOfPages(data));
    }
  },

  setupPages: function() {

    var page = this.getPage(this.data);
    var total = this.numberOfPages();

    var first = page - 2;
    if (total - first < 4) {
      first = total - 4;
    }

    if (first < 1) {
      first = 1;
    }

    var n = 5;
    if (first + n - 1 > total) {
      n = total - first + 1;
    }

    _.times(n, function(i) {
      $(this.pageTemplate({ number: first + i })).insertBefore(this.ui.next);
    }, this);

    var i = page - first;
    this.$el.find('.page').slice(i, i + 1).addClass('disabled');
  },

  enable: function(el, enabled) {
    el.removeClass('disabled');
    if (!enabled) {
      el.addClass('disabled');
    }
  },

  numberOfPages: function() {
    return Math.ceil(this.data.total / this.data.pageSize);
  },

  goToFirstPage: function(e) {
    e.preventDefault();
    this.goToPageNumber(1);
  },

  goToPreviousPage: function(e) {
    e.preventDefault();
    this.goToPageNumber(this.getPage(this.data) - 1);
  },

  goToPage: function(e) {
    e.preventDefault();
    this.goToPageNumber(parseInt($(e.target).text(), 10));
  },

  goToNextPage: function(e) {
    e.preventDefault();
    this.goToPageNumber(this.getPage(this.data) + 1);
  },

  goToLastPage: function(e) {
    e.preventDefault();
    this.goToPageNumber(this.numberOfPages());
  },

  goToPageNumber: function(n) {
    this.vent.trigger('table:update', { page: n });
  },

  getPage: function(data) {
    return data.page || 1;
  }
});
