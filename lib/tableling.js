/*!
 * Tableling v0.0.15
 * Copyright (c) 2012-2013 Simon Oulevay (Alpha Hydrae) <hydrae.alpha@gmail.com>
 * Distributed under MIT license
 * https://github.com/AlphaHydrae/tableling
 */
Backbone.Tableling = Tableling = (function(Backbone, _, $){

  var Tableling = {
    version : "0.0.15"
  };

  // Tableling
  // ---------
  //
  // A tableling table is a Marionette layout which fetches data
  // from a Backbone collection. It is controlled with an EventAggregator.
  Tableling.Table = Backbone.Marionette.Layout.extend({
  
    className: 'tableling',
  
    // Default table options can be overriden by subclasses.
    config : {
      page : 1
    },
  
    initialize : function(options) {
      options = options || {};
  
      // Table options can also be overriden for each instance at construction.
      this.config = _.extend(_.clone(this.config || {}), _.result(options, 'config') || {});
  
      // We use an event aggregator to manage the layout and its components.
      // You can use your own by passing a `vent` option.
      this.vent = options.vent || new Backbone.Wreqr.EventAggregator();
  
      this.fetchOptions = _.extend(_.clone(this.fetchOptions || {}), _.result(options, 'fetchOptions') || {});
  
      // Components should trigger the `table:update` event to update
      // the table (e.g. change page size, sort) and fetch the new data.
      this.vent.on('table:update', this.update, this);
  
      this.on('item:rendered', this.setup, this);
    },
  
    // Called once rendering is complete. By default, it updates the table.
    setup : function() {
      this.ventTrigger('table:setup', this.config);
      this.ventTrigger('table:update');
    },
  
    // Subclasses must return the Backbone.Collection used to fetch data.
    getCollection : function() {
      throw new Error('#getCollection not implemented. It should return the Backbone.Collection instance used to fetch data.');
    },
  
    // ### Refreshing the table
    update : function(config, options) {
  
      _.each(config || {}, _.bind(this.updateValue, this));
  
      // Set the `refresh` option to false to update the table configuration
      // without refreshing.
      if (!options || typeof(options.refresh) == 'undefined' || options.refresh) {
        this.refresh();
      }
    },
  
    updateValue : function(value, key) {
      if (value && value.toString().length) {
        this.config[key] = value;
      } else {
        // Blank values are deleted to avoid sending them in ajax requests.
        delete this.config[key];
      }
    },
  
    refresh : function() {
  
      // You can provide `fetchOptions` to add properties to the
      // fetch request.
      //
      //     var MyTable = Tableling.Table.extend({
      //       fetchOptions : {
      //         type : 'POST' // fetch data with POST
      //       }
      //     });
      //
      //     // You can also override for each instance.
      //     new MyTable({
      //       fetchOptions : {
      //         type : 'GET'
      //       }
      //     });
      var options = _.clone(this.fetchOptions);
      options.data = this.requestData();
      options.success = _.bind(this.processResponse, this);
  
      // `table:refreshing` is triggered every time new data is being fetched.
      // The first argument is the request data.
      this.ventTrigger('table:refreshing', options.data);
  
      this.getCollection().fetch(options);
    },
  
    // ### Request
    requestData : function() {
      return this.config;
    },
  
    // ### Response
    processResponse : function(collection, response) {
  
      this.config.length = collection.length;
  
      // Tableling expects the response from a fetch to have a `total` property
      // which is the total number of items (not just in the current page).
      this.config.total = response.total;
  
      // `tableling:refreshed` is triggered after every refresh. The first argument
      // is the current table configuration with the following additional meta data:
      //
      // * `total` - the total number of items
      // * `length` - the number of items in the current page
      this.ventTrigger('table:refreshed', this.config);
    },
  
    // Triggers an event in the event aggregator. If `Tableling.debug` is set, it also
    // logs the event and its arguments.
    ventTrigger : function() {
  
      var args = Array.prototype.slice.call(arguments);
      if (Tableling.debug) {
        console.log(_.first(args) + ' - ' + JSON.stringify(args.slice(1)));
      }
  
      this.vent.trigger.apply(this.vent, args);
    }
  });
  
  // Tableling.Collection
  // --------------------
  //
  // Tableling expects fetch responses to have a `total` property in addition
  // to the model data. You can extend this Backbone.Collection subclass which
  // expects the following response format:
  //
  //     {
  //       "total": 12,
  //       "data": [
  //         { /* ... model data ... */ },
  //         { /* ... model data ... */ }
  //       ]
  //     }
  Tableling.Collection = Backbone.Collection.extend({
  
    parse : function(response) {
      return response.data;
    }
  });
  
  // Implementations
  // ---------------
  //
  // <a href="tableling.bootstrap.html">tableling.bootstrap</a> provides views styled
  // with [Twitter Bootstrap](http://twitter.github.com/bootstrap/) classes.
  
  // Tableling.Modular
  // -----------------
  //
  // Tableling subclass which splits functionality into *modules*
  // and handles rendering.
  Tableling.Modular = Tableling.Table.extend({
  
    // The list of module names must be specified by subclasses.
    modules : [],
  
    // Modules are set up after rendering, before refreshing.
    setup : function() {
  
      this.moduleViews = {};
      _.each(this.modules, _.bind(this.setupModule, this));
  
      Tableling.Table.prototype.setup.call(this);
    },
  
    // ### Modules
    // Each module is identified by a name, for example `pageSize`.
    setupModule : function(name) {
  
      // The layout must have a region named after the module, e.g. `pageSizeRegion`.
      var region = name + 'Region';
  
      // It must have a view class, e.g. `pageSizeView`, which will be shown into
      // the region.
      var viewClass = this[name + 'View'];
  
      // When instantiated, the view class will be passed the event
      // aggregator as the `vent` option. Additional options can be
      // given named after the view class, e.g. `pageSizeViewOptions`.
      var options = _.extend(this[name + 'ViewOptions'] || {}, { vent: this.vent });
  
      var view = new viewClass(options);
  
      // Module view instances are stored by name in the `moduleViews` property
      // for future reference.
      this.moduleViews[name] = view;
  
      this[region].show(view);
      return view;
    },
  
    // By default, a modular table expects a `table` module which
    // should have a collection (e.g. a Marionette CompositeView or
    // CollectionView). If your subclass does not have that, it
    // should override this method to return the Backbone.Collection
    // used to fetch table data.
    getCollection : function() {
      return this.moduleViews.table.collection;
    }
  });
  
  // ### Example
  // This is how a `PageSizeView` module might be registered in a subclass:
  //
  //     var MyTable = Tableling.Modular.extend({
  //
  //       modules : [ 'pageSize' ],
  //
  //       pageSizeView : PageSizeView,
  //       pageSizeViewOptions : {
  //         itemView : PageSizeItem
  //       },
  //
  //       regions : {
  //         pageSizeRegion : '.pageSize'
  //       }
  //     });
  
  // Tableling.Module
  // ----------------
  //
  // A module is an item view that is automatically bound to the table's
  // event aggregator.
  Tableling.Module = Backbone.Marionette.ItemView.extend({
  
    initialize : function(options) {
      this.vent = options.vent;
  
      // The `setup` method of the view is called when the table
      // is first set up.
      this.vent.on('table:setup', this.setup, this);
  
      // The `refresh` method of the view is called every time the table
      // is refreshed.
      this.vent.on('table:refreshed', this.refresh, this);
    },
  
    // Call `update` to trigger an update of the table.
    update : function() {
      this.vent.trigger('table:update', this.config());
    },
  
    // Implementations should override this to set initial values.
    setup : function(config) {
    },
  
    // Implementations should override this to stay up to date with
    // the table state.
    refresh : function(config) {
    },
  
    // New table configuration to be sent on updates. For example,
    // a page size view might update the `pageSize` property.
    config : function() {
      return {};
    }
  });
  
  // Tableling.FieldModule
  // ---------------------
  //
  // A basic module with a single form field. It comes with sensible
  // defaults and only requires a `name` and a `template` parameter.
  Tableling.FieldModule = Tableling.Module.extend({
  
    // TODO: check name
  
    initialize : function(options) {
  
      Tableling.Module.prototype.initialize.call(this, options);
  
      if (!this.ui) {
        this.ui = {};
      }
      // The name attribute of the form field is the same as the
      // module's, e.g. `pageSize`.
      this.ui.field = '[name="' + this.name + '"]';
  
      if (!this.events) {
        this.events = {};
      }
      this.events['change [name="' + this.name + '"]'] = 'update';
    },
  
    setup : function(config) {
      this.ui.field.val(config[this.name]);
      this.vent.trigger('table:update', this.config(), { refresh : false });
    },
  
    // The table property updated is the one with the same name as the module.
    config : function() {
      var config = {};
      config[this.name] = this.ui.field.val();
      return config;
    }
  });
  
  // This is how a `PageSizeView` module might be implemented:
  //
  //     var html = '<input type="text" name="pageSize" />';
  //
  //     var PageSizeView = Tableling.FieldModule.extend({
  //         name : 'pageSize'
  //         template : _.template(html)
  //     });
  //
  // When the value of the input field changes, the event aggregator will
  // receive a `tableling:update` event with the `pageSize` property set
  // to that value.
  
  Tableling.Plain = {};
  
  Tableling.Plain.Table = Tableling.Modular.extend({
  
    className: 'tableling',
    modules : [ 'table', 'pageSize', 'quickSearch', 'info', 'page' ],
    template : _.template('<div class="header"><div class="pageSize" /><div class="quickSearch" /></div><div class="table" /><div class="footer"><div class="info" /><div class="page" /></div>'),
  
    regions : {
      tableRegion : '.table',
      pageSizeRegion : '.pageSize',
      quickSearchRegion : '.quickSearch',
      infoRegion : '.info',
      pageRegion : '.page'
    }
  });
  
  Tableling.Plain.TableView = Backbone.Marionette.CompositeView.extend({
  
    events : {
      'click thead th.sorting' : 'updateSort',
      'click thead th.sorting-asc' : 'updateSort',
      'click thead th.sorting-desc' : 'updateSort'
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
  
  Tableling.Plain.PageView = Tableling.Plain.Table.prototype.pageView = Tableling.Module.extend({
      
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
  
  Tableling.Bootstrap = {};
  
  Tableling.Bootstrap.Table = Tableling.Plain.Table.extend({
    template : _.template('<div class="header"><div class="pageSize pull-left" /><div class="quickSearch pull-right" /></div><div class="table" /><div class="footer"><div class="info pull-left" /><div class="page pull-right" /></div>')
  });
  
  Tableling.Bootstrap.TableView = Tableling.Plain.TableView.extend({});
  
  Tableling.Bootstrap.PageSizeView = Tableling.Bootstrap.Table.prototype.pageSizeView = Tableling.Plain.PageSizeView.extend({
    template : _.template('<select name="pageSize" class="input-mini"><option>5</option><option>10</option><option>15</option></select> entries per page')
  });
  
  Tableling.Bootstrap.QuickSearchView = Tableling.Bootstrap.Table.prototype.quickSearchView = Tableling.Plain.QuickSearchView.extend({});
  
  Tableling.Bootstrap.InfoView = Tableling.Bootstrap.Table.prototype.infoView = Tableling.Plain.InfoView.extend({});
  
  Tableling.Bootstrap.PageView = Tableling.Bootstrap.Table.prototype.pageView = Tableling.Plain.PageView.extend({});
  

  return Tableling;

})(Backbone, _, $ || window.jQuery || window.Zepto || window.ender);