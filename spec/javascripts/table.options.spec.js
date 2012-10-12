
describe('table options', function() {

  describe('when a table is created without options', function() {

    var table;

    beforeEach(function() {
      table = new Tableling.Table();
    });

    it('should start at page 1', function() {
      expect(table.tableling.page).toBe(1);
    });

    it('should have a page size of 15', function() {
      expect(table.tableling.pageSize).toBe(15);
    });

    it('should copy the default options', function() {
      expect(table.tableling).not.toBe(Tableling.Table.prototype.tableling);
      expect(table.tableling).toEqual(Tableling.Table.prototype.tableling);
    });

    it('should have an event aggregator', function() {
      expect(table.vent).not.toBeNull();
      expect(table.vent).toBeInstanceOf(Backbone.Marionette.EventAggregator);
    });
  });

  describe('when a table is created with options', function() {

    it('should copy the given options', function() {
      var options = { page: 2, pageSize: 3, quickSearch: '4', sort: [ '5 asc' ] };
      var table = new Tableling.Table(options);
      expect(table.tableling).not.toBe(options);
      expect(table.tableling).toEqual(options);
    });

    it('should not copy unknown options', function() {
      var options = { a: '1', b: 2, c: true };
      var table = new Tableling.Table(options);
      expect(table.tableling.a).toBeUndefined();
      expect(table.tableling.b).toBeUndefined();
      expect(table.tableling.c).toBeUndefined();
    });

    it('should use the given event aggregator', function() {
      var vent = new Backbone.Marionette.EventAggregator();
      var table = new Tableling.Table({ vent: vent });
      expect(table.vent).toBe(vent);
    });
  });

  describe('when a table is subclassed', function() {

    var Subclass = Tableling.Table.extend({
      tableling : {
        page : 42,
        pageSize : 666,
        quickSearch : '1337'
      }
    });

    var table;

    beforeEach(function() {
      table = new Subclass();
    });

    it('should copy the overriden options', function() {
      expect(table.tableling).not.toBe(Subclass.prototype.tableling);
      expect(table.tableling).toEqual(Subclass.prototype.tableling);
      expect(table.tableling).not.toEqual(Tableling.Table.prototype.tableling);
    });
  });
});
