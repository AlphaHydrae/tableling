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

    // The `refresh` method of the view is called once the view is rendered
    // and every time the table is refreshed.
    this.vent.on('table:refreshed', this.refresh, this);
    this.on('render', this.refresh, this);
  },

  // Call `update` to trigger an update of the table.
  update : function() {
    this.vent.trigger('table:update', this.config());
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
});

// Tableling.FieldModule
// ---------------------
//
// A basic module with a single form field. It comes with sensible
// defaults and only requires a `name` and a `template` parameter.
Tableling.FieldModule = Tableling.Module.extend({

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