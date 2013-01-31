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
