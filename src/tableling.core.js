// Tableling
// ---------
//
// A tableling table is a Marionette layout which fetches data
// from a Backbone collection. It is controlled with an EventAggregator.
Tableling.Table = Backbone.Marionette.Layout.extend({

  className: 'tableling',

  // Default table options can be overriden by subclasses.
  config: {
    page: 1
  },

  initialize: function(options) {
    options = options || {};

    if (!this.getCollection(this.getResource())) {
      throw new Error('Missing collection; pass it to the constructor or override #getCollection');
    }

    // Table options can also be overriden for each instance at construction.
    this.config = _.extend(_.clone(this.config || {}), _.result(options, 'config') || {});

    // We use an event aggregator to manage the layout and its components.
    // You can use your own by passing a `vent` option.
    this.vent = options.vent || new Backbone.Wreqr.EventAggregator();

    this.fetchOptions = _.extend(_.clone(this.fetchOptions || {}), _.result(options, 'fetchOptions') || {});

    if (typeof(options.autoUpdate) != 'undefined') {
      this.autoUpdate = options.autoUpdate;
    }

    if (typeof(this.autoUpdate) == 'undefined') {
      this.autoUpdate = true;
    }

    // Components should trigger the `table:update` event to update
    // the table (e.g. change page size, sort) and fetch the new data.
    this.vent.on('table:update', this.onUpdate, this);

    this.on('item:rendered', this.setup, this);

    if (typeof(this.initializeTable) == 'function') {
      this.initializeTable(options);
    }
  },

  // Called once rendering is complete. By default, it updates the table.
  setup: function() {
    this.ventTrigger('table:setup', this.config);
    if (this.autoUpdate) {
      this.ventTrigger('table:update');
    }
  },

  getResource: function() {
    return this.collection || this.model;
  },

  // Subclasses must return the Backbone.Collection used to fetch data.
  getCollection: function(resource) {
    return this.collection;
  },

  // ### Refreshing the table
  update: function(config, options) {
    this.ventTrigger('table:update', config, options);
  },

  onUpdate: function(config, options) {

    _.each(config || {}, _.bind(this.updateValue, this));

    // Set the `refresh` option to false to update the table configuration
    // without refreshing.
    if (!options || typeof(options.refresh) == 'undefined' || options.refresh) {
      this.refresh();
    }
  },

  updateValue: function(value, key) {
    if (value && value.toString().length) {
      this.config[key] = value;
    } else {
      // Blank values are deleted to avoid sending them in ajax requests.
      delete this.config[key];
    }
  },

  refresh: function() {

    // You can provide `fetchOptions` to add properties to the
    // fetch request.
    //
    //     var MyTable = Tableling.Table.extend({
    //       fetchOptions: {
    //         type: 'POST' // fetch data with POST
    //       }
    //     });
    //
    //     // You can also override for each instance.
    //     new MyTable({
    //       fetchOptions: {
    //         type: 'GET'
    //       }
    //     });
    var options = _.clone(this.fetchOptions);
    options.data = this.requestData();
    options.success = _.bind(this.processResponse, this);
    options.reset = true;

    // `table:refreshing` is triggered every time new data is being fetched.
    // The first argument is the request data.
    this.ventTrigger('table:refreshing', options.data);

    this.getResource().fetch(options);
  },

  // ### Request
  requestData: function() {
    return this.config;
  },

  // ### Response
  processResponse: function(resource, response) {

    this.config.length = this.getCollection(resource).length;

    // Tableling expects the response from a fetch to have a `total` property
    // which is the total number of items (not just in the current page).
    this.config.total = response.total;

    // The server may override the `page` property, for example if the
    // requested page was outside the range of available pages.
    if (response.page) {
      this.config.page = response.page;
    }

    // `tableling:refreshed` is triggered after every refresh. The first argument
    // is the current table configuration with the following additional meta data:
    //
    // * `total` - the total number of items
    // * `length` - the number of items in the current page
    this.ventTrigger('table:refreshed', this.config);
  },

  // Triggers an event in the event aggregator. If `Tableling.debug` is set, it also
  // logs the event and its arguments.
  ventTrigger: function() {

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

  parse: function(response) {
    return response.data;
  }
});

// Implementations
// ---------------
//
// <a href="tableling.bootstrap.html">tableling.bootstrap</a> provides views styled
// with [Twitter Bootstrap](http://twitter.github.com/bootstrap/) classes.
