
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

    it('should call #setup', function() {
      spyOn(Table.prototype, 'setup');
      makeTable().render();
      expect(table.setup).toHaveBeenCalled();
    });

    it('should trigger tableling:update', function() {
      var spy = jasmine.createSpy();
      vent.on('tableling:update', spy);
      makeTable().render();
      expect(spy).toHaveBeenCalledWith();
    });
  });
});
