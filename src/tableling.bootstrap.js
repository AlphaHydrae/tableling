Tableling.Bootstrap = {};

Tableling.Bootstrap.Table = Tableling.Plain.Table.extend({
  template : _.template('<div class="header"><div class="pageSize pull-left" /><div class="quickSearch pull-right" /></div><div class="table" /><div class="footer"><div class="info pull-left" /><div class="page pull-right" /></div>')
});

Tableling.Bootstrap.TableView = Tableling.Plain.TableView.extend({});

Tableling.Bootstrap.PageSizeView = Tableling.Bootstrap.Table.prototype.pageSizeView = Tableling.Plain.PageSizeView.extend({

  tagName : 'form',
  className : 'form-inline',
  attributes : {
    role : 'form'
  },
  template : function(data) {
    return _.template('<div class="formGroup"><select name="pageSize" class="form-control"><option>5</option><option>10</option><option>15</option></select> <%- entries %></div>', data);
  }
});

Tableling.Bootstrap.QuickSearchView = Tableling.Bootstrap.Table.prototype.quickSearchView = Tableling.Plain.QuickSearchView.extend({

  tagName : 'form',
  className : 'form-inline',
  attributes : {
    role : 'form'
  },
  template : function(data) {
    return _.template('<div class="formGroup"><input type="text" name="quickSearch" class="form-control" placeholder="<%- quickSearch %>" /></div>', data);
  }
});

Tableling.Bootstrap.InfoView = Tableling.Bootstrap.Table.prototype.infoView = Tableling.Plain.InfoView.extend({});

Tableling.Bootstrap.PageView = Tableling.Bootstrap.Table.prototype.pageView = Tableling.Plain.PageView.extend({});
