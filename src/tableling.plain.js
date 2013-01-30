Tableling.Plain = {};

Tableling.Plain.Table = Tableling.Modular.extend({

  className: 'tableling',
  modules : [ 'table', 'pageSize', 'quickSearch', 'info', 'pagination' ],
  template : _.template('<div class="header"><div class="pageSize" /><div class="quickSearch" /></div><div class="table" /><div class="footer"><div class="info" /><div class="pagination" /></div>'),

  regions : {
    tableRegion : '.table',
    pageSizeRegion : '.pageSize',
    quickSearchRegion : '.quickSearch',
    infoRegion : '.info',
    paginationRegion : '.pagination'
  }
});

Tableling.Plain.TableView = Backbone.Marionette.CompositeView.extend({

  events : {
    'click thead th' : 'updateSort'
  },

  initialize : function(options) {
    // TODO: add auto-sort
    this.vent = options.vent;
    this.sort = [];
    this.vent.on('table:setup', this.setSort, this);
  },

  updateSort : function(ev) {

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

  setSort : function(config) {
    if (config && config.sort) {
      this.sort = config.sort.slice(0);
      this.showSort();
    }
  },

  showSort : function() {

    this.$el.find('thead th').removeClass('sorting sorting-asc sorting-desc').addClass('sorting');

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

  config : function() {
    return {
      page : 1,
      sort : this.sortConfig()
    };
  },

  sortConfig : function() {
    return this.sort.length ? this.sort : null;
  },

  fieldName : function(el) {
    return el.data('field') || el.text();
  }
});

Tableling.Plain.PageSizeView = Tableling.Plain.Table.prototype.pageSizeView = Tableling.FieldModule.extend({
  // TODO: update current page intelligently
  name : 'pageSize',
  template : _.template('<select name="pageSize" /> entries per page'),
  sizes : [ 10, 15, 20, 25, 50 ],

  ui : {
    field : 'select'
  },

  initialize : function(options) {
    Tableling.FieldModule.prototype.initialize.call(this, options);
    this.sizes = _.clone(options.sizes || this.sizes);
  },

  onRender : function() {
    this.ui.field.empty();
    _.each(this.sizes, _.bind(this.addSize, this));
  },

  addSize : function(size) {
    $('<option />').text(size).appendTo(this.ui.field);
  },

  config : function() {
    var config = Tableling.FieldModule.prototype.config.call(this);
    config.page = 1;
    return config;
  }
});

Tableling.Plain.QuickSearchView = Tableling.Plain.Table.prototype.quickSearchView = Tableling.FieldModule.extend({

  name : 'quickSearch',
  template : _.template('<input type="text" name="quickSearch" placeholder="Quick search..." />'),

  config : function() {
    var config = Tableling.FieldModule.prototype.config.call(this);
    config.page = 1;
    return config;
  }
});

Tableling.Plain.InfoView = Tableling.Plain.Table.prototype.infoView = Tableling.Module.extend({

  template : _.template('Showing <span class="first">0</span> to <span class="last">0</span> of <span class="total">0</span> entries'),

  ui : {
    first: '.first',
    last: '.last',
    total: '.total'
  },

  refresh : function(data) {
    if (data) {
      this.ui.first.text(this.firstRecord(data));
      this.ui.last.text(this.lastRecord(data));
      this.ui.total.text(data.total);
    }
  },

  firstRecord : function(data) {
    return data.length ? ((data.page || 1) - 1) * data.pageSize + 1 : 0;
  },

  lastRecord : function(data) {
    return data.length ? this.firstRecord(data) + data.length - 1 : 0;
  }
});

Tableling.Plain.PaginationView = Tableling.Plain.Table.prototype.paginationView = Tableling.Module.extend({
    
  template : _.template('<div class="pagination"><ul><li class="first"><a href="#">&lt;&lt;</a></li><li class="previous"><a href="#">&lt;</a></li><li class="next"><a href="#">&gt;</a></li><li class="last"><a href="#">&gt;&gt;</a></li></ul></div>'),

  ui : {
    first : '.first',
    previous : '.previous',
    next : '.next',
    last : '.last'
  },

  events : {
    'click .first:not(.disabled)' : 'goToFirstPage',
    'click .previous:not(.disabled)' : 'goToPreviousPage',
    'click .next:not(.disabled)' : 'goToNextPage',
    'click .last:not(.disabled)' : 'goToLastPage'
  },

  refresh : function(data) {
    if (!data) {
      this.ui.first.addClass('disabled');
      this.ui.previous.addClass('disabled');
      this.ui.next.addClass('disabled');
      this.ui.last.addClass('disabled');
    } else {
      this.data = data;
      this.enable(this.ui.first, this.getPage(data) > 1);
      this.enable(this.ui.previous, this.getPage(data) > 1);
      this.enable(this.ui.next, this.getPage(data) < this.numberOfPages(data));
      this.enable(this.ui.last, this.getPage(data) < this.numberOfPages(data));
    }
  },

  enable : function(el, enabled) {
    el.removeClass('disabled');
    if (!enabled) {
      el.addClass('disabled');
    }
  },

  numberOfPages : function() {
    return Math.ceil(this.data.total / this.data.pageSize);
  },

  goToFirstPage : function() {
    this.goToPage(1);
  },

  goToPreviousPage : function() {
    this.goToPage(this.getPage(this.data) - 1);
  },

  goToNextPage : function() {
    this.goToPage(this.getPage(this.data) + 1);
  },

  goToLastPage : function() {
    this.goToPage(this.numberOfPages());
  },

  goToPage : function(n) {
    this.vent.trigger('table:update', { page : n });
  },

  getPage : function(data) {
    return data.page || 1;
  }
});