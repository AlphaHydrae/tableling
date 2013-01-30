
describe('table options', function() {

  describe('when a table is created without options', function() {

    var table;

    beforeEach(function() {
      table = new Tableling.Table();
    });

    it('should start at page 1', function() {
      expect(table.config.page).toBe(1);
    });

    it('should copy the default options', function() {
      expect(table.config).not.toBe(Tableling.Table.prototype.config);
      expect(table.config).toEqual(Tableling.Table.prototype.config);
    });

    it('should have an event aggregator', function() {
      expect(table.vent).not.toBeNull();
      expect(table.vent).toBeInstanceOf(Backbone.Wreqr.EventAggregator);
    });
  });

  describe('when a table is created with options', function() {

    it('should copy the given options', function() {
      var options = { config : { page: 2, pageSize: 3, quickSearch: '4', sort: [ '5 asc' ] } };
      var table = new Tableling.Table(options);
      expect(table.config).not.toBe(options.config);
      expect(table.config).toEqual(options.config);
    });

    it('should copy unknown options', function() {
      var options = { config : { a: '1', b: 2, c: true } };
      var table = new Tableling.Table(options);
      expect(table.config.a).toEqual('1');
      expect(table.config.b).toEqual(2);
      expect(table.config.c).toBe(true);
    });

    it('should use the given event aggregator', function() {
      var vent = new Backbone.Wreqr.EventAggregator();
      var table = new Tableling.Table({ vent: vent });
      expect(table.vent).toBe(vent);
    });
  });

  describe('when a table is subclassed', function() {

    var Subclass = Tableling.Table.extend({
      config : {
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
      expect(table.config).not.toBe(Subclass.prototype.config);
      expect(table.config).toEqual(Subclass.prototype.config);
      expect(table.config).not.toEqual(Tableling.Table.prototype.config);
    });
  });
});
