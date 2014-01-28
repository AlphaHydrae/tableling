
describe('table events', function() {

  var Collection = Backbone.Collection.extend({
    sync: function() {
      return { total: 0, data: [] };
    }
  });

  var collection = new Collection();

  var Table = Tableling.Table.extend({

    template: _.template('<div />'),

    getCollection: function() {
      return collection;
    }
  });

  describe('when a table is rendered', function() {

    var vent = new Backbone.Wreqr.EventAggregator();
    var table;
    var makeTable = function() {
      return table = new Table({ vent: vent });
    };

    var order;
    vent.on('table:setup', function() { order.push('table:setup'); });
    vent.on('table:update', function() { order.push('table:update'); });

    beforeEach(function() {
      order = [];
    });

    it('should call #setup', function() {
      spyOn(Table.prototype, 'setup');
      makeTable().render();
      expect(table.setup).toHaveBeenCalled();
    });

    it('should trigger table:setup and table:update in that order', function() {
      makeTable().render();
      expect(order).toEqual([ 'table:setup', 'table:update' ]);
    });

    it('should trigger table:setup with its configuration', function() {
      var args;
      vent.on('table:setup', function() { args = Array.prototype.slice.call(arguments); });
      makeTable().render();
      expect(args).toEqual([ Tableling.Table.prototype.config ]);
    });
  });
});
