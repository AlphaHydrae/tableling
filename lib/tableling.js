/*!
 * Tableling v0.0.4
 * Copyright (c) 2012 Simon Oulevay (Alpha Hydrae)
 * Distributed under MIT license
 * https://github.com/AlphaHydrae/tableling
 */

(function(module) {

// Tableling
// ---------
//
// A tableling table is a Marionette layout which fetches data
// from a Backbone collection. It is controlled with an EventAggregator.
module.Tableling = Tableling = Backbone.Marionette.Layout.extend({

  className: 'tableling',

  // Default table options can be overriden by subclasses.
  tableling : {
    page : 1,
    pageSize : 15
  },

  initialize : function(options) {
    options = options || {};

    // Table options can also be overriden for each instance by passing
    // a `tableling` object in the options.
    this.tableling = _.extend(_.clone(this.tableling), options.tableling || {});

    // We use an event aggregator to manage the layout and its components.
    // You can use your own by passing a `vent` option.
    this.vent = options.vent || new Backbone.Marionette.EventAggregator();

    // Components should trigger the `tableling:update` event to update
    // the table (e.g. change page size, sort) and fetch the new data.
    this.vent.on('tableling:update', this.update, this);

    this.on('render', this.setup, this);
  },

  // Called once rendering is complete. By default, it updates the table.
  setup : function() {
    this.vent.trigger('tableling:update');
  },

  // Subclasses must return the Backbone.Collection used to fetch data.
  getCollection : function() {
    throw new Error('#getCollection not implemented. It should return the Backbone.Collection instance used to fetch data.');
  },

  // ### Refreshing the table
  update : function(config, options) {

    _.each(this.filterConfig(config || {}), _.bind(this.updateValue, this));

    // Set the `refresh` option to false to update the table configuration
    // without refreshing.
    if (!options || typeof(options.refresh) == 'undefined' || options.refresh) {
      this.refresh();
    }
  },

  updateValue : function(value, key) {
    if (value && value.toString().length) {
      this.tableling[key] = value;
    } else {
      // Blank values are deleted to avoid sending them in ajax requests.
      delete this.tableling[key];
    }
  },

  refresh : function() {

    // `tableling:refreshing` is triggered every time new data is being fetched.
    // The first argument is the request data.
    var data = this.requestData();
    this.ventTrigger('tableling:refreshing', data);

    // You can provide a `tableling.request` option to add properties to the
    // fetch request.
    //
    //     var MyTable = Tableling.extend({
    //       tableling : {
    //         type : 'POST' // fetch data with POST
    //       }
    //     });
    this.getCollection().fetch(_.extend(this.tableling.request || {}, {
      data: data,
      success: _.bind(this.processResponse, this)
    }));
  },

  // ### Response
  processResponse : function(collection, response) {

    this.tableling.length = collection.length;

    // Tableling expects the response from a fetch to have a `total` property
    // which is the total number of items (not just in the current page).
    this.tableling.total = response.total;

    // `tableling:refreshed` is triggered after every refresh. The first argument
    // is the current table configuration with the following additional meta data:
    //
    // * `total` - the total number of items
    // * `length` - the number of items in the current page
    this.ventTrigger('tableling:refreshed', this.filterConfig(this.tableling, true));
  },

  // ### Request
  // Builds the request data. Subclasses may override this if they need to
  // send additional data.
  requestData : function() {
    return this.filterConfig(this.tableling);
  },

  // ### Utilities
  // Whitelists the given configuration to contain only table configuration properties.
  // Pass `true` as the second argument to include meta data (i.e. total & length).
  filterConfig : function(config, all) {
    if (all) {
      return _.pick(config, 'page', 'pageSize', 'quickSearch', 'sort', 'length', 'total');
    } else {
      return _.pick(config, 'page', 'pageSize', 'quickSearch', 'sort');
    }
  },

  // Triggers an event in the event aggregator. If `Tableling.debug` is set, it also
  // logs the event and its arguments.
  ventTrigger : function() {

    var args = Array.prototype.slice.call(arguments);
    this.vent.trigger.apply(this.vent, args);

    if (Tableling.debug) {
      console.log(args.shift() + ' - ' + JSON.stringify(args));
    }
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

// Tableling.Modular
// -----------------
//
// Tableling subclass which splits functionality into *modules*
// and handles rendering.
Tableling.Modular = Tableling.extend({

  // The list of module names must be specified by subclasses.
  modules : [],

  // Modules are set up after rendering, before refreshing.
  setup : function() {

    this.moduleViews = {};
    _.each(this.modules, _.bind(this.setupModule, this));

    Tableling.prototype.setup.call(this);
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

// ### Utilities
_.extend(Tableling.Modular, {

  // **createModule** creates an item view that is automatically bound
  // to the layout's event aggregator.
  createModule : function(options) {
    return Backbone.Marionette.ItemView.extend(_.extend({

      initialize : function(options) {
        this.vent = options.vent;

        // The `refresh` method of the view is called once the view is rendered
        // and every time the table is refreshed.
        this.vent.on('tableling:refreshed', this.refresh, this);
        this.on('render', this.refresh, this);
      },

      // Call `update` to trigger an update of the table.
      update : function() {
        this.vent.trigger('tableling:update', this.config());
      },

      // Implementations should override this to stay up to date with
      // the table state. Note that the data parameter will be undefined
      // on the first refresh when the view is rendered.
      refresh : function(data) {
      },

      // New table configuration to be sent on updates. For example,
      // a page size view might update the `pageSize` property.
      config : function() {
        return {};
      }
    }, options));
  },

  // **createFieldModule** creates a basic module with a single form field.
  // It comes with sensible defaults and only requires a `template` parameter.
  createFieldModule : function(name, options) {

    var definition = {
      
      // The name attribute of the form field is expected to be the name of
      // the module, e.g. `pageSize`.
      ui : {
        field : '[name="' + name + '"]'
      },

      events : {},

      // The table property updated is the one with the same name as the module.
      config : function() {
        var config = {};
        config[name] = this.ui.field.val();
        return config;
      }
    };

    // The `change` even triggers an update.
    definition.events['change [name="' + name + '"]'] = 'update';

    return Tableling.Modular.createModule(_.extend(definition, options));
  }

  // This is how a `PageSizeView` module might be implemented:
  //
  //     var html = '<input type="text" name="pageSize" />';
  //
  //     var PageSizeView =
  //       Tableling.Modular.createFieldModule('pageSize', {
  //
  //         template : _.template(html)
  //     });
  //
  // When the value of the input field changes, the event aggregator will
  // receive a `tableling:update` event with the `pageSize` property set
  // to that value.
});

})(this);

// Implementations
// ---------------
//
// <a href="tableling-bootstrap.html">tableling-bootstrap</a> provides views styled
// with [Twitter Bootstrap](http://twitter.github.com/bootstrap/) classes.
