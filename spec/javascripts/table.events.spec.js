
describe('table events', function() {

  var Collection = Backbone.Collection.extend({
    sync : function() {
      return { total : 0, data : [] };
    }
  });

  var collection = new Collection();

  var Table = Tableling.Table.extend({

    template : _.template('<div />'),

    getCollection : function() {
      return collection;
    }
  });

  describe('when a table is rendered', function() {

    var vent = new Backbone.Marionette.EventAggregator();
    var table;
    var makeTable = function() {
      return table = new Table({ vent : vent });
    };

    var order;
    vent.on('tableling:setup', function() { order.push('tableling:setup'); });
    vent.on('tableling:update', function() { order.push('tableling:update'); });

    beforeEach(function() {
      order = [];
    });

    it('should call #setup', function() {
      spyOn(Table.prototype, 'setup');
      makeTable().render();
      expect(table.setup).toHaveBeenCalled();
    });

    it('should trigger tableling:setup and tableling:update in that order', function() {
      makeTable().render();
      expect(order).toEqual([ 'tableling:setup', 'tableling:update' ]);
    });

    it('should trigger tableling:setup with its configuration', function() {
      var args;
      vent.on('tableling:setup', function() { args = Array.prototype.slice.call(arguments); });
      makeTable().render();
      expect(args).toEqual([ Tableling.Table.prototype.tableling ]);
    });
  });
});
