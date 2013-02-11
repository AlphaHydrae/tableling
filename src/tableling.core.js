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
